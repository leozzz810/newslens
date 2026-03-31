import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NewsItem, Category, TrendingTopic } from '@newslens/shared';
import { chromeStorage } from '../services/chrome-storage.js';
import { fetchNews, fetchTrending } from '../services/api.js';
import { NEWS_CACHE_KEY } from '../utils/constants.js';
import { useReadingStatsStore } from './readingStatsStore.js';

interface NewsState {
  items: NewsItem[];
  activeCategory: Category | 'all';
  activeKeyword: string | null;
  trendingTopics: TrendingTopic[];
  isLoading: boolean;
  isTrendingLoading: boolean;
  error: string | null;
  cachedAt: string | null;
  setCategory: (category: Category | 'all') => void;
  filterByKeyword: (keyword: string | null) => void;
  fetchNews: () => Promise<void>;
  fetchTrending: () => Promise<void>;
  toggleBookmark: (id: string) => void;
  markAsRead: (id: string, category: Category) => void;
}

export const useNewsStore = create<NewsState>()(
  persist(
    (set, get) => ({
      items: [],
      activeCategory: 'all',
      activeKeyword: null,
      trendingTopics: [],
      isLoading: false,
      isTrendingLoading: false,
      error: null,
      cachedAt: null,
      setCategory: (category) => set({ activeCategory: category, activeKeyword: null }),
      filterByKeyword: (keyword) => set({ activeKeyword: keyword }),
      fetchTrending: async () => {
        set({ isTrendingLoading: true });
        try {
          const data = await fetchTrending();
          set({ trendingTopics: data.topics, isTrendingLoading: false });
        } catch (err) {
          set({
            isTrendingLoading: false,
            error: err instanceof Error ? err.message : '趨勢載入失敗',
          });
        }
      },
      fetchNews: async () => {
        const { activeCategory, items: prevItems } = get();
        set({ isLoading: true, error: null });
        try {
          const query = activeCategory === 'all'
            ? { limit: 40 }
            : { category: activeCategory as Category, limit: 40 };
          const data = await fetchNews(query);
          // 保留舊的 isBookmarked / isRead 狀態，避免刷新時被清空
          const prevBookmarked = new Set(prevItems.filter((i) => i.isBookmarked).map((i) => i.id));
          const prevRead = new Set(prevItems.filter((i) => i.isRead).map((i) => i.id));
          set({
            items: data.items.map((item) => ({
              ...item,
              isBookmarked: prevBookmarked.has(item.id),
              isRead: prevRead.has(item.id),
            })),
            cachedAt: data.cachedAt,
            isLoading: false,
          });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : '載入失敗',
            isLoading: false,
          });
        }
      },
      toggleBookmark: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, isBookmarked: !item.isBookmarked } : item
          ),
        })),
      markAsRead: (id, category) => {
        useReadingStatsStore.getState().recordRead(id, category);
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, isRead: true } : item
          ),
        }));
      },
    }),
    {
      name: NEWS_CACHE_KEY,
      storage: chromeStorage<Pick<NewsState, 'items' | 'cachedAt'>>(),
      partialize: (state) => ({
        items: state.items,
        cachedAt: state.cachedAt,
      }),
    }
  )
);