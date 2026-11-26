export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-white/60 px-4 py-10 text-center">
      <p className="font-semibold">{title}</p>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-4" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-1/2 rounded bg-line" />
      <div className="h-24 rounded bg-line/70" />
      <div className="h-24 rounded bg-line/70" />
    </div>
  );
}
