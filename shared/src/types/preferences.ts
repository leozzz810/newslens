import type { Category } from './news.js';

export type Theme = 'light' | 'dark' | 'system';
export type Language = 'zh-TW' | 'zh-CN' | 'en' | 'ja';
export type SearchEngine = 'yahoo' | 'bing';
export type Layout = 'grid' | 'list' | 'magazine';

export interface UserPreferences {
  theme: Theme;
  language: Language;
  searchEngine: SearchEngine;
  layout: Layout;
  enabledCategories: Category[];
  newsPerPage: number;
  showWeather: boolean;
  showClock: boolean;
  blockedSources: string[];
  preferredSources: string[];
  region: string;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  language: 'zh-TW',
  searchEngine: 'yahoo',
  layout: 'grid',
  enabledCategories: ['technology', 'business', 'world', 'entertainment', 'sports'],
  newsPerPage: 20,
  showWeather: false,
  showClock: true,
  blockedSources: [],
  preferredSources: [],
  region: 'TW',
};
