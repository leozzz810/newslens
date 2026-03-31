import type { NewsItem } from './news.js';

export interface NewsListResponse {
  items: NewsItem[];
  nextCursor?: string;
  cachedAt: string;
  total: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: {
    page: number;
    perPage: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface NewsListQuery {
  category?: string;
  limit?: number;
  cursor?: string;
  lang?: string;
}
