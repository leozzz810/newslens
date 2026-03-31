import React, { useState, useEffect, useRef } from 'react';
import { usePreferencesStore } from '../stores/preferencesStore.js';
import { buildSearchUrl } from '../services/search-affiliate.js';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const searchEngine = usePreferencesStore((s) => s.preferences.searchEngine);

  // 按下 / 聚焦搜尋框
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    window.open(buildSearchUrl(query.trim(), searchEngine), '_self');
  };

  return (
    <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
      <div className="relative flex items-center">
        {/* 搜尋圖示 */}
        <svg
          className="absolute left-4 w-5 h-5 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`以 ${searchEngine === 'yahoo' ? 'Yahoo' : 'Bing'} 搜尋...`}
          className="w-full pl-12 pr-24 py-3.5 text-base rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
          autoFocus
        />

        {/* 搜尋按鈕 */}
        <button
          type="submit"
          className="absolute right-2 px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors"
        >
          搜尋
        </button>
      </div>

      {/* 快捷鍵提示 */}
      <p className="mt-1 text-center text-xs text-gray-400">
        按 <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">/</kbd> 快速聚焦
      </p>
    </form>
  );
}
