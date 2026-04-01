import React, { useEffect, useState } from 'react';
import { useBriefingStore } from '../stores/briefingStore.js';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// 簡易 Markdown 轉 HTML（僅處理 ## 標題與段落）
function renderMarkdown(md: string): string {
  // 將字面的 \n（AI 或 SQL 產生）統一轉為真正的換行符號
  return md.replace(/\\n/g, '\n')
    .split('\n')
    .map((line) => {
      if (line.startsWith('## ')) return `<h3 class="font-semibold text-gray-800 dark:text-gray-200 mt-3 mb-1">${escapeHtml(line.slice(3))}</h3>`;
      if (line.startsWith('# ')) return `<h2 class="font-bold text-gray-900 dark:text-gray-100 mt-4 mb-1">${escapeHtml(line.slice(2))}</h2>`;
      if (line.trim() === '') return '<br>';
      return `<p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">${escapeHtml(line)}</p>`;
    })
    .join('');
}

export default function DailyBriefing() {
  const { briefing, isLoading, fetchBriefing } = useBriefingStore();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchBriefing();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading && !briefing) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 mb-4">
        <div className="skeleton h-4 w-48 rounded mb-2" />
        <div className="skeleton h-3 w-full rounded" />
      </div>
    );
  }

  if (!briefing) return null;

  return (
    <div className="bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-900/20 dark:to-indigo-900/20 rounded-2xl border border-brand-100 dark:border-brand-800/30 p-4 mb-4">
      {/* 標題列 */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-start justify-between gap-3 text-left"
      >
        <div>
          <span className="text-xs font-medium text-brand-600 dark:text-brand-400 uppercase tracking-wide">
            📋 今日簡報 · {briefing.date}
          </span>
          <p className="mt-0.5 font-semibold text-gray-900 dark:text-gray-100 text-sm">
            {briefing.headline}
          </p>
        </div>
        <span className="text-gray-400 shrink-0 text-sm mt-0.5">
          {isExpanded ? '▲' : '▼'}
        </span>
      </button>

      {/* 關鍵詞 */}
      {briefing.keyTopics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {briefing.keyTopics.map((topic) => (
            <span
              key={topic}
              className="text-xs px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-800/40 text-brand-700 dark:text-brand-300"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* 內容（展開） */}
      {isExpanded && (
        <div
          className="mt-3 pt-3 border-t border-brand-100 dark:border-brand-800/30"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(briefing.content) }}
        />
      )}
    </div>
  );
}
