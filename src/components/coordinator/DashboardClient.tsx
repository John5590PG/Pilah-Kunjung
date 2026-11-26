"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAppData } from "@/lib/appdata/provider";
import { rankUnits, type Ranked } from "@/lib/ranking";
import type { DemoUnit } from "@/lib/demo/state";
import { STATUS_EN, STATUS_ORDER, type UnitStatus } from "@/lib/status";
import { agoEn, csvCell, monthsEn } from "@/lib/format";
import { periodLabelId } from "@/lib/whatsapp/build-link";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ScoreTooltip } from "@/components/common/ScoreTooltip";
import { EmptyState, PageSkeleton } from "@/components/common/EmptyState";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Search, Download, AlertCircle, PhoneCall, ExternalLink } from "lucide-react";

type Filter = "ALL" | UnitStatus;

function reason(u: Ranked<DemoUnit>): string {
  const parts: string[] = [STATUS_EN[u.status]];
  if (u.silentCycles > 0) parts.push(`${u.silentCycles} silent cycle${u.silentCycles > 1 ? "s" : ""}`);
  parts.push(u.monthsSinceContact === null ? "never contacted" : u.monthsSinceContact >= 3 ? `no contact ${u.monthsSinceContact} mo` : "recent contact");
  return parts.join(" · ");
}

