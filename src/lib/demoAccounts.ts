import type { Role } from '@/types';

export interface DemoAccount {
  id: string;
  username: string;
  password: string;
  name: string;
  role: Role;
}

/**
 * The three fake logins, published on purpose so a recruiter can try every role
 * in under a minute. They are demo credentials for a portfolio app, not secrets:
 * there is no real account behind them and no personal data to reach.
 */
export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'u-admin',
    username: 'admin',
    password: 'admin',
    name: 'Avery Admin',
    role: 'admin',
  },
  {
    id: 'u-reviewer',
    username: 'reviewer',
    password: 'reviewer',
    name: 'Rowan Reviewer',
    role: 'reviewer',
  },
  {
    id: 'u-viewer',
    username: 'viewer',
    password: 'viewer',
    name: 'Val Viewer',
    role: 'viewer',
  },
];
