import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth';
import { appendVersion, findDocument, removeDocument, updateDocument } from '@/lib/mockDb';
import { can, type Permission } from '@/lib/permissions';
import { documentPatchSchema, hasAllowedExtension, toFieldErrors } from '@/lib/schemas';

const DENIAL_MESSAGES: Record<Permission, string> = {
  'doc:read': 'Your role cannot read documents',
  'doc:create': 'Only an admin can edit a document title',
  'doc:upload': 'Your role cannot upload a new version',
  'doc:review': 'Only a reviewer or admin can change the status',
  'doc:delete': 'Only an admin can delete a document',
};

/**
 * Reads one document.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in to continue' }, { status: 401 });
  }

  if (!can(user.role, 'doc:read')) {
    return NextResponse.json(
      { error: DENIAL_MESSAGES['doc:read'] },
      { status: 403 },
    );
  }

  const document = findDocument(id);
  if (!document) {
    return NextResponse.json({ error: 'No document with that id' }, { status: 404 });
  }

  return NextResponse.json({ document });
}

/**
 * Updates a document. Each kind of change carries its own permission, so the
 * check is per field rather than per route: editing a title needs `doc:create`,
 * moving the status needs `doc:review`, and adding a version needs `doc:upload`.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in to continue' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Expected a JSON body' }, { status: 400 });
  }

  const parsed = documentPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Check the highlighted fields', fields: toFieldErrors(parsed.error) },
      { status: 400 },
    );
  }

  const patch = parsed.data;

  const required: Permission[] = [];
  if (patch.title !== undefined) required.push('doc:create');
  if (patch.status !== undefined) required.push('doc:review');
  if (patch.fileName !== undefined) required.push('doc:upload');

  if (required.length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const denied = required.find((permission) => !can(user.role, permission));
  if (denied) {
    return NextResponse.json({ error: DENIAL_MESSAGES[denied] }, { status: 403 });
  }

  if (patch.fileName !== undefined && !hasAllowedExtension(patch.fileName)) {
    return NextResponse.json(
      { error: 'Only PDF, PNG, JPG and TXT files are accepted' },
      { status: 400 },
    );
  }

  const document = findDocument(id);
  if (!document) {
    return NextResponse.json({ error: 'No document with that id' }, { status: 404 });
  }

  if (patch.check) {
    // The permission check has already passed. Report it without touching the
    // document, so the UI can show what the server actually decided.
    return NextResponse.json({ allowed: true, permissions: required });
  }

  if (patch.title !== undefined) {
    updateDocument(id, { title: patch.title });
  }

  if (patch.status !== undefined) {
    updateDocument(id, { status: patch.status });
  }

  if (patch.fileName !== undefined) {
    const version =
      document.versions.reduce((highest, current) => Math.max(highest, current.version), 0) + 1;

    appendVersion(id, {
      version,
      fileName: patch.fileName,
      uploadedBy: user.name,
      uploadedAt: new Date().toISOString(),
    });
  }

  return NextResponse.json({ document: findDocument(id) });
}

/**
 * Deletes a document. `doc:delete` belongs to admins alone.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in to continue' }, { status: 401 });
  }

  if (!can(user.role, 'doc:delete')) {
    return NextResponse.json(
      { error: DENIAL_MESSAGES['doc:delete'] },
      { status: 403 },
    );
  }

  if (!removeDocument(id)) {
    return NextResponse.json({ error: 'No document with that id' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
