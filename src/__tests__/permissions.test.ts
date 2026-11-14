import { describe, expect, it } from 'vitest';

import { can, type Permission } from '@/lib/permissions';
import type { Role } from '@/types';

const ALL_PERMISSIONS: Permission[] = [
  'doc:read',
  'doc:create',
  'doc:upload',
  'doc:review',
  'doc:delete',
];

const ALL_ROLES: Role[] = ['viewer', 'reviewer', 'admin'];

describe('can()', () => {
  it('lets a viewer read documents and nothing else', () => {
    expect(can('viewer', 'doc:read')).toBe(true);
    expect(can('viewer', 'doc:create')).toBe(false);
    expect(can('viewer', 'doc:upload')).toBe(false);
    expect(can('viewer', 'doc:review')).toBe(false);
    expect(can('viewer', 'doc:delete')).toBe(false);
  });

  it('lets a reviewer read, review and upload, but not create or delete', () => {
    expect(can('reviewer', 'doc:read')).toBe(true);
    expect(can('reviewer', 'doc:review')).toBe(true);
    expect(can('reviewer', 'doc:upload')).toBe(true);
    expect(can('reviewer', 'doc:create')).toBe(false);
    expect(can('reviewer', 'doc:delete')).toBe(false);
  });

  it('lets an admin do everything', () => {
    for (const permission of ALL_PERMISSIONS) {
      expect(can('admin', permission)).toBe(true);
    }
  });

  it('reserves doc:delete for admins', () => {
    for (const role of ALL_ROLES) {
      expect(can(role, 'doc:delete')).toBe(role === 'admin');
    }
  });

  it('gives every role read access, since the list page needs it', () => {
    for (const role of ALL_ROLES) {
      expect(can(role, 'doc:read')).toBe(true);
    }
  });

  it('never lets a reviewer create or delete a document', () => {
    expect(can('reviewer', 'doc:create')).toBe(false);
    expect(can('reviewer', 'doc:delete')).toBe(false);
  });

  it('fails closed for a role the matrix does not know', () => {
    expect(can('root' as Role, 'doc:read')).toBe(false);
    expect(can('root' as Role, 'doc:delete')).toBe(false);
    expect(can('' as Role, 'doc:read')).toBe(false);
  });

  it('denies a permission that is not in the vocabulary at all', () => {
    for (const role of ALL_ROLES) {
      expect(can(role, 'doc:purge' as Permission)).toBe(false);
    }
  });
});
