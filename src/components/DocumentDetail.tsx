'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { RoleGate } from '@/components/RoleGate';
import { StatusBadge } from '@/components/StatusBadge';
import { UploadDropzone } from '@/components/UploadDropzone';
import { ErrorState } from '@/components/states/ErrorState';
import { Loading } from '@/components/states/Loading';
import { documentCreateSchema, toFieldErrors, type FieldErrors } from '@/lib/schemas';
import { fetchDocument } from '@/lib/clientApi';
import type { DocStatus, DocumentItem } from '@/types';

interface DocumentDetailProps {
  id: string;
}

const STATUS_ACTIONS: { value: DocStatus; label: string }[] = [
  { value: 'draft', label: 'Return to draft' },
  { value: 'in_review', label: 'Move to review' },
  { value: 'approved', label: 'Approve' },
];

interface Verdict {
  status: number;
  message: string;
}

export function DocumentDetail({ id }: DocumentDetailProps) {
  const router = useRouter();

  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [verdict, setVerdict] = useState<Verdict | null>(null);

  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState('');
  const [titleErrors, setTitleErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    fetchDocument(id)
      .then((result) => {
        if (!active) return;
        setDocument(result);
        setTitle(result.title);
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
  }, [id, reloadKey]);

  const retry = useCallback(() => {
    setStatus('loading');
    setErrorMessage('');
    setReloadKey((key) => key + 1);
  }, []);

  const patch = async (body: Record<string, unknown>) => {
    setActionError('');
    setVerdict(null);
    setBusy(true);
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as { document?: DocumentItem; error?: string };

      if (!response.ok) {
        setActionError(payload.error ?? 'That change could not be saved.');
        return;
      }

      if (payload.document) setDocument(payload.document);
    } catch {
      setActionError('The server could not be reached.');
    } finally {
      setBusy(false);
    }
  };

  /**
   * Asks the server what it would decide, without changing anything.
   */
  const askTheServer = async () => {
    setActionError('');
    setBusy(true);
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved', check: true }),
      });
      const payload = (await response.json()) as { error?: string };

      setVerdict({
        status: response.status,
        message:
          payload.error ??
          'The server allowed this change and did not apply it.',
      });
    } catch {
      setActionError('The server could not be reached.');
    } finally {
      setBusy(false);
    }
  };

  const saveTitle = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTitleErrors({});

    const parsed = documentCreateSchema.shape.title.safeParse(title);
    if (!parsed.success) {
      setTitleErrors(toFieldErrors(parsed.error));
      return;
    }

    await patch({ title: parsed.data });
    setEditingTitle(false);
  };

  const remove = async () => {
    setActionError('');
    setBusy(true);
    try {
      const response = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setActionError(payload.error ?? 'That document could not be deleted.');
        return;
      }

      router.push('/documents');
      router.refresh();
    } catch {
      setActionError('The server could not be reached.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <Link
        href="/documents"
        className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft transition-colors hover:text-ink"
      >
        ← Documents
      </Link>

      {status === 'loading' ? (
        <div className="mt-8">
          <Loading label="Loading document" />
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="mt-8">
          <ErrorState description={errorMessage} onRetry={retry} />
        </div>
      ) : null}

      {status === 'ready' && document ? (
        <>
          <div className="mt-6 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="font-serif text-3xl font-semibold tracking-tight">
                {document.title}
              </h1>
              <StatusBadge status={document.status} />
            </div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
              {document.id} — {document.versions.length}{' '}
              {document.versions.length === 1 ? 'version' : 'versions'}
            </p>
          </div>

          {actionError ? (
            <p
              role="alert"
              className="mt-6 border border-seal/40 bg-sheet px-4 py-3 text-sm text-seal"
            >
              {actionError}
            </p>
          ) : null}

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
            <section>
              <h2 className="font-serif text-lg">Version history</h2>
              {document.versions.length === 0 ? (
                <p className="mt-4 text-sm text-ink-soft">
                  No versions filed yet. A reviewer or admin can upload the first one.
                </p>
              ) : (
                <ol className="mt-4 flex flex-col">
                  {document.versions.map((version) => (
                    <li key={version.version} className="border-l-2 border-rule py-3 pl-4">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="font-mono text-xs text-ink">v{version.version}</span>
                        <span className="text-sm">{version.fileName}</span>
                      </div>
                      <p className="mt-1 flex flex-wrap gap-x-3 font-mono text-[11px] text-ink-soft">
                        <span>{version.uploadedBy}</span>
                        <span>{new Date(version.uploadedAt).toISOString().slice(0, 10)}</span>
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            <section className="flex flex-col gap-8">
              <div>
                <h2 className="font-serif text-lg">Actions</h2>

                <div className="mt-4 flex flex-col gap-6">
                  <RoleGate permission="doc:review">
                    <div className="flex flex-col gap-2">
                      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
                        Status
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {STATUS_ACTIONS.map((action) => (
                          <button
                            key={action.value}
                            type="button"
                            disabled={busy || document.status === action.value}
                            onClick={() => void patch({ status: action.value })}
                            className="border border-rule bg-sheet px-3 py-1.5 text-sm text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:text-ink-soft/60"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </RoleGate>

                  <RoleGate permission="doc:upload">
                    <div className="flex flex-col gap-2">
                      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
                        New version
                      </span>
                      <UploadDropzone
                        documentId={document.id}
                        onUploaded={(updated) => setDocument(updated)}
                      />
                    </div>
                  </RoleGate>

                  <RoleGate permission="doc:create">
                    <div className="flex flex-col gap-2">
                      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
                        Title
                      </span>
                      {editingTitle ? (
                        <form onSubmit={saveTitle} noValidate className="flex flex-col gap-2">
                          <label htmlFor="detail-title" className="sr-only">
                            Document title
                          </label>
                          <input
                            id="detail-title"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            aria-invalid={Boolean(titleErrors.title)}
                            className="border border-rule bg-sheet px-3 py-2 text-smfocus:border-ink"
                          />
                          {titleErrors.title ? (
                            <p className="text-sm text-seal">{titleErrors.title}</p>
                          ) : null}
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              disabled={busy}
                              className="border border-ink bg-ink px-3 py-1.5 text-sm text-paper transition-colors hover:bg-ink-soft disabled:opacity-60"
                            >
                              Save title
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTitle(false);
                                setTitle(document.title);
                                setTitleErrors({});
                              }}
                              className="border border-rule bg-sheet px-3 py-1.5 text-sm text-ink transition-colors hover:border-ink"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingTitle(true)}
                          className="self-start border border-rule bg-sheet px-3 py-1.5 text-sm text-ink transition-colors hover:border-ink"
                        >
                          Edit title
                        </button>
                      )}
                    </div>
                  </RoleGate>

                  <RoleGate permission="doc:delete">
                    <div className="flex flex-col gap-2">
                      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
                        Danger
                      </span>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void remove()}
                        className="self-start border border-seal px-3 py-1.5 text-sm text-seal transition-colors hover:bg-seal hover:text-paper disabled:opacity-60"
                      >
                        Delete document
                      </button>
                    </div>
                  </RoleGate>
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-rule pt-6">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
                  Ask the server
                </span>
                <p className="text-sm text-ink-soft">
                  Hidden buttons are only a convenience. Ask the API to change the status
                  and watch it decide.
                </p>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void askTheServer()}
                  className="self-start border border-rule bg-sheet px-3 py-1.5 text-sm text-ink transition-colors hover:border-ink disabled:opacity-60"
                >
                  Check with the server
                </button>
                {verdict ? (
                  <p
                    role="status"
                    className="border border-rule bg-sheet px-3 py-2 font-mono text-xs text-ink"
                  >
                    {verdict.status} — {verdict.message}
                  </p>
                ) : null}
              </div>
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}
