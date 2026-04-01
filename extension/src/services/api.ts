import { API_BASE_URL } from '../utils/constants.js';
import type {
  NewsListResponse,
  NewsListQuery,
  ApiResponse,
  TrendingResponse,
  BriefingResponse,
  AskResponse,
} from '@newslens/shared';

const TIMEOUT_MS = 5000;
const MAX_RETRIES = 2;

async function fetchWithTimeout(url: string, options?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWithRetry(url: string, options?: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetchWithTimeout(url, options);
    // 4xx 是用戶端錯誤，重試無意義；只對 5xx 與網路錯誤重試
    if (response.status >= 500 && retries > 0) {
      await new Promise((r) => setTimeout(r, 500 * (MAX_RETRIES - retries + 1)));
      return fetchWithRetry(url, options, retries - 1);
    }
    return response;
  } catch (err) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 500 * (MAX_RETRIES - retries + 1)));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw err;
  }
}

export async function fetchNews(query: NewsListQuery = {}): Promise<NewsListResponse> {
  const params = new URLSearchParams();
  if (query.category) params.set('category', query.category);
  if (query.limit) params.set('limit', String(query.limit));
  if (query.cursor) params.set('cursor', query.cursor);
  if (query.lang) params.set('lang', query.lang);

  const url = `${API_BASE_URL}/api/v1/news?${params}`;
  const response = await fetchWithRetry(url);

  if (!response.ok) {
    throw new Error(`API Error ${response.status}: ${response.statusText}`);
  }

  const raw = (await response.json()) as unknown;
  if (
    typeof raw !== 'object' ||
    raw === null ||
    !('success' in raw)
  ) {
    throw new Error('API 回傳格式錯誤');
  }
  const json = raw as ApiResponse<NewsListResponse>;
  if (!json.success) {
    throw new Error(json.error?.message ?? '未知的 API 錯誤');
  }
  return json.data;
}

async function apiGet<T>(path: string): Promise<T> {
  const response = await fetchWithRetry(`${API_BASE_URL}${path}`);
  if (!response.ok) throw new Error(`API Error ${response.status}`);
  const raw = (await response.json()) as unknown;
  if (typeof raw !== 'object' || raw === null || !('success' in raw)) throw new Error('API 回傳格式錯誤');
  const json = raw as ApiResponse<T>;
  if (!json.success) throw new Error(json.error?.message ?? '未知的 API 錯誤');
  return json.data;
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetchWithRetry(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const raw = await response.json().catch(() => ({})) as unknown;
    const msg = (typeof raw === 'object' && raw !== null && 'error' in raw)
      ? (raw as { error: { message: string } }).error.message
      : `API Error ${response.status}`;
    throw new Error(msg);
  }
  const raw = (await response.json()) as unknown;
  if (typeof raw !== 'object' || raw === null || !('success' in raw)) throw new Error('API 回傳格式錯誤');
  const json = raw as ApiResponse<T>;
  if (!json.success) throw new Error(json.error?.message ?? '未知的 API 錯誤');
  return json.data;
}

export async function fetchTrending(): Promise<TrendingResponse> {
  return apiGet<TrendingResponse>('/api/v1/news/trending');
}

export async function fetchBriefing(): Promise<BriefingResponse> {
  return apiGet<BriefingResponse>('/api/v1/news/briefing');
}

export async function askQuestion(question: string): Promise<AskResponse> {
  return apiPost<AskResponse>('/api/v1/news/ask', { question });
}
