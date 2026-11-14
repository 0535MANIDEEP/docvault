'use client';

import { useEffect } from 'react';

import { useAuthStore } from '@/store/useAuthStore';
import type { User } from '@/types';

/**
 * Seeds the client store from the session the server already resolved, so the
 * UI knows who is signed in without a second round trip.
 */
export function SessionProvider({ user }: { user: User | null }) {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  return null;
}
