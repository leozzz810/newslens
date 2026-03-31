import React, { useMemo } from 'react';
import { CATEGORY_LABELS, type Category } from '@newslens/shared';
import { useReadingStatsStore } from '../stores/readingStatsStore.js';

export default function ReadingStats() {
  const { records, streakDays } = useReadingStatsStore();

  const stats = useMemo(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const weeklyCount = records.filter((r) => new Date(r.readAt).getTime() >= weekAgo).length;

    // 分類統計
    const catCount = new Map<Category, number>();
    for (const r of records) {
      catCount.set(r.category, (catCount.get(r.category) ?? 0) + 1);
    }
    const topCategories = [...catCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const maxCatCount = topCategories[0]?.[1] ?? 1;

    return { weeklyCount, topCategories, maxCatCount };
  }, [records]);

  return (
    <div className="space-y-6">
      {/* 數字卡片 */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="總閱讀數" value={records.length} icon="📚" />
        <StatCard label="本週閱讀" value={stats.weeklyCount} icon="📅" />
        <StatCard label="連續天數" value={`${streakDays} 天`} icon="🔥" />
      </div>

      {/* 分類分佈 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">最愛分類</h3>
        {stats.topCategories.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">尚無閱讀紀錄</p>
        ) : (
          <div className="space-y-2.5">
            {stats.topCategories.map(([cat, count]) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 dark:text-gray-400 w-14 shrink-0 text-right">
                  {CATEGORY_LABELS[cat] ?? cat}
                </span>
                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all duration-500"
                    style={{ width: `${(count / stats.maxCatCount) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 w-6 text-right shrink-0">
                  {count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 text-center shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
    </div>
  );
}
