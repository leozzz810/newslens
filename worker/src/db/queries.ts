import type { D1Database } from '@cloudflare/workers-types';
import { ALL_CATEGORIES, type NewsItem, type Category, type TrendingTopic, type DailyBriefing } from '@newslens/shared';

const VALID_SENTIMENTS = new Set(['positive', 'neutral', 'negative'] as const);
type Sentiment = 'positive' | 'neutral' | 'negative';

function safeCategory(value: string): Category {
  return (ALL_CATEGORIES as readonly string[]).includes(value)
    ? (value as Category)
    : 'technology';
}

function safeSentiment(value: string): Sentiment {
  return VALID_SENTIMENTS.has(value as Sentiment) ? (value as Sentiment) : 'neutral';
}

function safeTags(value: string): string[] {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) return parsed.filter((t): t is string => typeof t === 'string');
  } catch {
    // 損毀的 JSON — 回傳空陣列
  }
  return [];
}

export interface DbNewsRow {
  id: string;
  title: string;
  summary: string | null;
  url: string;
  source: string;
  source_url: string | null;
  category: string;
  image_url: string | null;
  published_at: string;
  ai_score: number;
  sentiment: string;
  tags: string;
  language: string;
}

function rowToNewsItem(row: DbNewsRow): NewsItem {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary ?? '',
    url: row.url,
    source: row.source,
    sourceUrl: row.source_url ?? undefined,
    category: safeCategory(row.category),
    imageUrl: row.image_url ?? undefined,
    publishedAt: row.published_at,
    aiScore: row.ai_score,
    sentiment: safeSentiment(row.sentiment),
    tags: safeTags(row.tags),
  };
}

export async function getLatestNews(
  db: D1Database,
  options: { category?: string; limit: number; cursor?: string }
): Promise<{ items: NewsItem[]; nextCursor?: string }> {
  const { category, limit, cursor } = options;

  let query: string;
  let bindings: (string | number)[];

  if (category && cursor) {
    query = `
      SELECT * FROM news_items
      WHERE category = ? AND published_at < ?
      ORDER BY published_at DESC LIMIT ?
    `;
    bindings = [category, cursor, limit + 1];
  } else if (category) {
    query = `
      SELECT * FROM news_items
      WHERE category = ?
      ORDER BY published_at DESC LIMIT ?
    `;
    bindings = [category, limit + 1];
  } else if (cursor) {
    query = `
      SELECT * FROM news_items
      WHERE published_at < ?
      ORDER BY published_at DESC LIMIT ?
    `;
    bindings = [cursor, limit + 1];
  } else {
    query = `
      SELECT * FROM news_items
      ORDER BY published_at DESC LIMIT ?
    `;
    bindings = [limit + 1];
  }

  const result = await db.prepare(query).bind(...bindings).all<DbNewsRow>();
  const rows = result.results;

  let nextCursor: string | undefined;
  if (rows.length > limit) {
    rows.pop();
    nextCursor = rows[rows.length - 1]?.published_at;
  }

  return { items: rows.map(rowToNewsItem), nextCursor };
}

export async function insertNewsItems(
  db: D1Database,
  items: Omit<NewsItem, 'isBookmarked' | 'isRead'>[]
): Promise<void> {
  if (items.length === 0) return;

  const stmts = items.map((item) =>
    db
      .prepare(
        `INSERT OR IGNORE INTO news_items
         (id, title, summary, url, source, source_url, category, image_url, published_at, ai_score, sentiment, tags, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '+30 days'))`
      )
      .bind(
        item.id,
        item.title,
        item.summary,
        item.url,
        item.source,
        item.sourceUrl ?? null,
        item.category,
        item.imageUrl ?? null,
        item.publishedAt,
        item.aiScore,
        item.sentiment,
        JSON.stringify(item.tags)
      )
  );

  await db.batch(stmts);
}

export async function deleteExpiredNews(db: D1Database): Promise<void> {
  await db.prepare(`DELETE FROM news_items WHERE expires_at < datetime('now')`).run();
}

