import React from 'react';
import { usePreferencesStore } from '../stores/preferencesStore.js';
import SearchBar from '../components/SearchBar.js';
import CategoryTabs from '../components/CategoryTabs.js';
import NewsGrid from '../components/NewsGrid.js';
import TrendingSidebar from '../components/TrendingSidebar.js';
import GreetingBanner from '../components/GreetingBanner.js';
import DailyBriefing from '../components/DailyBriefing.js';
import AskFAB from '../components/AskFAB.js';

export default function App() {
  const theme = usePreferencesStore((s) => s.preferences.theme);

  React.useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, [theme]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* 頂部 */}
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-4">
        <GreetingBanner />
        <div className="mt-5">
          <DailyBriefing />
        </div>
        <div className="mt-4">
          <SearchBar />
        </div>
      </div>

      {/* 分類 Tab */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-700">
        <div className="mx-auto max-w-7xl px-4">
          <CategoryTabs />
        </div>
      </div>

      {/* 主要內容 */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            <NewsGrid />
          </div>
          <aside className="hidden xl:block w-72 shrink-0">
            <TrendingSidebar />
          </aside>
        </div>
      </div>

      {/* AI 問答 FAB */}
      <AskFAB />
    </div>
  );
}
