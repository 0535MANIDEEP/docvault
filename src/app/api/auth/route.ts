import { NextResponse } from 'next/server';

import { authenticate, endSession, startSession } from '@/lib/auth';
import { loginSchema, toFieldErrors } from '@/lib/schemas';

/**
 * Signs a demo account in and sets the session cookie.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Expected a JSON body' }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Check the highlighted fields', fields: toFieldErrors(parsed.error) },
      { status: 400 },
    );
  }

  const user = authenticate(parsed.data.username, parsed.data.password);
  if (!user) {
    return NextResponse.json(
      { error: 'Those credentials do not match a demo account' },
      { status: 401 },
    );
  }

  await startSession(user.id);

  return NextResponse.json({ user });
}

/**
 * Signs the current user out.
 */
export async function DELETE() {
  await endSession();
  return NextResponse.json({ ok: true });
}
