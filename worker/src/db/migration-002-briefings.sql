-- Migration 002: 新增每日簡報表
-- 執行方式：wrangler d1 execute newslens --file=src/db/migration-002-briefings.sql

CREATE TABLE IF NOT EXISTS daily_briefings (
  id           TEXT PRIMARY KEY,
  date         TEXT NOT NULL UNIQUE,
  headline     TEXT NOT NULL,
  content      TEXT NOT NULL,
  key_topics   TEXT DEFAULT '[]',
  generated_at TEXT NOT NULL,
  expires_at   TEXT
);

CREATE INDEX IF NOT EXISTS idx_briefing_date ON daily_briefings(date DESC);
