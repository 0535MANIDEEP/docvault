'use client';

import type { ReactNode } from 'react';

import { can, type Permission } from '@/lib/permissions';
import { useAuthStore } from '@/store/useAuthStore';

interface RoleGateProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Hides UI the signed-in role is not allowed to use.
 *
 * This is a convenience, not a security boundary. The route handler re-checks
 * the same permission on the server, so hiding a button here does not stop
 * anyone from calling the API directly.
 */
export function RoleGate({ permission, children, fallback = null }: RoleGateProps) {
  const role = useAuthStore((state) => state.user?.role);

  if (!role || !can(role, permission)) return <>{fallback}</>;

  return <>{children}</>;
}
