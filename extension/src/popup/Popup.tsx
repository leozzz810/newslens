import React from 'react';
import { useNewsStore } from '../stores/newsStore.js';
import { usePreferencesStore } from '../stores/preferencesStore.js';

export default function Popup() {
  const { cachedAt, isLoading, fetchNews } = useNewsStore();
  const { preferences, setPreference } = usePreferencesStore();

  const lastUpdate = cachedAt
    ? new Date(cachedAt).toLocaleString('zh-TW', { hour: '2-digit', minute: '2-digit' })
    : '尚未更新';

  return (
    <div className="p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* 標題 */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded bg-brand-600 flex items-center justify-center text-white text-xs font-bold">N</div>
        <span className="font-semibold text-sm">NewsLens</span>
      </div>

      {/* 快取狀態 */}
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        最後更新：{lastUpdate}
      </div>

      {/* 手動刷新 */}
      <button
        onClick={() => fetchNews()}
        disabled={isLoading}
        className="w-full py-2 px-3 text-sm rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 transition-colors mb-3"
      >
        {isLoading ? '更新中...' : '立即更新新聞'}
      </button>

      {/* 主題切換 */}
      {(() => {
        const isDark = preferences.theme === 'dark' ||
          (preferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        return (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">深色模式</span>
            <button
              onClick={() => setPreference('theme', isDark ? 'light' : 'dark')}
              className={`relative w-10 h-5 rounded-full transition-colors ${isDark ? 'bg-brand-600' : 'bg-gray-300'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isDark ? 'translate-x-5' : ''}`}
              />
            </button>
          </div>
        );
      })()}

      {/* 設定頁連結 */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            chrome.runtime.openOptionsPage();
          }}
          className="text-xs text-brand-600 hover:underline"
        >
          進階設定 →
        </a>
      </div>
    </div>
  );
}
