-- NewsLens D1 Schema
-- 執行方式：wrangler d1 execute newslens --file=src/db/schema.sql

CREATE TABLE IF NOT EXISTS news_items (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  summary     TEXT,
  url         TEXT NOT NULL UNIQUE,
  source      TEXT NOT NULL,
  source_url  TEXT,
  category    TEXT NOT NULL DEFAULT 'technology',
  image_url   TEXT,
  published_at TEXT NOT NULL,
  ai_score    INTEGER DEFAULT 50,
  sentiment   TEXT DEFAULT 'neutral' CHECK(sentiment IN ('positive', 'neutral', 'negative')),
  tags        TEXT DEFAULT '[]',   -- JSON array
  language    TEXT DEFAULT 'zh-TW',
  fetched_at  TEXT DEFAULT (datetime('now')),
  expires_at  TEXT                  -- 過期自動清理（30天後）
);

CREATE INDEX IF NOT EXISTS idx_news_published  ON news_items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_category   ON news_items(category, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_score      ON news_items(ai_score DESC);
CREATE INDEX IF NOT EXISTS idx_news_expires    ON news_items(expires_at);
