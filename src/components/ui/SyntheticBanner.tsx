export function SyntheticBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div
      role="note"
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-amber-300 bg-amber-100 text-amber-950 ${
        compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
      }`}
    >
      <span className="rounded bg-amber-900 px-1.5 py-0.5 text-[11px] font-bold tracking-wide text-amber-50">SIMULATED DATA</span>
      <span>Prototype mockup · simulated Gunungpati dataset · no real waste banks, no resident data</span>
    </div>
  );
}