export function DashboardClient() {
  const { state, config: cfg, mode, error } = useAppData();
  const [filter, setFilter] = useState<Filter>("ALL");
  const [q, setQ] = useState("");

  const ranked = useMemo(() => (state ? rankUnits(state.units, cfg) : []), [state, cfg]);
  if (!state) return <PageSkeleton />;

  const now = new Date();
  const closed = state.units.filter((u) => u.status === "CLOSED");
  const counts: Record<UnitStatus, number> = { OPERATING: 0, PAUSED: 0, CLOSED: 0, UNCONFIRMED: 0 };
  state.units.forEach((u) => counts[u.status]++);

  const match = (u: DemoUnit) => u.name.toLowerCase().includes(q.trim().toLowerCase());
  const rows = ranked.filter((u) => (filter === "ALL" || filter === u.status) && match(u));
  const closedRows = filter === "ALL" || filter === "CLOSED" ? closed.filter(match) : [];

  const exportCsv = async () => {
    let blob: Blob;
    if (mode === "api") {
      const response = await fetch("/api/export", { credentials: "same-origin" });
      blob = await response.blob();
    } else {
      const head = ["rank", "unit", "kelurahan", "status", "silent_cycles", "months_since_contact", "score", "is_synthetic"];
      const lines = ranked.map((u) =>
        [u.rank, u.name, u.kelurahan, u.status, u.silentCycles, u.monthsSinceContact, u.score, "true"].map(csvCell).join(","),
      );
      blob = new Blob([[head.join(","), ...lines].join("\n") + "\n"], { type: "text/csv;charset=utf-8" });
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `visit-list-${state.cycle}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-6">
      {error && (
        <p role="alert" className="rounded-fib3 border border-un/40 bg-un-bg px-3 py-2 text-sm font-semibold text-un">
          {error}
        </p>
      )}
      {/* Top Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-brand">Layar 3 · Dasbor Koordinator</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">
            Prioritas Kunjungan {periodLabelId(state.cycle)}
          </h1>
          <p className="text-sm text-muted">
            Kecamatan Gunungpati · {state.units.length} unit bank sampah simulasi
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={exportCsv}
          className="border-line bg-white/80 hover:bg-green-dark hover:text-white hover:border-green-dark text-ink font-semibold gap-2 shadow-2xs rounded-fib3 transition-all duration-200"
        >
          <Download className="h-4 w-4 text-brand group-hover/button:text-white transition-colors" />
          <span>Ekspor Daftar Kunjungan (CSV)</span>
        </Button>
      </div>

      {/* Status Summary KPI Cards */}
      <section aria-label="Status summary" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATUS_ORDER.map((s) => {
          const isSelected = filter === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(filter === s ? "ALL" : s)}
              aria-pressed={isSelected}
              className="group/kpi lift-soft w-full text-left focus:outline-none cursor-pointer"
            >
              <Card
                className={`rounded-fib4 transition-all duration-200 ${
                  isSelected
                    ? "border-brand ring-2 ring-brand/40 bg-brand-soft/30"
                    : "border-line bg-white"
                } group-hover/kpi:border-green-dark group-hover/kpi:bg-green-dark group-hover/kpi:ring-0`}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-ink tabular-nums transition-colors group-hover/kpi:text-white">
                      {counts[s]}
                    </span>
                    <span className="text-xs font-semibold text-muted transition-colors group-hover/kpi:text-green-light">
                      {isSelected ? "Filter Aktif" : "Klik Filter"}
                    </span>
                  </div>
                  <div>
                    <StatusBadge
                      status={s}
                      className="group-hover/kpi:border-white/30 group-hover/kpi:bg-white/15 group-hover/kpi:text-white"
                    />
                  </div>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </section>

      {/* Top 5 Priority Cards */}
      <section aria-label="Top visits" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Kunjungi Terlebih Dahulu (Top 5 Prioritas)</h2>
          <span className="text-xs text-muted">Dihitung otomatis tanpa AI</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {ranked.slice(0, 5).map((u) => (
            <Card key={u.id} className="group/priority lift-soft rounded-fib4 border-line bg-white shadow-2xs transition-colors duration-200 hover:border-green-dark hover:bg-green-dark">
              <CardContent className="p-3.5 flex flex-col justify-between h-full gap-2">
                <div>
                  <div className="flex items-center justify-between text-xs pb-1">
                    <Badge variant="outline" className="row-chip border-brand/30 bg-brand-soft/50 text-brand font-bold text-[11px] px-1.5 py-0 transition-colors group-hover/priority:border-white/30 group-hover/priority:bg-white/15 group-hover/priority:text-white">
                      Rank #{u.rank}
                    </Badge>
                    <span className="row-chip font-mono font-bold text-ink text-xs bg-paper px-1.5 py-0.5 rounded-fib1 transition-colors group-hover/priority:bg-white/15 group-hover/priority:text-white">
                      Skor {u.score}
                    </span>
                  </div>
                  <Link
                    href={`/units/${u.id}`}
                    className="font-bold text-sm text-ink transition-colors line-clamp-1 mt-1 block hover:text-green-light group-hover/priority:text-white"
                  >
                    {u.name}
                  </Link>
                  <p className="text-[11px] text-muted line-clamp-2 mt-0.5 transition-colors group-hover/priority:text-green-pale">{reason(u)}</p>
                </div>
                <div className="pt-2 border-t border-line/50 flex items-center justify-between transition-colors group-hover/priority:border-white/20">
                  <span className="text-[11px] text-muted transition-colors group-hover/priority:text-white/75">{u.kelurahan}</span>
                  <Link
                    href={`/units/${u.id}`}
                    className="text-xs font-bold text-brand hover:underline inline-flex items-center gap-0.5 transition-colors group-hover/priority:text-green-light"
                  >
                    <span>Detail</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Formula Explanation Callout */}
      <div className="rounded-fib4 border border-brand/20 bg-brand-soft/40 p-4 text-xs md:text-sm text-ink leading-relaxed flex items-start gap-3 transition-shadow hover:shadow-xs">
        <AlertCircle className="h-5 w-5 shrink-0 text-brand mt-0.5" />
        <div>
          <b className="font-bold text-brand">Rumus Peringkat Kunjungan:</b>{" "}
          <span className="font-mono font-bold bg-white/70 px-1.5 py-0.5 rounded border border-brand/20">
            Skor = {cfg.wSilent}×M + W + B
          </span>{" "}
          Murni rumus deterministik, tanpa AI/ML. <b>M</b> = siklus diam berturut-turut, <b>W</b> = bobot status (Unconfirmed {cfg.wUnconfirmed}, Paused {cfg.wPaused}, Operating 0), <b>B</b> = bonus tanpa kontak (+2 belum pernah atau lebih dari 6 bln, +1 untuk 3 sampai 6 bln). Unit Closed dikecualikan dari antrean kunjungan.
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
          <Input
            id="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama bank sampah…"
            className="pl-9 h-10 bg-white/85 border-line text-sm rounded-fib3 hover:border-brand/60 focus-visible:border-brand transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted mr-1">Status:</span>
          {(["ALL", ...STATUS_ORDER] as Filter[]).map((f) => {
            const isSelected = filter === f;
            return (
              <Button
                key={f}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
                className={`text-xs h-8 rounded-fib3 transition-all duration-200 ${
                  isSelected
                    ? "bg-green-mid text-white hover:bg-green-dark"
                    : "border-line bg-white/80 text-ink hover:bg-green-dark hover:text-white hover:border-green-dark"
                }`}
              >
                {f === "ALL" ? "Semua Unit" : STATUS_EN[f]}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Units Table */}
      <Card className="rounded-fib4 border-line bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="bg-paper text-left text-xs uppercase tracking-wider text-muted font-bold border-b border-line">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Bank Sampah</th>
                <th className="px-4 py-3">Status</th>
                <th className="hidden px-4 py-3 md:table-cell">Siklus Diam</th>
                <th className="hidden px-4 py-3 md:table-cell">Laporan Terakhir</th>
                <th className="hidden px-4 py-3 md:table-cell">Kontak Terakhir</th>
                <th className="px-4 py-3">Skor</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((u) => (
                <tr key={u.id} className="unit-row">
                  <td className="px-4 py-3 font-mono font-bold text-xs text-muted">
                    #{u.rank}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/units/${u.id}`}
                      className="font-bold text-ink hover:text-brand transition-colors block"
                    >
                      {u.name}
                    </Link>
                    <span className="block text-xs text-muted">{u.kelurahan}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={u.status} />
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell font-mono text-xs">
                    {u.silentCycles > 0 ? (
                      <span className="font-bold text-un">{u.silentCycles} bln</span>
                    ) : (
                      <span className="text-muted">0</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell text-xs text-muted">
                    {agoEn(u.lastSignalAt, now)}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell text-xs text-muted">
                    {monthsEn(u.monthsSinceContact)}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    <ScoreTooltip b={u.breakdown} silentCycles={u.silentCycles} cfg={cfg} />
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/cycles?unit=${u.id}`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "row-action h-7 px-2.5 text-xs rounded-fib2 border-line bg-white/85 hover:bg-green-dark hover:text-white hover:border-green-dark inline-flex items-center justify-center transition-all duration-200")}
                      >
                        Ingatkan
                      </Link>
                      <Link
                        href={`/units/${u.id}`}
                        className={cn(buttonVariants({ size: "sm" }), "row-action h-7 px-2.5 text-xs rounded-fib2 bg-green-mid text-white hover:bg-green-dark inline-flex items-center justify-center transition-all duration-200")}
                      >
                        <PhoneCall className="h-3 w-3 mr-1" />
                        Catat
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {closedRows.map((u) => (
                <tr key={u.id} className="unit-row bg-paper/40 text-muted">
                  <td className="px-4 py-3 font-mono text-xs">-</td>
                  <td className="px-4 py-3">
                    <Link href={`/units/${u.id}`} className="font-semibold underline underline-offset-2 hover:text-ink">
                      {u.name}
                    </Link>
                    <span className="block text-xs">{u.kelurahan}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status="CLOSED" />
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell text-xs">{u.silentCycles}</td>
                  <td className="hidden px-4 py-3 md:table-cell text-xs">{agoEn(u.lastSignalAt, now)}</td>
                  <td className="hidden px-4 py-3 md:table-cell text-xs">{monthsEn(u.monthsSinceContact)}</td>
                  <td className="px-4 py-3 text-xs italic">dikecualikan</td>
                  <td className="px-4 py-3 text-right text-xs">diarsipkan</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length + closedRows.length === 0 && (
            <div className="p-8">
              <EmptyState title="Tidak ada unit yang sesuai" hint="Coba bersihkan kata kunci pencarian atau ganti filter status." />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
