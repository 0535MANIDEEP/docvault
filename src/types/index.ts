export type Role = 'admin' | 'reviewer' | 'viewer';
export type DocStatus = 'draft' | 'in_review' | 'approved';

export interface User {
  id: string;
  name: string;
  role: Role;
}

export interface DocumentVersion {
  version: number;
  fileName: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  status: DocStatus;
  versions: DocumentVersion[];
}
