import { useCallback } from 'react';
import { useNewsStore } from '../stores/newsStore.js';
import type { NewsItem } from '@newslens/shared';

export function useBookmarks() {
  const { items, toggleBookmark } = useNewsStore();

  const bookmarkedItems: NewsItem[] = items.filter((item) => item.isBookmarked);

  const addBookmark = useCallback(
    (id: string) => {
      const item = items.find((i) => i.id === id);
      if (item && !item.isBookmarked) toggleBookmark(id);
    },
    [items, toggleBookmark]
  );

  const removeBookmark = useCallback(
    (id: string) => {
      const item = items.find((i) => i.id === id);
      if (item?.isBookmarked) toggleBookmark(id);
    },
    [items, toggleBookmark]
  );

  const isBookmarked = useCallback(
    (id: string) => items.find((i) => i.id === id)?.isBookmarked ?? false,
    [items]
  );

  return { bookmarkedItems, addBookmark, removeBookmark, isBookmarked, toggleBookmark };
}
