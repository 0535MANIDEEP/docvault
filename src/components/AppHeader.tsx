'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/store/useAuthStore';

export function AppHeader() {
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);
  const router = useRouter();

  const signOut = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    clearUser();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="border-b border-rule bg-sheet">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-6 py-4">
        <Link href="/documents" className="flex items-baseline gap-3">
          <span className="font-serif text-xl font-semibold tracking-tight">DocVault</span>
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft sm:inline">
            records with enforced access
          </span>
        </Link>

        {user ? (
          <div className="ml-auto flex items-center gap-4">
            <span className="hidden text-sm text-ink-soft sm:inline">{user.name}</span>
            <span className="border border-rule px-2 py-[3px] font-mono text-[11px] uppercase tracking-[0.14em]">
              {user.role}
            </span>
            <button
              type="button"
              onClick={signOut}
              className="border border-rule bg-sheet px-3 py-1.5 text-sm text-ink transition-colors hover:border-ink"
            >
              Sign out
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
