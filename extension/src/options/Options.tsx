import React, { useState } from 'react';
import { ALL_CATEGORIES, CATEGORY_LABELS, type Category } from '@newslens/shared';
import { usePreferencesStore } from '../stores/preferencesStore.js';
import ReadingStats from '../components/ReadingStats.js';
import BookmarkList from '../components/BookmarkList.js';

type Tab = 'settings' | 'stats' | 'bookmarks';

export default function Options() {
  const [activeTab, setActiveTab] = useState<Tab>('settings');
  const { preferences, setPreference } = usePreferencesStore();

  const toggleCategory = (cat: Category) => {
    const current = preferences.enabledCategories;
    const updated = current.includes(cat)
      ? current.filter((c) => c !== cat)
      : [...current, cat];
    setPreference('enabledCategories', updated);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">NewsLens 設定</h1>

        {/* Tab 列 */}
        <div className="flex gap-1 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
          {([['settings', '⚙️ 一般設定'], ['bookmarks', '🔖 書籤'], ['stats', '📊 閱讀統計']] as [Tab, string][]).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 一般設定 */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* 外觀 */}
            <section className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">外觀</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm">主題</label>
                  <select
                    value={preferences.theme}
                    onChange={(e) => setPreference('theme', e.target.value as 'light' | 'dark' | 'system')}
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800"
                  >
                    <option value="system">跟隨系統</option>
                    <option value="light">淺色</option>
                    <option value="dark">深色</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm">版面配置</label>
                  <select
                    value={preferences.layout}
                    onChange={(e) => setPreference('layout', e.target.value as 'grid' | 'list' | 'magazine')}
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800"
                  >
                    <option value="grid">網格</option>
                    <option value="list">列表</option>
                    <option value="magazine">雜誌</option>
                  </select>
                </div>
              </div>
            </section>

            {/* 分類 */}
            <section className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">感興趣的分類</h2>
              <div className="flex flex-wrap gap-2">
                {ALL_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      preferences.enabledCategories.includes(cat)
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-brand-500'
                    }`}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </section>

            {/* 搜尋引擎 */}
            <section className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">搜尋引擎</h2>
              <div className="flex gap-3">
                {(['yahoo', 'bing'] as const).map((engine) => (
                  <button
                    key={engine}
                    onClick={() => setPreference('searchEngine', engine)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                      preferences.searchEngine === engine
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {engine === 'yahoo' ? 'Yahoo 搜尋' : 'Bing 搜尋'}
                  </button>
                ))}
              </div>
            </section>

            {/* 每頁數量 */}
            <section className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">每頁顯示新聞數</h2>
              <select
                value={preferences.newsPerPage}
                onChange={(e) => setPreference('newsPerPage', Number(e.target.value))}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800"
              >
                {[10, 20, 30, 40].map((n) => (
                  <option key={n} value={n}>{n} 則</option>
                ))}
              </select>
            </section>

            {/* 資料管理 */}
            <section className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">資料管理</h2>
              <button
                onClick={() => chrome.storage.local.clear()}
                className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                清除本地快取
              </button>
            </section>
          </div>
        )}

        {/* 書籤 */}
        {activeTab === 'bookmarks' && <BookmarkList />}

        {/* 閱讀統計 */}
        {activeTab === 'stats' && <ReadingStats />}
      </div>
    </div>
  );
}
