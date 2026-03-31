import { parseRss } from '../utils/rss-parser.js';
import type { RssSource, NewsItem } from '@newslens/shared';
import { RSS_SOURCES } from '../config.js';
import { randomUUID } from 'node:crypto';

const FETCH_TIMEOUT_MS = 10_000;

async function fetchSource(source: RssSource): Promise<NewsItem[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'NewsLens/1.0 RSS Reader',
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
      },
    });

    if (!response.ok) return [];

    const xml = await response.text();
    const parsed = parseRss(xml);

    return parsed.map((item): NewsItem => ({
      id: randomUUID(),
      title: item.title.slice(0, 200),
      summary: '',
      url: item.url,
      source: source.name,
      sourceUrl: source.url,
      category: source.category,
      imageUrl: item.imageUrl,
      publishedAt: item.publishedAt,
      aiScore: 50,
      sentiment: 'neutral',
      tags: [],
    }));
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchAllSources(): Promise<NewsItem[]> {
  const enabledSources = RSS_SOURCES.filter((s) => s.enabled);
  const results = await Promise.allSettled(enabledSources.map(fetchSource));

  const allItems: NewsItem[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allItems.push(...result.value);
    }
  }

  // 去除重複 URL
  const seen = new Set<string>();
  return allItems.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}
