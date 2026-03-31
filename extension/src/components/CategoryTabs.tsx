import React, { useRef } from 'react';
import { ALL_CATEGORIES, CATEGORY_LABELS, type Category } from '@newslens/shared';
import { useNewsStore } from '../stores/newsStore.js';
import { usePreferencesStore } from '../stores/preferencesStore.js';

const CATEGORY_ICONS: Record<Category, string> = {
  technology: '💻',
  business: '📈',
  world: '🌍',
  politics: '🏛️',
  science: '🔬',
  entertainment: '🎬',
  sports: '⚽',
  health: '❤️',
  lifestyle: '✨',
};

export default function CategoryTabs() {
  const activeCategory = useNewsStore((s) => s.activeCategory);
  const setCategory = useNewsStore((s) => s.setCategory);
  const enabledCategories = usePreferencesStore((s) => s.preferences.enabledCategories);
  const tabsRef = useRef<HTMLDivElement>(null);

  const visibleCategories = ALL_CATEGORIES.filter((c) => enabledCategories.includes(c));

  const handleSelect = (cat: Category | 'all') => {
    setCategory(cat);
    // 滾動到選中的 tab
    const el = tabsRef.current?.querySelector(`[data-cat="${cat}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  return (
    <div
      ref={tabsRef}
      className="flex items-center gap-1 py-2 overflow-x-auto scrollbar-hide"
    >
      {/* 全部 */}
      <Tab
        label="全部"
        icon="📰"
        isActive={activeCategory === 'all'}
        onClick={() => handleSelect('all')}
        dataCat="all"
      />
      {visibleCategories.map((cat) => (
        <Tab
          key={cat}
          label={CATEGORY_LABELS[cat]}
          icon={CATEGORY_ICONS[cat]}
          isActive={activeCategory === cat}
          onClick={() => handleSelect(cat)}
          dataCat={cat}
        />
      ))}
    </div>
  );
}

function Tab({
  label,
  icon,
  isActive,
  onClick,
  dataCat,
}: {
  label: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
  dataCat: string;
}) {
  return (
    <button
      data-cat={dataCat}
      onClick={onClick}
      className={`shrink-0 flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-all ${
        isActive
          ? 'bg-brand-600 text-white shadow-sm'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
