'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import { DEMO_ACCOUNTS } from '@/lib/demoAccounts';
import { can, type Permission } from '@/lib/permissions';
import { loginSchema, toFieldErrors, type FieldErrors } from '@/lib/schemas';
import { useAuthStore } from '@/store/useAuthStore';
import type { Role, User } from '@/types';

const PERMISSION_LABELS: { key: Permission; label: string }[] = [
  { key: 'doc:read', label: 'Read' },
  { key: 'doc:create', label: 'Create' },
  { key: 'doc:upload', label: 'Upload' },
  { key: 'doc:review', label: 'Review' },
  { key: 'doc:delete', label: 'Delete' },
];

const ROLES: Role[] = ['viewer', 'reviewer', 'admin'];

interface AuthResponse {
  user?: User;
  error?: string;
  fields?: FieldErrors;
}

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const highlightedRole = DEMO_ACCOUNTS.find(
    (account) => account.username === username.trim().toLowerCase(),
  )?.role;

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    setFieldErrors({});

    const parsed = loginSchema.safeParse({ username, password });
    if (!parsed.success) {
      setFieldErrors(toFieldErrors(parsed.error));
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });

      const payload = (await response.json()) as AuthResponse;

      if (!response.ok) {
        if (payload.fields) setFieldErrors(payload.fields);
        else setFormError(payload.error ?? 'Sign in failed');
        return;
      }

      if (payload.user) setUser(payload.user);
      router.push('/documents');
      router.refresh();
    } catch {
      setFormError('Could not reach the server. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-14">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)]">
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="font-serif text-3xl font-semibold tracking-tight">Sign in</h1>
            <p className="text-sm text-ink-soft">
              DocVault is a demo with three fake accounts. Pick a role to see exactly
              what it changes.
            </p>
          </div>

          <form onSubmit={signIn} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <input
                id="username"
                name="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                aria-invalid={Boolean(fieldErrors.username)}
                aria-describedby={fieldErrors.username ? 'username-error' : undefined}
                className="border border-rule bg-sheet px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-soft/70 focus:border-ink"
                placeholder="admin"
              />
              {fieldErrors.username ? (
                <p id="username-error" className="text-sm text-seal">
                  {fieldErrors.username}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                className="border border-rule bg-sheet px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-soft/70 focus:border-ink"
                placeholder="admin"
              />
              {fieldErrors.password ? (
                <p id="password-error" className="text-sm text-seal">
                  {fieldErrors.password}
                </p>
              ) : null}
            </div>

            {formError ? (
              <p role="alert" className="border border-seal/40 bg-sheet px-3 py-2 text-sm text-seal">
                {formError}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="border border-ink bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink-soft disabled:opacity-60"
            >
              {submitting ? 'Signing in' : 'Sign in'}
            </button>
          </form>

          <div className="flex flex-col gap-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
              Demo accounts
            </span>
            <div className="flex flex-wrap gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => {
                    setUsername(account.username);
                    setPassword(account.password);
                    setFieldErrors({});
                    setFormError('');
                  }}
                  className="border border-rule bg-sheet px-3 py-1.5 font-mono text-xs text-ink-soft transition-colors hover:border-ink hover:text-ink"
                >
                  {account.username} / {account.password}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="font-serif text-xl font-semibold tracking-tight">
              What each role can do
            </h2>
            <p className="max-w-prose text-sm text-ink-soft">
              These are the same five permissions the API checks. A hidden button is a
              convenience; a refused request is the security.
            </p>
          </div>

          <div className="overflow-x-auto border border-rule bg-sheet">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">
                Permissions granted to each role: read, create, upload, review and delete
              </caption>
              <thead>
                <tr className="border-b border-rule">
                  <th scope="col" className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
                    Role
                  </th>
                  {PERMISSION_LABELS.map((permission) => (
                    <th
                      key={permission.key}
                      scope="col"
                      className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft"
                    >
                      {permission.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROLES.map((role) => {
                  const highlighted = role === highlightedRole;
                  return (
                    <tr key={role} className="border-b border-rule last:border-b-0">
                      <th
                        scope="row"
                        className={`px-4 py-3 font-mono text-xs uppercase tracking-[0.14em] ${
                          highlighted ? 'border-l-2 border-l-seal pl-3 text-ink' : 'border-l-2 border-l-transparent pl-3 text-ink-soft'
                        }`}
                      >
                        {role}
                        {highlighted ? <span className="sr-only"> (the role you typed)</span> : null}
                      </th>
                      {PERMISSION_LABELS.map((permission) => {
                        const granted = can(role, permission.key);
                        return (
                          <td key={permission.key} className="px-4 py-3">
                            <span
                              aria-hidden="true"
                              className={`block size-2.5 ${
                                granted ? 'bg-ink' : 'border border-rule'
                              }`}
                            />
                            <span className="sr-only">
                              {granted ? 'granted' : 'not granted'}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
