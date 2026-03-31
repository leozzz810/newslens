import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { chromeStorage } from '../services/chrome-storage.js';

interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  plan: 'free' | 'pro';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  setUser: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      setUser: (user, token) => set({ user, token, isLoggedIn: true }),
      logout: () => set({ user: null, token: null, isLoggedIn: false }),
    }),
    {
      name: 'auth',
      storage: chromeStorage<Pick<AuthState, 'user' | 'token' | 'isLoggedIn'>>(),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);