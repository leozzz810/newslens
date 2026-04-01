import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Category } from '@newslens/shared';
import { chromeStorage } from '../services/chrome-storage.js';
import { READING_STATS_KEY, MAX_READING_DAYS } from '../utils/constants.js';

export interface ReadingRecord {
  newsId: string;
  category: Category;
  readAt: string; // ISO
}

interface ReadingStatsState {
  records: ReadingRecord[];
  streakDays: number;
  lastReadDate: string | null; // YYYY-MM-DD
  recordRead: (newsId: string, category: Category) => void;
}

type PersistedStats = Pick<ReadingStatsState, 'records' | 'streakDays' | 'lastReadDate'>;

// 使用本地時區日期，避免 UTC 與台灣時間（UTC+8）跨日差異
function localDateStr(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function todayStr(): string {
  return localDateStr();
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localDateStr(d);
}

function cutoffStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - MAX_READING_DAYS);
  return d.toISOString();
}

export const useReadingStatsStore = create<ReadingStatsState>()(
  persist(
    (set, get) => ({
      records: [],
      streakDays: 0,
      lastReadDate: null,

      recordRead: (newsId, category) => {
        const { records, streakDays, lastReadDate } = get();
        const today = todayStr();

        // 連續天數計算
        let newStreak = streakDays;
        if (lastReadDate === today) {
          // 今天已讀過，不變
        } else if (lastReadDate === yesterdayStr()) {
          newStreak = streakDays + 1;
        } else {
          newStreak = 1;
        }

        // 清理超過 90 天的舊紀錄
        const cutoff = cutoffStr();
        const trimmed = records.filter((r) => r.readAt >= cutoff);

        set({
          records: [...trimmed, { newsId, category, readAt: new Date().toISOString() }],
          streakDays: newStreak,
          lastReadDate: today,
        });
      },
    }),
    {
      name: READING_STATS_KEY,
      storage: chromeStorage<PersistedStats>(),
      partialize: (state): PersistedStats => ({
        records: state.records,
        streakDays: state.streakDays,
        lastReadDate: state.lastReadDate,
      }),
    }
  )
);
