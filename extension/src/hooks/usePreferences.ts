import { usePreferencesStore } from '../stores/preferencesStore.js';

export function usePreferences() {
  return usePreferencesStore();
}
