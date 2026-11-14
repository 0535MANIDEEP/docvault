'use client';

import { useState, type DragEvent } from 'react';

import {
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_MB,
  hasAllowedExtension,
} from '@/lib/schemas';
import type { DocumentItem } from '@/types';

interface UploadDropzoneProps {
  documentId: string;
  onUploaded: (document: DocumentItem) => void;
}

/**
 * Only the file name and size are stored. The file itself is never sent to the
 * server, which keeps this a permission demo rather than a file store.
 */
export function UploadDropzone({ documentId, onUploaded }: UploadDropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setError('');

    if (file.size > MAX_UPLOAD_BYTES) {
      setError(`That file is larger than ${MAX_UPLOAD_MB} MB.`);
      return;
    }

    if (!hasAllowedExtension(file.name)) {
      setError('Only PDF, PNG, JPG and TXT files are accepted.');
      return;
    }

    setUploading(true);
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, size: file.size }),
      });

      const payload = (await response.json()) as { document?: DocumentItem; error?: string };

      if (!response.ok || !payload.document) {
        setError(payload.error ?? 'That version could not be uploaded.');
        return;
      }

      onUploaded(payload.document);
    } catch {
      setError('The server could not be reached.');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void upload(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="version-upload"
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-start gap-1 border border-dashed px-4 py-6 transition-colors ${
          dragging ? 'border-ink bg-sheet' : 'border-rule bg-paper hover:border-ink-soft'
        }`}
      >
        <span className="text-sm text-ink">
          {uploading ? 'Uploading' : 'Drop a file here, or choose one'}
        </span>
        <span className="text-sm text-ink-soft">
          PDF, PNG, JPG or TXT, up to {MAX_UPLOAD_MB} MB. The name is recorded, the file
          is not stored.
        </span>
        <input
          id="version-upload"
          type="file"
          className="sr-only"
          accept=".pdf,.png,.jpg,.jpeg,.txt"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
          }}
        />
      </label>

      {error ? (
        <p role="alert" className="text-sm text-seal">
          {error}
        </p>
      ) : null}
    </div>
  );
}
