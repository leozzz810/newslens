import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QAHistoryItem } from '@newslens/shared';
import { chromeStorage } from '../services/chrome-storage.js';
import { askQuestion } from '../services/api.js';
import { QA_HISTORY_KEY, MAX_QA_HISTORY } from '../utils/constants.js';
import { randomId } from '../utils/time.js';

interface QAState {
  history: QAHistoryItem[];
  isAsking: boolean;
  error: string | null;
  isOpen: boolean;
  toggleOpen: () => void;
  ask: (question: string) => Promise<void>;
  clearHistory: () => void;
}

type Persisted = Pick<QAState, 'history'>;

export const useQAStore = create<QAState>()(
  persist(
    (set, get) => ({
      history: [],
      isAsking: false,
      error: null,
      isOpen: false,

      toggleOpen: () => set((s) => ({ isOpen: !s.isOpen })),

      ask: async (question) => {
        set({ isAsking: true, error: null });
        try {
          const response = await askQuestion(question);
          const item: QAHistoryItem = {
            id: randomId(),
            question,
            answer: response.answer,
            sources: response.sources,
            askedAt: new Date().toISOString(),
          };
          const history = [item, ...get().history].slice(0, MAX_QA_HISTORY);
          set({ history, isAsking: false });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : '問答失敗',
            isAsking: false,
          });
        }
      },

      clearHistory: () => set({ history: [] }),
    }),
    {
      name: QA_HISTORY_KEY,
      storage: chromeStorage<Persisted>(),
      partialize: (state): Persisted => ({ history: state.history }),
    }
  )
);
