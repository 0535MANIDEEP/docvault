'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { DocumentForm } from '@/components/DocumentForm';
import { RoleGate } from '@/components/RoleGate';
import { StatusBadge } from '@/components/StatusBadge';
import { Empty } from '@/components/states/Empty';
import { ErrorState } from '@/components/states/ErrorState';
import { Loading } from '@/components/states/Loading';
import { fetchDocuments } from '@/lib/clientApi';
import type { DocStatus, DocumentItem } from '@/types';

type SortKey = 'title' | 'status' | 'versions' | 'updated';
type SortDirection = 'asc' | 'desc';

const STATUS_ORDER: Record<DocStatus, number> = { draft: 0, in_review: 1, approved: 2 };

const STATUS_FILTERS: { value: 'all' | DocStatus; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'in_review', label: 'In review' },
  { value: 'approved', label: 'Approved' },
];

const lastUpdated = (document: DocumentItem): number => {
  if (document.versions.length === 0) return 0;
  return Math.max(...document.versions.map((version) => Date.parse(version.uploadedAt)));
};

const compare = (a: DocumentItem, b: DocumentItem, key: SortKey): number => {
  switch (key) {
    case 'title':
      return a.title.localeCompare(b.title);
    case 'status':
      return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    case 'versions':
      return a.versions.length - b.versions.length;
    case 'updated':
      return lastUpdated(a) - lastUpdated(b);
  }
};

export function DocumentTable() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [actionError, setActionError] = useState('');

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | DocStatus>('all');
  const [sortKey, setSortKey] = useState<SortKey>('updated');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [creating, setCreating] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    fetchDocuments()
      .then((result) => {
        if (!active) return;
        setDocuments(result);
        setStatus('ready');
      })
      .catch((error: Error) => {
        if (!active) return;
        setErrorMessage(error.message);
        setStatus('error');
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const retry = useCallback(() => {
    setStatus('loading');
    setErrorMessage('');
    setReloadKey((key) => key + 1);
  }, []);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const filtered = documents.filter((document) => {
      const matchesQuery = needle.length === 0 || document.title.toLowerCase().includes(needle);
      const matchesStatus = statusFilter === 'all' || document.status === statusFilter;
      return matchesQuery && matchesStatus;
    });

    const direction = sortDirection === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => compare(a, b, sortKey) * direction);
  }, [documents, query, statusFilter, sortKey, sortDirection]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDirection(key === 'title' ? 'asc' : 'desc');
  };

  const remove = async (document: DocumentItem) => {
    setActionError('');
    const response = await fetch(`/api/documents/${document.id}`, { method: 'DELETE' });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setActionError(payload.error ?? 'That document could not be deleted.');
      return;
    }

    setDocuments((current) => current.filter((item) => item.id !== document.id));
  };

  const sortIndicator = (key: SortKey) => (sortKey === key ? (sortDirection === 'asc' ? '↑' : '↓') : '');

  const ariaSort = (key: SortKey): 'ascending' | 'descending' | 'none' =>
    sortKey === key ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none';

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-3xl font-semibold tracking-tight">Documents</h1>
          <p className="text-sm text-ink-soft">
            {status === 'ready'
              ? `${visible.length} of ${documents.length} shown`
              : 'Reading the register'}
          </p>
        </div>

        <RoleGate permission="doc:create">
          <button
            type="button"
            onClick={() => setCreating((current) => !current)}
            className="border border-ink bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink-soft"
          >
            {creating ? 'Cancel' : 'New document'}
          </button>
        </RoleGate>
      </div>

      {creating ? (
        <div className="mt-6 border border-rule bg-sheet px-6 py-6">
          <DocumentForm
            onCreated={(document) => {
              setDocuments((current) => [document, ...current]);
              setCreating(false);
            }}
            onCancel={() => setCreating(false)}
          />
        </div>
      ) : null}

      {actionError ? (
        <p
          role="alert"
          className="mt-6 border border-seal/40 bg-sheet px-4 py-3 text-sm text-seal"
        >
          {actionError}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <label htmlFor="doc-search" className="sr-only">
          Search documents by title
        </label>
        <input
          id="doc-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by title"
          className="w-full max-w-xs border border-rule bg-sheet px-3 py-2 text-sm text-inkplaceholder:text-ink-soft/70 focus:border-ink"
        />

        <label htmlFor="doc-status" className="sr-only">
          Filter by status
        </label>
        <select
          id="doc-status"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as 'all' | DocStatus)}
          className="border border-rule bg-sheet px-3 py-2 text-sm text-inkfocus:border-ink"
        >
          {STATUS_FILTERS.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {status === 'loading' ? <Loading label="Loading documents" /> : null}

        {status === 'error' ? (
          <ErrorState description={errorMessage} onRetry={retry} />
        ) : null}

        {status === 'ready' && visible.length === 0 ? (
          <Empty
            title="No documents match"
            description={
              documents.length === 0
                ? 'Nothing has been filed yet. An admin can create the first record.'
                : 'Clear the search or pick a different status to see more of the register.'
            }
          />
        ) : null}

        {status === 'ready' && visible.length > 0 ? (
          <div className="overflow-x-auto border border-rule bg-sheet">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">
                Documents in the register, with status, version count and last update
              </caption>
              <thead>
                <tr className="border-b border-rule">
                  {(
                    [
                      { key: 'title', label: 'Title' },
                      { key: 'status', label: 'Status' },
                      { key: 'versions', label: 'Versions' },
                      { key: 'updated', label: 'Last updated' },
                    ] as { key: SortKey; label: string }[]
                  ).map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      aria-sort={ariaSort(column.key)}
                      className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        className="inline-flex items-center gap-1 transition-colors hover:text-ink"
                      >
                        {column.label}
                        <span aria-hidden="true">{sortIndicator(column.key)}</span>
                      </button>
                    </th>
                  ))}
                  <th scope="col" className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((document) => (
                  <tr key={document.id} className="border-b border-rule last:border-b-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/documents/${document.id}`}
                        className="font-serif text-base underline-offset-4 hover:underline"
                      >
                        {document.title}
                      </Link>
                      <span className="mt-0.5 block font-mono text-[11px] text-ink-soft">
                        {document.id}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={document.status} />
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-ink-soft">
                      {document.versions.length}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-soft">
                      {lastUpdated(document) === 0
                        ? '—'
                        : new Date(lastUpdated(document)).toISOString().slice(0, 10)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <RoleGate permission="doc:delete">
                        <button
                          type="button"
                          onClick={() => void remove(document)}
                          className="border border-rule px-3 py-1.5 text-sm text-ink-soft transition-colors hover:border-seal hover:text-seal"
                        >
                          Delete
                        </button>
                      </RoleGate>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}
