import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { D1Database, KVNamespace } from '@cloudflare/workers-types';
import newsRoutes from './routes/news.js';
import { fetchAllSources } from './services/rss-fetcher.js';
import { processNewsWithAI } from './services/ai-pipeline.js';
import { generateDailyBriefing } from './services/briefing-generator.js';
import {
  insertNewsItems,
  deleteExpiredNews,
  getRecentNewsForBriefing,
  getLatestBriefing,
  insertBriefing,
} from './db/queries.js';
import { setToCache, buildCacheKey } from './utils/cache.js';

type Bindings = {
  DB: D1Database;
  CACHE: KVNamespace;
  ANTHROPIC_API_KEY: string;
  ENVIRONMENT: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS — 允許 Chrome Extension 呼叫
app.use(
  '*',
  cors({
    origin: (origin) => {
      if (!origin) return '*';
      if (origin.startsWith('chrome-extension://')) return origin;
      if (origin === 'http://localhost:3000') return origin;
      return null;
    },
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  })
);

// Health Check
app.get('/api/v1/health', (c) =>
  c.json({ success: true, data: { status: 'ok', env: c.env.ENVIRONMENT } })
);

// 新聞路由
app.route('/api/v1/news', newsRoutes);

// 404
app.notFound((c) =>
  c.json({ success: false, error: { code: 'NOT_FOUND', message: '找不到此路由' } }, 404)
);

// 全域錯誤處理
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json(
    { success: false, error: { code: 'INTERNAL_ERROR', message: '伺服器錯誤' } },
    500
  );
});

// Scheduled Handler — Cron Trigger 每 30 分鐘執行
async function handleScheduled(env: Bindings): Promise<void> {
  console.log('Cron: 開始抓取新聞...');

  // 1. 抓取所有 RSS 來源
  const rawItems = await fetchAllSources();
  console.log(`Cron: 抓取到 ${rawItems.length} 則新聞`);

  // 2. AI 處理
  const processedItems = await processNewsWithAI(rawItems, env);
  console.log(`Cron: AI 處理完成 ${processedItems.length} 則`);

  // 3. 存入 D1
  await insertNewsItems(env.DB, processedItems);
  console.log('Cron: 已存入資料庫');

  // 4. 清理過期新聞
  await deleteExpiredNews(env.DB);
  console.log('Cron: 清理過期新聞完成');
}

// Briefing Cron — 每天 UTC 23:00（台灣時間 07:00）
async function handleBriefingCron(env: Bindings): Promise<void> {
  console.log('BriefingCron: 開始生成每日簡報...');
  const today = new Date().toISOString().slice(0, 10);

  // 今天已有簡報則跳過
  const existing = await getLatestBriefing(env.DB);
  if (existing?.date === today) {
    console.log('BriefingCron: 今日簡報已存在，跳過');
    return;
  }

  const newsItems = await getRecentNewsForBriefing(env.DB);
  try {
    const briefing = await generateDailyBriefing(newsItems, env.ANTHROPIC_API_KEY);
    await insertBriefing(env.DB, briefing);
    await setToCache(env.CACHE, buildCacheKey('briefing', today), { briefing }, 3600);
    console.log('BriefingCron: 簡報生成成功');
  } catch (err) {
    console.error('BriefingCron: 生成失敗', err);
  }
}

export default {
  fetch: app.fetch,
  async scheduled(
    event: ScheduledEvent,
    env: Bindings,
    ctx: ExecutionContext
  ): Promise<void> {
    if (event.cron === '0 23 * * *') {
      ctx.waitUntil(handleBriefingCron(env));
    } else {
      ctx.waitUntil(handleScheduled(env));
    }
  },
};
