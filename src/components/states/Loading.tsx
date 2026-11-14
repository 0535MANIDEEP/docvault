export function Loading({ label = 'Loading' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-3">
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">{label}</span>
      <div className="space-y-2">
        {[0, 1, 2].map((row) => (
          <div key={row} className="h-11 w-full animate-pulse bg-rule/70 motion-reduce:animate-none" />
        ))}
      </div>
    </div>
  );
}
