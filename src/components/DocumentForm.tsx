'use client';

import { useState, type FormEvent } from 'react';

import { documentCreateSchema, toFieldErrors, type FieldErrors } from '@/lib/schemas';
import type { DocStatus, DocumentItem } from '@/types';

interface DocumentFormProps {
  onCreated: (document: DocumentItem) => void;
  onCancel: () => void;
}

const STATUS_OPTIONS: { value: DocStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'in_review', label: 'In review' },
  { value: 'approved', label: 'Approved' },
];

export function DocumentForm({ onCreated, onCancel }: DocumentFormProps) {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<DocStatus>('draft');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    setFieldErrors({});

    const parsed = documentCreateSchema.safeParse({ title, status });
    if (!parsed.success) {
      setFieldErrors(toFieldErrors(parsed.error));
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: parsed.data.title, status: parsed.data.status }),
      });

      const payload = (await response.json()) as {
        document?: DocumentItem;
        error?: string;
        fields?: FieldErrors;
      };

      if (!response.ok) {
        if (payload.fields) setFieldErrors(payload.fields);
        else setFormError(payload.error ?? 'The document could not be created.');
        return;
      }

      if (payload.document) onCreated(payload.document);
      setTitle('');
      setStatus('draft');
    } catch {
      setFormError('The server could not be reached.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex max-w-xl flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="document-title" className="text-sm font-medium">
          Title
        </label>
        <input
          id="document-title"
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-invalid={Boolean(fieldErrors.title)}
          aria-describedby={fieldErrors.title ? 'document-title-error' : 'document-title-hint'}
          className="border border-rule bg-paper px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-soft/70 focus:border-ink"
          placeholder="Employee Handbook 2026"
        />
        {fieldErrors.title ? (
          <p id="document-title-error" className="text-sm text-seal">
            {fieldErrors.title}
          </p>
        ) : (
          <p id="document-title-hint" className="text-sm text-ink-soft">
            Between 3 and 120 characters.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="document-status" className="text-sm font-medium">
          Status
        </label>
        <select
          id="document-status"
          value={status}
          onChange={(event) => setStatus(event.target.value as DocStatus)}
          className="border border-rule bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {formError ? (
        <p role="alert" className="border border-seal/40 bg-sheet px-3 py-2 text-sm text-seal">
          {formError}
        </p>
      ) : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="border border-ink bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink-soft disabled:opacity-60"
        >
          {submitting ? 'Creating' : 'Create document'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border border-rule bg-sheet px-4 py-2 text-sm text-ink transition-colors hover:border-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
