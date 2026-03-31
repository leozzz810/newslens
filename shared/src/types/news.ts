export type Category =
  | 'technology'
  | 'business'
  | 'world'
  | 'politics'
  | 'science'
  | 'entertainment'
  | 'sports'
  | 'health'
  | 'lifestyle';

export const CATEGORY_LABELS: Record<Category, string> = {
  technology: '科技',
  business: '財經',
  world: '國際',
  politics: '政治',
  science: '科學',
  entertainment: '娛樂',
  sports: '體育',
  health: '健康',
  lifestyle: '生活',
};

export const ALL_CATEGORIES: Category[] = [
  'technology',
  'business',
  'world',
  'politics',
  'science',
  'entertainment',
  'sports',
  'health',
  'lifestyle',
];

export type Sentiment = 'positive' | 'neutral' | 'negative';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  sourceUrl?: string;
  category: Category;
  imageUrl?: string;
  publishedAt: string;
  aiScore: number;
  sentiment: Sentiment;
  tags: string[];
  isBookmarked?: boolean;
  isRead?: boolean;
}

export interface RssSource {
  id: string;
  name: string;
  url: string;
  category: Category;
  language: 'zh-TW' | 'zh-CN' | 'en' | 'ja';
  enabled: boolean;
}
