import { Hono } from 'hono';
import { z } from 'zod';
import type { D1Database, KVNamespace } from '@cloudflare/workers-types';
import {
  getLatestNews,
  getTrendingTopics,
  getLatestBriefing,
  searchRelevantNews,
} from '../db/queries.js';
import { getFromCache, setToCache, buildCacheKey } from '../utils/cache.js';
import { answerQuestion, extractKeywords } from '../services/news-qa.js';
import type {
  NewsListResponse,
  TrendingResponse,
  BriefingResponse,
  AskResponse,
  ApiSuccess,
} from '@newslens/shared';

type Bindings = {
  DB: D1Database;
  CACHE: KVNamespace;
  ANTHROPIC_API_KEY: string;
};

const NewsQuerySchema = z.object({
  category: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
  lang: z.string().optional(),
});

const AskBodySchema = z.object({
  question: z.string().min(2).max(500),
});

const news = new Hono<{ Bindings: Bindings }>();

// GET /api/v1/news
news.get('/', async (c) => {
  const parsed = NewsQuerySchema.safeParse(Object.fromEntries(new URL(c.req.url).searchParams));
  if (!parsed.success) {
    return c.json({ success: false, error: { code: 'INVALID_PARAMS', message: '參數格式錯誤' } }, 400);
  }

  const { category, limit, cursor } = parsed.data;
  const cacheKey = buildCacheKey('news', category ?? 'all', cursor ?? 'first');
  const cached = await getFromCache<NewsListResponse>(c.env.CACHE, cacheKey);

  if (cached) {
    return c.json({ success: true, data: cached } as ApiSuccess<NewsListResponse>, 200, { 'X-Cache': 'HIT' });
  }

  const { items, nextCursor } = await getLatestNews(c.env.DB, { category, limit, cursor });
  const data: NewsListResponse = {
    items,
    nextCursor,
    cachedAt: new Date().toISOString(),
    total: items.length,
  };

  await setToCache(c.env.CACHE, cacheKey, data);
  return c.json({ success: true, data } as ApiSuccess<NewsListResponse>, 200, { 'X-Cache': 'MISS' });
});

// GET /api/v1/news/trending
news.get('/trending', async (c) => {
  const cacheKey = buildCacheKey('trending', 'latest');
  const cached = await getFromCache<TrendingResponse>(c.env.CACHE, cacheKey);

  if (cached) {
    return c.json({ success: true, data: cached } as ApiSuccess<TrendingResponse>, 200, { 'X-Cache': 'HIT' });
  }

  const topics = await getTrendingTopics(c.env.DB);
  const data: TrendingResponse = { topics, generatedAt: new Date().toISOString() };

  await setToCache(c.env.CACHE, cacheKey, data, 600); // 10 分鐘
  return c.json({ success: true, data } as ApiSuccess<TrendingResponse>, 200, { 'X-Cache': 'MISS' });
});

// GET /api/v1/news/briefing
news.get('/briefing', async (c) => {
  const today = new Date().toISOString().slice(0, 10);
  const cacheKey = buildCacheKey('briefing', today);
  const cached = await getFromCache<BriefingResponse>(c.env.CACHE, cacheKey);

  if (cached) {
    return c.json({ success: true, data: cached } as ApiSuccess<BriefingResponse>, 200, { 'X-Cache': 'HIT' });
  }

  const briefing = await getLatestBriefing(c.env.DB);
  const data: BriefingResponse = { briefing };

  if (briefing) {
    await setToCache(c.env.CACHE, cacheKey, data, 3600); // 1 小時
  }
  return c.json({ success: true, data } as ApiSuccess<BriefingResponse>);
});

// POST /api/v1/news/ask
news.post('/ask', async (c) => {
  // 簡易 rate limit：每個 IP 每分鐘最多 5 次
  const ip = c.req.header('cf-connecting-ip') ?? 'unknown';
  const rateLimitKey = `ratelimit:ask:${ip}`;
  const current = ((await getFromCache<number>(c.env.CACHE, rateLimitKey)) ?? 0);
  if (current >= 5) {
    return c.json({ success: false, error: { code: 'RATE_LIMITED', message: '請求過於頻繁，請稍後再試' } }, 429);
  }
  await setToCache(c.env.CACHE, rateLimitKey, current + 1, 60);

  const body = await c.req.json().catch(() => ({}));
  const parsed = AskBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, error: { code: 'INVALID_PARAMS', message: '問題格式錯誤' } }, 400);
  }

  const { question } = parsed.data;
  const keywords = extractKeywords(question);
  const context = await searchRelevantNews(c.env.DB, keywords);

  try {
    const answer = await answerQuestion(question, context, c.env.ANTHROPIC_API_KEY);
    const data: AskResponse = answer;
    return c.json({ success: true, data } as ApiSuccess<AskResponse>);
  } catch (err) {
    console.error('QA error:', err);
    return c.json({ success: false, error: { code: 'AI_ERROR', message: '問答服務暫時不可用' } }, 503);
  }
});

export default news;
