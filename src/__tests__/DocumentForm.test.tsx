import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DocumentForm } from '@/components/DocumentForm';
import type { DocumentItem } from '@/types';

const fetchMock = vi.fn();

const createdDocument: DocumentItem = {
  id: 'doc-011',
  title: 'Employee Handbook 2026',
  status: 'draft',
  versions: [],
};

describe('DocumentForm', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('refuses a title that is too short and never calls the API', async () => {
    const onCreated = vi.fn();
    render(<DocumentForm onCreated={onCreated} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'ab' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create document' }));

    expect(
      await screen.findByText('Title needs at least 3 characters'),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(onCreated).not.toHaveBeenCalled();
  });

  it('creates the document and hands it back to the page', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ document: createdDocument }),
    });

    const onCreated = vi.fn();
    render(<DocumentForm onCreated={onCreated} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Employee Handbook 2026' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create document' }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(createdDocument));
    expect(fetchMock).toHaveBeenCalledWith('/api/documents', expect.objectContaining({ method: 'POST' }));
  });

  it('shows the message the server sent when it refuses', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Only an admin can create documents' }),
    });

    render(<DocumentForm onCreated={vi.fn()} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'A valid title' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create document' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Only an admin can create documents',
    );
  });
});
