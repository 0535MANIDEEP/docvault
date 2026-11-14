import 'server-only';

import { cookies } from 'next/headers';
import { cache } from 'react';

import { DEMO_ACCOUNTS } from '@/lib/demoAccounts';
import { DEMO_USERS } from '@/lib/mockDb';
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from '@/lib/session';
import type { User } from '@/types';

/**
 * Checks the demo credentials. In a real app this is where a password hash
 * comparison or an identity provider call would live.
 */
export const authenticate = (username: string, password: string): User | null => {
  const normalised = username.trim().toLowerCase();
  const account = DEMO_ACCOUNTS.find((candidate) => candidate.username === normalised);
  if (!account || account.password !== password) return null;

  return { id: account.id, name: account.name, role: account.role };
};

export const startSession = async (userId: string): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
};

export const endSession = async (): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
};

/**
 * The only way the server learns who is calling. `cache()` keeps it to one
 * lookup per request even when several handlers ask for it.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!userId) return null;

  const user = DEMO_USERS.find((candidate) => candidate.id === userId);
  if (!user) return null;

  return { id: user.id, name: user.name, role: user.role };
});
