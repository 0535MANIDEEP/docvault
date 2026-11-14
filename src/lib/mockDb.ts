import 'server-only';

import { DEMO_ACCOUNTS } from '@/lib/demoAccounts';
import type { DocumentItem, DocumentVersion, User } from '@/types';

export const DEMO_USERS: User[] = DEMO_ACCOUNTS.map(({ id, name, role }) => ({
  id,
  name,
  role,
}));

const seedDocuments = (): DocumentItem[] => [
  {
    id: 'doc-001',
    title: 'Q3 Vendor Compliance Audit',
    status: 'in_review',
    versions: [
      {
        version: 3,
        fileName: 'q3-vendor-audit-v3.pdf',
        uploadedBy: 'Rowan Reviewer',
        uploadedAt: '2026-10-28T09:14:00.000Z',
      },
      {
        version: 2,
        fileName: 'q3-vendor-audit-v2.pdf',
        uploadedBy: 'Avery Admin',
        uploadedAt: '2026-10-19T16:02:00.000Z',
      },
      {
        version: 1,
        fileName: 'q3-vendor-audit-v1.pdf',
        uploadedBy: 'Avery Admin',
        uploadedAt: '2026-10-02T11:40:00.000Z',
      },
    ],
  },
  {
    id: 'doc-002',
    title: 'Employee Handbook 2026',
    status: 'approved',
    versions: [
      {
        version: 4,
        fileName: 'employee-handbook-2026-final.pdf',
        uploadedBy: 'Avery Admin',
        uploadedAt: '2026-09-30T08:00:00.000Z',
      },
      {
        version: 3,
        fileName: 'employee-handbook-2026-draft3.pdf',
        uploadedBy: 'Avery Admin',
        uploadedAt: '2026-09-18T13:22:00.000Z',
      },
    ],
  },
  {
    id: 'doc-003',
    title: 'Data Retention Policy',
    status: 'approved',
    versions: [
      {
        version: 2,
        fileName: 'data-retention-policy-v2.pdf',
        uploadedBy: 'Rowan Reviewer',
        uploadedAt: '2026-09-11T10:31:00.000Z',
      },
      {
        version: 1,
        fileName: 'data-retention-policy-v1.pdf',
        uploadedBy: 'Avery Admin',
        uploadedAt: '2026-08-24T15:07:00.000Z',
      },
    ],
  },
  {
    id: 'doc-004',
    title: 'Incident Response Runbook',
    status: 'draft',
    versions: [
      {
        version: 1,
        fileName: 'incident-response-runbook-draft.pdf',
        uploadedBy: 'Rowan Reviewer',
        uploadedAt: '2026-11-04T09:58:00.000Z',
      },
    ],
  },
  {
    id: 'doc-005',
    title: 'Customer Support SLA',
    status: 'in_review',
    versions: [
      {
        version: 2,
        fileName: 'support-sla-v2.pdf',
        uploadedBy: 'Avery Admin',
        uploadedAt: '2026-10-22T14:12:00.000Z',
      },
      {
        version: 1,
        fileName: 'support-sla-v1.pdf',
        uploadedBy: 'Avery Admin',
        uploadedAt: '2026-10-05T11:26:00.000Z',
      },
    ],
  },
  {
    id: 'doc-006',
    title: 'Security Training Deck',
    status: 'approved',
    versions: [
      {
        version: 5,
        fileName: 'security-training-v5.pdf',
        uploadedBy: 'Avery Admin',
        uploadedAt: '2026-08-14T09:00:00.000Z',
      },
      {
        version: 4,
        fileName: 'security-training-v4.pdf',
        uploadedBy: 'Rowan Reviewer',
        uploadedAt: '2026-07-30T12:45:00.000Z',
      },
    ],
  },
  {
    id: 'doc-007',
    title: 'Contract Template Review',
    status: 'draft',
    versions: [
      {
        version: 1,
        fileName: 'contract-template-review.pdf',
        uploadedBy: 'Rowan Reviewer',
        uploadedAt: '2026-11-08T16:20:00.000Z',
      },
    ],
  },
  {
    id: 'doc-008',
    title: 'Board Meeting Minutes',
    status: 'in_review',
    versions: [
      {
        version: 2,
        fileName: 'board-minutes-october.pdf',
        uploadedBy: 'Avery Admin',
        uploadedAt: '2026-10-31T17:05:00.000Z',
      },
      {
        version: 1,
        fileName: 'board-minutes-september.pdf',
        uploadedBy: 'Avery Admin',
        uploadedAt: '2026-09-29T17:10:00.000Z',
      },
    ],
  },
  {
    id: 'doc-009',
    title: 'Third Party Risk Assessment',
    status: 'draft',
    versions: [
      {
        version: 1,
        fileName: 'third-party-risk-assessment.pdf',
        uploadedBy: 'Rowan Reviewer',
        uploadedAt: '2026-11-11T08:37:00.000Z',
      },
    ],
  },
  {
    id: 'doc-010',
    title: 'Product Launch Checklist',
    status: 'approved',
    versions: [
      {
        version: 3,
        fileName: 'product-launch-checklist-v3.pdf',
        uploadedBy: 'Avery Admin',
        uploadedAt: '2026-08-07T13:19:00.000Z',
      },
      {
        version: 2,
        fileName: 'product-launch-checklist-v2.pdf',
        uploadedBy: 'Rowan Reviewer',
        uploadedAt: '2026-07-29T10:48:00.000Z',
      },
      {
        version: 1,
        fileName: 'product-launch-checklist-v1.pdf',
        uploadedBy: 'Avery Admin',
        uploadedAt: '2026-07-20T15:33:00.000Z',
      },
    ],
  },
];

/**
 * Kept on `globalThis` so the seed survives a hot reload in development and a
 * module re-import in production. A real database would replace this whole file.
 */
const globalForDb = globalThis as unknown as { __docvaultDocuments?: DocumentItem[] };

const documents: DocumentItem[] =
  globalForDb.__docvaultDocuments ?? (globalForDb.__docvaultDocuments = seedDocuments());

export const listDocuments = (): DocumentItem[] => documents;

export const findDocument = (id: string): DocumentItem | undefined =>
  documents.find((document) => document.id === id);

export const insertDocument = (document: DocumentItem): DocumentItem => {
  documents.unshift(document);
  return document;
};

export const updateDocument = (
  id: string,
  patch: Partial<Pick<DocumentItem, 'title' | 'status'>>,
): DocumentItem | undefined => {
  const document = findDocument(id);
  if (!document) return undefined;
  Object.assign(document, patch);
  return document;
};

export const appendVersion = (
  id: string,
  version: DocumentVersion,
): DocumentItem | undefined => {
  const document = findDocument(id);
  if (!document) return undefined;
  document.versions.unshift(version);
  return document;
};

export const removeDocument = (id: string): boolean => {
  const index = documents.findIndex((document) => document.id === id);
  if (index === -1) return false;
  documents.splice(index, 1);
  return true;
};

export const nextDocumentId = (): string => {
  const highest = documents.reduce((max, document) => {
    const numeric = Number(document.id.replace('doc-', ''));
    return Number.isFinite(numeric) && numeric > max ? numeric : max;
  }, 0);
  return `doc-${String(highest + 1).padStart(3, '0')}`;
};
