import React from 'react';
import { useNews } from '../hooks/useNews.js';
import NewsCard from './NewsCard.js';
import SkeletonGrid from './Skeleton.js';

export default function NewsGrid() {
  const { news, isLoading, error, refresh } = useNews();

  if (isLoading && news.length === 0) {
    return <SkeletonGrid count={8} />;
  }

  if (error && news.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-4xl mb-4">😕</span>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          載入新聞失敗：{error}
        </p>
        <button
          onClick={refresh}
          className="px-4 py-2 text-sm bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors"
        >
          重試
        </button>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-4xl mb-4">📭</span>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          目前沒有新聞，請稍後再試
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 更新中提示 */}
      {isLoading && news.length > 0 && (
        <div className="absolute top-0 right-0 z-10 flex items-center gap-1.5 text-xs text-brand-600 bg-brand-50 dark:bg-brand-900/20 px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse" />
          更新中...
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {news.map((item, index) => (
          <NewsCard key={item.id} item={item} isHero={index === 0} />
        ))}
      </div>
    </div>
  );
}
