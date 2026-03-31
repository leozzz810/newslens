import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_PREFERENCES, type UserPreferences } from '@newslens/shared';
import { chromeStorage } from '../services/chrome-storage.js';
import { PREFS_STORAGE_KEY } from '../utils/constants.js';

interface PreferencesState {
  preferences: UserPreferences;
  setPreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  reset: () => void;
}

type PersistedPrefs = Pick<PreferencesState, 'preferences'>;

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      preferences: DEFAULT_PREFERENCES,
      setPreference: (key, value) =>
        set((state) => ({
          preferences: { ...state.preferences, [key]: value },
        })),
      reset: () => set({ preferences: DEFAULT_PREFERENCES }),
    }),
    {
      name: PREFS_STORAGE_KEY,
      storage: chromeStorage<PersistedPrefs>(),
      partialize: (state): PersistedPrefs => ({ preferences: state.preferences }),
    }
  )
);