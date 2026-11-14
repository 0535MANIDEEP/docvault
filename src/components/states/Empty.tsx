import type { ReactNode } from 'react';

interface EmptyProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function Empty({ title, description, action }: EmptyProps) {
  return (
    <div className="flex flex-col items-start gap-3 border border-dashed border-rule bg-sheet px-6 py-12">
      <h2 className="font-serif text-lg">{title}</h2>
      <p className="max-w-prose text-sm text-ink-soft">{description}</p>
      {action}
    </div>
  );
}
