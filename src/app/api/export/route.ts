import { requireUser } from "@/lib/auth/guard";
import { handleRoute } from "@/lib/api/http";
import { listUnits } from "@/lib/services/units";

function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

/** CSV of the current visit-priority list (docs/08 task 3). */
export async function GET() {
  return handleRoute(async () => {
    const user = await requireUser(["COORDINATOR", "ADVISOR", "ADMIN"]);
    const result = await listUnits(user);

    const header = [
      "rank",
      "unit_id",
      "unit",
      "kelurahan",
      "status",
      "silent_cycles",
      "months_since_contact",
      "score",
      "w_silent",
      "w_unconfirmed",
      "w_paused",
      "cutoff_days",
      "last_signal_at",
      "last_visited_at",
      "is_synthetic",
    ];

    const rows = result.units.map((unit) => [
      unit.rank,
      unit.id,
      unit.name,
      unit.kelurahan,
      unit.status,
      unit.silentCycles,
      unit.monthsSinceContact,
      unit.score,
      result.config.wSilent,
      result.config.wUnconfirmed,
      result.config.wPaused,
      result.config.cutoffDays,
      unit.lastSignalAt,
      unit.lastVisitedAt,
      unit.isSynthetic,
    ]);

    const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
    const filename = `pilah-kunjung-${result.cycle?.label ?? "export"}.csv`;

    return new Response(`\uFEFF${csv}\r\n`, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex",
      },
    });
  });
}