// ── 趨勢追蹤 ──────────────────────────────────────────────

interface TagRow {
  id: string;
  tags: string;
  category: string;
}

export async function getTrendingTopics(db: D1Database): Promise<TrendingTopic[]> {
  const result = await db
    .prepare(
      `SELECT id, tags, category FROM news_items
       WHERE published_at > datetime('now', '-24 hours')
       ORDER BY ai_score DESC LIMIT 500`
    )
    .all<TagRow>();

  // JS 層聚合：統計 tag 出現次數
  const tagMap = new Map<string, { count: number; category: string; ids: string[] }>();

  for (const row of result.results) {
    const tags = safeTags(row.tags);
    for (const tag of tags) {
      if (!tag || tag.length < 2) continue;
      const entry = tagMap.get(tag);
      if (entry) {
        entry.count += 1;
        if (entry.ids.length < 3) entry.ids.push(row.id);
      } else {
        tagMap.set(tag, { count: 1, category: row.category, ids: [row.id] });
      }
    }
  }

  return [...tagMap.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([keyword, data]) => ({
      keyword,
      count: data.count,
      category: data.category,
      sampleNewsIds: data.ids,
    }));
}

// ── 每日簡報 ──────────────────────────────────────────────

interface BriefingRow {
  id: string;
  date: string;
  content: string;
  headline: string;
  key_topics: string;
  generated_at: string;
}

function rowToBriefing(row: BriefingRow): DailyBriefing {
  return {
    id: row.id,
    date: row.date,
    headline: row.headline,
    content: row.content,
    keyTopics: safeTags(row.key_topics),
    generatedAt: row.generated_at,
  };
}

export async function getLatestBriefing(db: D1Database): Promise<DailyBriefing | null> {
  const today = new Date().toISOString().slice(0, 10);
  const row = await db
    .prepare(`SELECT * FROM daily_briefings WHERE date = ? LIMIT 1`)
    .bind(today)
    .first<BriefingRow>();
  return row ? rowToBriefing(row) : null;
}

export async function insertBriefing(
  db: D1Database,
  briefing: Omit<DailyBriefing, 'id'>
): Promise<void> {
  const id = `briefing-${briefing.date}`;
  await db
    .prepare(
      `INSERT OR REPLACE INTO daily_briefings
       (id, date, headline, content, key_topics, generated_at, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now', '+7 days'))`
    )
    .bind(
      id,
      briefing.date,
      briefing.headline,
      briefing.content,
      JSON.stringify(briefing.keyTopics),
      briefing.generatedAt
    )
    .run();
}

export async function getRecentNewsForBriefing(db: D1Database): Promise<NewsItem[]> {
  const result = await db
    .prepare(
      `SELECT * FROM news_items
       WHERE published_at > datetime('now', '-24 hours')
       ORDER BY ai_score DESC LIMIT 20`
    )
    .all<DbNewsRow>();
  return result.results.map(rowToNewsItem);
}

// ── 新聞問答 ──────────────────────────────────────────────

export async function searchRelevantNews(
  db: D1Database,
  keywords: string[],
  limit = 10
): Promise<NewsItem[]> {
  if (keywords.length === 0) return [];

  // 對每個關鍵字用 LIKE 搜尋，取聯集後依 ai_score 排序
  const conditions = keywords
    .slice(0, 5) // 最多 5 個關鍵字
    .map(() => `(title LIKE ? OR tags LIKE ?)`)
    .join(' OR ');
  const bindings = keywords
    .slice(0, 5)
    .flatMap((kw) => [`%${kw}%`, `%${kw}%`]);

  const result = await db
    .prepare(
      `SELECT * FROM news_items
       WHERE (${conditions})
         AND published_at > datetime('now', '-48 hours')
       ORDER BY ai_score DESC LIMIT ?`
    )
    .bind(...bindings, limit)
    .all<DbNewsRow>();

  // 去重
  const seen = new Set<string>();
  return result.results
    .filter((row) => {
      if (seen.has(row.id)) return false;
      seen.add(row.id);
      return true;
    })
    .map(rowToNewsItem);
}
