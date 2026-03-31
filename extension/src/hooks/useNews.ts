import { useEffect, useCallback } from 'react';
import { useNewsStore } from '../stores/newsStore.js';
import type { Category, NewsItem } from '@newslens/shared';

export function useNews() {
  const {
    items,
    activeCategory,
    activeKeyword,
    trendingTopics,
    isLoading,
    isTrendingLoading,
    error,
    cachedAt,
    setCategory,
    filterByKeyword,
    fetchNews,
    fetchTrending: fetchTrendingFn,
  } = useNewsStore();

  useEffect(() => {
    if (items.length === 0) fetchNews();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchNews();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  useEffect(() => {
    if (trendingTopics.length === 0) fetchTrendingFn();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 分類篩選 → keyword 篩選
  const filteredItems: NewsItem[] = (() => {
    let base = activeCategory === 'all'
      ? items
      : items.filter((item) => item.category === activeCategory);
    if (activeKeyword) {
      const kw = activeKeyword.toLowerCase();
      base = base.filter(
        (item) =>
          item.title.toLowerCase().includes(kw) ||
          item.tags.some((t) => t.toLowerCase().includes(kw))
      );
    }
    return base;
  })();

  const refresh = useCallback(() => fetchNews(), [fetchNews]);

  return {
    news: filteredItems,
    allNews: items,
    activeCategory,
    activeKeyword,
    trendingTopics,
    isLoading,
    isTrendingLoading,
    error,
    cachedAt,
    setCategory: setCategory as (cat: Category | 'all') => void,
    filterByKeyword,
    refresh,
  };
}
