import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth';
import { insertDocument, listDocuments, nextDocumentId } from '@/lib/mockDb';
import { can } from '@/lib/permissions';
import { documentCreateSchema, toFieldErrors } from '@/lib/schemas';
import type { DocumentItem } from '@/types';

/**
 * Lists every document. Reading needs `doc:read`, which every role has, but the
 * check still runs here: the UI is not the security boundary.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in to continue' }, { status: 401 });
  }

  if (!can(user.role, 'doc:read')) {
    return NextResponse.json(
      { error: 'Your role cannot read documents' },
      { status: 403 },
    );
  }

  return NextResponse.json({ documents: listDocuments() });
}

/**
 * Creates a document. `doc:create` belongs to admins alone.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in to continue' }, { status: 401 });
  }

  if (!can(user.role, 'doc:create')) {
    return NextResponse.json(
      { error: 'Only an admin can create documents' },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Expected a JSON body' }, { status: 400 });
  }

  const parsed = documentCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Check the highlighted fields', fields: toFieldErrors(parsed.error) },
      { status: 400 },
    );
  }

  const document: DocumentItem = {
    id: nextDocumentId(),
    title: parsed.data.title,
    status: parsed.data.status ?? 'draft',
    versions: [],
  };

  insertDocument(document);

  return NextResponse.json({ document }, { status: 201 });
}
