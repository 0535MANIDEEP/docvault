'use client';

import { create } from 'zustand';

import type { User } from '@/types';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
}

/**
 * Client-side mirror of the session. The server never trusts it: every route
 * handler re-reads the cookie and re-checks the permission matrix.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
