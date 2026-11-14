import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { RoleGate } from '@/components/RoleGate';
import { useAuthStore } from '@/store/useAuthStore';
import type { Role } from '@/types';

const signInAs = (role: Role) => {
  useAuthStore.setState({ user: { id: `u-${role}`, name: `${role} user`, role } });
};

describe('RoleGate', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null });
  });

  it('renders its children when the role holds the permission', () => {
    signInAs('admin');

    render(
      <RoleGate permission="doc:delete">
        <button type="button">Delete document</button>
      </RoleGate>,
    );

    expect(screen.getByRole('button', { name: 'Delete document' })).toBeInTheDocument();
  });

  it('renders nothing when the role does not hold the permission', () => {
    signInAs('viewer');

    const { container } = render(
      <RoleGate permission="doc:delete">
        <button type="button">Delete document</button>
      </RoleGate>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the fallback instead of the children when the permission is missing', () => {
    signInAs('reviewer');

    render(
      <RoleGate permission="doc:create" fallback={<span>Ask an admin</span>}>
        <button type="button">New document</button>
      </RoleGate>,
    );

    expect(screen.getByText('Ask an admin')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'New document' })).not.toBeInTheDocument();
  });

  it('renders nothing when nobody is signed in', () => {
    const { container } = render(
      <RoleGate permission="doc:read">
        <span>Documents</span>
      </RoleGate>,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
