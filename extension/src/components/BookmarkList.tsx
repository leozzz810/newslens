import React from 'react';
import { CATEGORY_LABELS } from '@newslens/shared';
import { useBookmarks } from '../hooks/useBookmarks.js';
import { formatRelativeTime } from '../utils/time.js';

export default function BookmarkList() {
  const { bookmarkedItems, removeBookmark } = useBookmarks();

  if (bookmarkedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-5xl mb-4">🔖</span>
        <p className="text-gray-600 dark:text-gray-400 text-sm">尚無書籤</p>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
          在新分頁點擊新聞卡片上的書籤圖示即可儲存
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400 dark:text-gray-500">共 {bookmarkedItems.length} 則書籤</p>
      {bookmarkedItems.map((item) => (
        <div
          key={item.id}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex gap-3"
        >
          {/* 封面圖 */}
          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt={item.title}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-xl object-cover shrink-0"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-medium text-brand-600 dark:text-brand-400">
                {CATEGORY_LABELS[item.category] ?? item.category}
              </span>
              <button
                onClick={() => removeBookmark(item.id)}
                className="shrink-0 text-gray-400 hover:text-red-500 transition-colors text-xs"
                aria-label="移除書籤"
              >
                ✕
              </button>
            </div>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-1 text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-brand-600 dark:hover:text-brand-400 line-clamp-2 transition-colors"
            >
              {item.title}
            </a>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              {item.source} · {formatRelativeTime(item.publishedAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
