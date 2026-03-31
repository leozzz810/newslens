import React, { memo } from 'react';
import { CATEGORY_LABELS } from '@newslens/shared';
import type { NewsItem } from '@newslens/shared';
import { formatRelativeTime } from '../utils/time.js';
import { useNewsStore } from '../stores/newsStore.js';

interface NewsCardProps {
  item: NewsItem;
  isHero?: boolean;
}

import type { Sentiment } from '@newslens/shared';

const SENTIMENT_COLORS: Record<Sentiment, string> = {
  positive: 'text-green-600 dark:text-green-400',
  neutral: 'text-gray-500 dark:text-gray-400',
  negative: 'text-red-500 dark:text-red-400',
};

const CATEGORY_COLORS: Record<string, string> = {
  technology: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  business: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  world: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  politics: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  science: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  entertainment: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  sports: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  health: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  lifestyle: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
};

const NewsCard = memo(({ item, isHero = false }: NewsCardProps) => {
  const toggleBookmark = useNewsStore((s) => s.toggleBookmark);
  const markAsRead = useNewsStore((s) => s.markAsRead);

  const handleClick = () => {
    markAsRead(item.id, item.category);
    window.open(item.url, '_blank', 'noopener,noreferrer');
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark(item.id);
  };

  return (
    <article
      onClick={handleClick}
      className={`group relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 dark:border-gray-800 ${
        item.isRead ? 'opacity-70' : ''
      } ${isHero ? 'row-span-2' : ''}`}
    >
      {/* 封面圖 */}
      {item.imageUrl && (
        <div className={`overflow-hidden bg-gray-100 dark:bg-gray-800 ${isHero ? 'h-52' : 'h-36'}`}>
          <img
            src={item.imageUrl}
            alt={item.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* 無圖時的分類色塊 */}
      {!item.imageUrl && (
        <div
          className={`h-2 ${CATEGORY_COLORS[item.category] ?? 'bg-gray-200 dark:bg-gray-700'}`}
        />
      )}

      <div className="p-4">
        {/* 分類標籤 + 書籤 */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <span
            className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
              CATEGORY_COLORS[item.category] ?? 'bg-gray-100 text-gray-600'
            }`}
          >
            {CATEGORY_LABELS[item.category] ?? item.category}
          </span>
          <button
            onClick={handleBookmark}
            className={`shrink-0 p-1 rounded-full transition-colors ${
              item.isBookmarked
                ? 'text-brand-600'
                : 'text-gray-400 hover:text-brand-600'
            }`}
            aria-label={item.isBookmarked ? '移除書籤' : '加入書籤'}
          >
            <svg className="w-4 h-4" fill={item.isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>

        {/* 標題 */}
        <h2
          className={`font-semibold leading-snug text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors ${
            isHero ? 'text-lg mb-2' : 'text-sm mb-1.5 line-clamp-2'
          }`}
        >
          {item.title}
        </h2>

        {/* AI 摘要 */}
        <p
          className={`text-gray-500 dark:text-gray-400 text-xs leading-relaxed ${
            isHero ? 'line-clamp-3 mb-3' : 'line-clamp-2 mb-2'
          }`}
        >
          {item.summary}
        </p>

        {/* 底部資訊 */}
        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-medium text-gray-600 dark:text-gray-400 truncate">
              {item.source}
            </span>
            <span>·</span>
            <span>{formatRelativeTime(item.publishedAt)}</span>
          </div>
          <span className={`shrink-0 ${SENTIMENT_COLORS[item.sentiment]}`}>
            {item.sentiment === 'positive' ? '↑' : item.sentiment === 'negative' ? '↓' : '—'}
          </span>
        </div>
      </div>
    </article>
  );
});

NewsCard.displayName = 'NewsCard';

export default NewsCard;
