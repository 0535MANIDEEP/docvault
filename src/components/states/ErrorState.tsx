interface ErrorStateProps {
  title?: string;
  description: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'That did not load',
  description,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 border border-seal/40 bg-sheet px-6 py-8"
    >
      <h2 className="font-serif text-lg">{title}</h2>
      <p className="max-w-prose text-sm text-ink-soft">{description}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="border border-ink bg-sheet px-4 py-2 text-sm text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}
