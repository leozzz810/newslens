import React from 'react';
import { useNewsStore } from '../stores/newsStore.js';
import { CATEGORY_LABELS } from '@newslens/shared';
import { formatRelativeTime } from '../utils/time.js';

export default function TrendingSidebar() {
  const items = useNewsStore((s) => s.items);
  const markAsRead = useNewsStore((s) => s.markAsRead);
  const trendingTopics = useNewsStore((s) => s.trendingTopics);
  const activeKeyword = useNewsStore((s) => s.activeKeyword);
  const filterByKeyword = useNewsStore((s) => s.filterByKeyword);

  const topNews = [...items]
    .sort((a, b) => b.aiScore - a.aiScore)
    .slice(0, 5);

  return (
    <div className="sticky top-16 space-y-4">

      {/* 趨勢關鍵字 */}
      {trendingTopics.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
            <span>📈</span>
            <span>趨勢關鍵字</span>
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {trendingTopics.map((topic) => {
              const isActive = activeKeyword === topic.keyword;
              return (
                <button
                  key={topic.keyword}
                  onClick={() => filterByKeyword(isActive ? null : topic.keyword)}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-full border transition-colors ${
                    isActive
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-brand-400'
                  }`}
                >
                  <span>{topic.keyword}</span>
                  <span className={`text-[10px] font-medium px-1 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    {topic.count}
                  </span>
                </button>
              );
            })}
          </div>
          {activeKeyword && (
            <button
              onClick={() => filterByKeyword(null)}
              className="mt-2 text-xs text-brand-600 hover:underline"
            >
              清除篩選 ✕
            </button>
          )}
        </div>
      )}

      {/* 熱門新聞 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
          <span>🔥</span>
          <span>熱門新聞</span>
        </h3>
        <ol className="space-y-3">
          {topNews.length === 0
            ? Array.from({ length: 5 }, (_, i) => (
                <li key={i} className="flex gap-3">
                  <span className="skeleton w-5 h-4 rounded shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="skeleton h-3 w-full rounded" />
                    <div className="skeleton h-3 w-3/4 rounded" />
                  </div>
                </li>
              ))
            : topNews.map((item, index) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      markAsRead(item.id, item.category);
                      window.open(item.url, '_blank', 'noopener,noreferrer');
                    }}
                    className="w-full text-left flex gap-3 group"
                  >
                    <span className={`shrink-0 w-5 h-5 flex items-center justify-center rounded text-xs font-bold ${
                      index === 0 ? 'bg-orange-500 text-white'
                      : index === 1 ? 'bg-gray-400 text-white'
                      : index === 2 ? 'bg-amber-600 text-white'
                      : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-800 dark:text-gray-200 font-medium line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {CATEGORY_LABELS[item.category]} · {formatRelativeTime(item.publishedAt)}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
        </ol>
      </div>
    </div>
  );
}
