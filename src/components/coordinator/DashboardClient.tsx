"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useDemo } from "@/lib/demo/store";
import { DEFAULT_CONFIG, rankUnits, type Ranked } from "@/lib/ranking";
import type { DemoUnit } from "@/lib/demo/state";
import { STATUS_EN, STATUS_ORDER, type UnitStatus } from "@/lib/status";
import { agoEn, csvCell, monthsEn } from "@/lib/format";
import { periodLabelId } from "@/lib/whatsapp/build-link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ScoreTooltip } from "@/components/ui/ScoreTooltip";
import { EmptyState, PageSkeleton } from "@/components/ui/EmptyState";

type Filter = "ALL" | UnitStatus;

function reason(u: Ranked<DemoUnit>): string {
  const parts: string[] = [STATUS_EN[u.status]];
  if (u.silentCycles > 0) parts.push(`${u.silentCycles} silent cycle${u.silentCycles > 1 ? "s" : ""}`);
  parts.push(u.monthsSinceContact === null ? "never contacted" : u.monthsSinceContact >= 3 ? `no contact ${u.monthsSinceContact} mo` : "recent contact");
  return parts.join(" · ");
}

export function DashboardClient() {
  const { state } = useDemo();
  const [filter, setFilter] = useState<Filter>("ALL");
  const [q, setQ] = useState("");
  const cfg = DEFAULT_CONFIG;

  const ranked = useMemo(() => (state ? rankUnits(state.units, cfg) : []), [state, cfg]);
  if (!state) return <PageSkeleton />;

  const now = new Date();
  const closed = state.units.filter((u) => u.status === "CLOSED");
  const counts: Record<UnitStatus, number> = { OPERATING: 0, PAUSED: 0, CLOSED: 0, UNCONFIRMED: 0 };
  state.units.forEach((u) => counts[u.status]++);

  const match = (u: DemoUnit) => u.name.toLowerCase().includes(q.trim().toLowerCase());
  const rows = ranked.filter((u) => (filter === "ALL" || filter === u.status) && match(u));
  const closedRows = filter === "ALL" || filter === "CLOSED" ? closed.filter(match) : [];

  const exportCsv = () => {
    const head = ["rank", "unit", "kelurahan", "status", "silent_cycles", "months_since_contact", "score", "is_synthetic"];
    const lines = ranked.map((u) =>
      [u.rank, u.name, u.kelurahan, u.status, u.silentCycles, u.monthsSinceContact, u.score, "true"].map(csvCell).join(","),
    );
    const blob = new Blob([[head.join(","), ...lines].join("\n") + "\n"], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `visit-list-${state.cycle}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wide text-brand">Screen 3 · Coordinator dashboard</p>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Visit priority — {periodLabelId(state.cycle)}</h1>
          <p className="text-muted">Kecamatan Gunungpati · {state.units.length} simulated units</p>
        </div>
        <button type="button" onClick={exportCsv} className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold hover:bg-brand-soft">
          Export visit list (CSV)
        </button>
      </div>

      <section aria-label="Status summary" className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {STATUS_ORDER.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(filter === s ? "ALL" : s)}
            aria-pressed={filter === s}
            className={`rounded-xl border bg-white p-4 text-left hover:bg-brand-soft/60 ${filter === s ? "border-brand ring-2 ring-brand/30" : "border-line"}`}
          >
            <span className="block text-3xl font-extrabold tabular-nums">{counts[s]}</span>
            <StatusBadge status={s} />
          </button>
        ))}
      </section>

      <section aria-label="Top visits" className="mt-6">
        <h2 className="text-lg font-bold">Contact first (top 5)</h2>
        <ol className="mt-2 grid gap-2 md:grid-cols-5">
          {ranked.slice(0, 5).map((u) => (
            <li key={u.id} className="rounded-xl border border-line bg-white p-3">
              <p className="text-xs font-bold text-muted">#{u.rank} · score {u.score}</p>
              <Link href={`/units/${u.id}`} className="font-semibold text-brand underline underline-offset-2">{u.name}</Link>
              <p className="mt-1 text-xs text-muted">{reason(u)}</p>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-6 rounded-lg bg-brand-soft px-3 py-2 text-sm">
        <b>Score = {cfg.wSilent}×M + W + B</b> — deterministic heuristic, no AI. M = consecutive silent cycles, W = status weight
        (Unconfirmed {cfg.wUnconfirmed}, Paused {cfg.wPaused}, Operating 0), B = no-contact bonus (+2 never/&gt;6 mo, +1 for 3–6 mo).
        Initial weights, to be calibrated with practitioners. Closed units are excluded.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="q">Search unit</label>
        <input
          id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search unit name…"
          className="min-h-[44px] w-full max-w-xs rounded-lg border border-line bg-white px-3"
        />
        {(["ALL", ...STATUS_ORDER] as Filter[]).map((f) => (
          <button
            key={f} type="button" onClick={() => setFilter(f)} aria-pressed={filter === f}
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${filter === f ? "border-brand bg-brand text-white" : "border-line bg-white hover:bg-brand-soft"}`}
          >
            {f === "ALL" ? "All" : STATUS_EN[f]}
          </button>
        ))}
      </div>

      <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-paper text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3 py-2">#</th><th className="px-3 py-2">Unit</th><th className="px-3 py-2">Status</th>
              <th className="hidden px-3 py-2 md:table-cell">Silent</th>
              <th className="hidden px-3 py-2 md:table-cell">Last signal</th>
              <th className="hidden px-3 py-2 md:table-cell">Last contact</th>
              <th className="px-3 py-2">Score</th><th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((u) => (
              <tr key={u.id} className="hover:bg-brand-soft/40">
                <td className="px-3 py-2 font-mono font-bold">{u.rank}</td>
                <td className="px-3 py-2"><Link href={`/units/${u.id}`} className="font-semibold text-brand underline underline-offset-2">{u.name}</Link><span className="block text-xs text-muted">{u.kelurahan}</span></td>
                <td className="px-3 py-2"><StatusBadge status={u.status} /></td>
                <td className="hidden px-3 py-2 md:table-cell">{u.silentCycles}</td>
                <td className="hidden px-3 py-2 md:table-cell">{agoEn(u.lastSignalAt, now)}</td>
                <td className="hidden px-3 py-2 md:table-cell">{monthsEn(u.monthsSinceContact)}</td>
                <td className="px-3 py-2"><ScoreTooltip b={u.breakdown} silentCycles={u.silentCycles} cfg={cfg} /></td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <Link href={`/cycles?unit=${u.id}`} className="mr-2 rounded border border-line px-2 py-1 text-xs font-semibold hover:bg-brand-soft">Remind</Link>
                  <Link href={`/units/${u.id}`} className="rounded bg-brand px-2 py-1 text-xs font-semibold text-white hover:bg-teal-950">Log contact</Link>
                </td>
              </tr>
            ))}
            {closedRows.map((u) => (
              <tr key={u.id} className="bg-paper/60 text-muted">
                <td className="px-3 py-2">—</td>
                <td className="px-3 py-2"><Link href={`/units/${u.id}`} className="font-semibold underline underline-offset-2">{u.name}</Link><span className="block text-xs">{u.kelurahan}</span></td>
                <td className="px-3 py-2"><StatusBadge status="CLOSED" /></td>
                <td className="hidden px-3 py-2 md:table-cell">{u.silentCycles}</td>
                <td className="hidden px-3 py-2 md:table-cell">{agoEn(u.lastSignalAt, now)}</td>
                <td className="hidden px-3 py-2 md:table-cell">{monthsEn(u.monthsSinceContact)}</td>
                <td className="px-3 py-2 text-xs">excluded</td>
                <td className="px-3 py-2 text-right text-xs">archived</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length + closedRows.length === 0 && <EmptyState title="No units match" hint="Clear the search or pick another status." />}
      </div>
    </div>
  );
}
