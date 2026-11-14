import type { DocumentItem } from '@/types';

interface ApiError {
  error?: string;
}

/**
 * Browser-side calls to the document API. Kept at module scope so the React
 * compiler does not inline them into a component's effect.
 */
export const fetchDocuments = async (): Promise<DocumentItem[]> => {
  const response = await fetch('/api/documents');
  const payload = (await response.json()) as ApiError & { documents?: DocumentItem[] };

  if (!response.ok) {
    throw new Error(payload.error ?? 'The documents could not be loaded.');
  }

  return payload.documents ?? [];
};

export const fetchDocument = async (id: string): Promise<DocumentItem> => {
  const response = await fetch(`/api/documents/${id}`);
  const payload = (await response.json()) as ApiError & { document?: DocumentItem };

  if (!response.ok || !payload.document) {
    throw new Error(payload.error ?? 'That document could not be loaded.');
  }

  return payload.document;
};
