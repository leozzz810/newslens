export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://newslens-api.newslens.workers.dev';

export const NEWS_CACHE_KEY = 'newsCache';
export const PREFS_STORAGE_KEY = 'userPreferences';

export const MAX_BOOKMARKS = 100;
export const CACHE_STALE_MINUTES = 15;
export const READING_STATS_KEY = 'readingStats';
export const BRIEFING_CACHE_KEY = 'briefingCache';
export const QA_HISTORY_KEY = 'qaHistory';
export const MAX_QA_HISTORY = 20;
export const MAX_READING_DAYS = 90;
