import { STATS } from "./content";

export function StatsBar() {
  return (
    <section className="bg-white border-y border-green-100 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="group/stat lift-soft rounded-fib4 p-3 text-center">
              <div className="text-3xl font-extrabold text-green-mid sm:text-4xl transition-colors group-hover/stat:text-green-dark">{s.value}</div>
              <div className="mt-1 text-sm font-semibold text-ink transition-colors group-hover/stat:text-green-dark">{s.label}</div>
              <div className="text-xs text-muted mt-0.5 transition-colors group-hover/stat:text-brand">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
