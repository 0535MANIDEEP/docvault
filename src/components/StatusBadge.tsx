import type { DocStatus } from '@/types';

const STATUS_META: Record<DocStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'text-ink-soft border-rule' },
  in_review: { label: 'In review', className: 'text-pending border-pending' },
  approved: { label: 'Approved', className: 'text-verdict border-verdict' },
};

/**
 * A status stamp, the way it is marked on a file in a register.
 */
export function StatusBadge({ status }: { status: DocStatus }) {
  const meta = STATUS_META[status];

  return (
    <span
      className={`inline-flex items-center gap-2 border px-2 py-[3px] font-mono text-[11px] uppercase tracking-[0.14em] ${meta.className}`}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />
      {meta.label}
    </span>
  );
}
