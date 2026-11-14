import type { Role } from '@/types';

export type Permission =
  | 'doc:read'
  | 'doc:create'
  | 'doc:upload'
  | 'doc:review'
  | 'doc:delete';

/**
 * The single source of truth for what each role is allowed to do.
 *
 * Both the UI (`<RoleGate>`) and the API route handlers read from this matrix,
 * so a permission can never be granted in one place and forgotten in the other.
 */
const MATRIX: Record<Role, readonly Permission[]> = {
  viewer: ['doc:read'],
  reviewer: ['doc:read', 'doc:review', 'doc:upload'],
  admin: ['doc:read', 'doc:create', 'doc:upload', 'doc:review', 'doc:delete'],
};

/**
 * Fails closed: a role the matrix does not know about gets no permissions
 * instead of throwing, so a tampered session cookie cannot widen access.
 */
export const can = (role: Role, permission: Permission): boolean => {
  const granted: readonly Permission[] | undefined = MATRIX[role];
  return granted ? granted.includes(permission) : false;
};
