import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DailyBriefing } from '@newslens/shared';
import { chromeStorage } from '../services/chrome-storage.js';
import { fetchBriefing } from '../services/api.js';
import { BRIEFING_CACHE_KEY } from '../utils/constants.js';

interface BriefingState {
  briefing: DailyBriefing | null;
  isLoading: boolean;
  error: string | null;
  fetchBriefing: () => Promise<void>;
}

type Persisted = Pick<BriefingState, 'briefing'>;

export const useBriefingStore = create<BriefingState>()(
  persist(
    (set) => ({
      briefing: null,
      isLoading: false,
      error: null,

      fetchBriefing: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await fetchBriefing();
          set({ briefing: data.briefing, isLoading: false });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : '載入簡報失敗',
            isLoading: false,
          });
        }
      },
    }),
    {
      name: BRIEFING_CACHE_KEY,
      storage: chromeStorage<Persisted>(),
      partialize: (state): Persisted => ({ briefing: state.briefing }),
    }
  )
);
