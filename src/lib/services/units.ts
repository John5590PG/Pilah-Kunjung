/**
 * Unit listing for the coordinator dashboard. Reads PostgreSQL, derives
 * silent cycles / months-since-contact, then reuses the same pure ranking
 * engine as the prototype (src/lib/ranking).
 */
import { prisma } from "@/lib/db/client";
import { HttpError } from "@/lib/api/http";
import { rankUnits, type ScoreBreakdown } from "@/lib/ranking";
import type { SessionRole } from "@/lib/auth/session-token";
import type { UnitStatus } from "@/lib/status";
import { monthsBetween, periodLabelId, silentCyclesFor } from "./cycle-math";
import { getRankingConfig } from "./settings";

export interface Actor {
  id: string;
  role: SessionRole;
  subDistrictId: string | null;
}

export interface UnitListItem {
  id: string;
  name: string;
  kelurahan: string;
  managerContact: string | null;
  status: UnitStatus;
  silentCycles: number;
  monthsSinceContact: number | null;
  lastSignalAt: string | null;
  lastVisitedAt: string | null;
  signaledThisCycle: boolean;
  draftSentAt: string | null;
  isSynthetic: boolean;
  rank?: number;
  score?: number;
  breakdown?: ScoreBreakdown;
}

export interface UnitsResult {
  cycle: {
    label: string;
    periodLabel: string;
    openedAt: string;
    cutoffAt: string;
    closedAt: string | null;
  } | null;
  config: Awaited<ReturnType<typeof getRankingConfig>>;
  units: UnitListItem[];
  closed: UnitListItem[];
  generatedAt: string;
}

function maxDate(a: Date | null, b: Date | null): Date | null {
  if (!a) return b;
  if (!b) return a;
  return a.getTime() >= b.getTime() ? a : b;
}

export function resolveScope(actor: Actor, requested?: string | null): string | undefined {
  if (actor.role === "COORDINATOR") {
    if (!actor.subDistrictId) {
      throw new HttpError(403, "Akun koordinator belum ditautkan ke kecamatan.", "NO_SCOPE");
    }
    return actor.subDistrictId;
  }
  return requested ?? undefined;
}

export async function listUnits(actor: Actor, requestedSubDistrict?: string | null): Promise<UnitsResult> {
  const subDistrictId = resolveScope(actor, requestedSubDistrict);
  const now = new Date();

  const [cycle, cycles, units, config] = await Promise.all([
    prisma.reportingCycle.findFirst({ orderBy: { openedAt: "desc" } }),
    prisma.reportingCycle.findMany({ orderBy: { openedAt: "asc" }, select: { openedAt: true, closedAt: true } }),
    prisma.unit.findMany({
      where: {
        archivedAt: null,
        ...(subDistrictId ? { subDistrictId } : {}),
      },
      orderBy: { name: "asc" },
    }),
    getRankingConfig(subDistrictId),
  ]);

  const [signals, drafts] = await Promise.all([
    cycle
      ? prisma.checkinSignal.findMany({ where: { cycleId: cycle.id, undoneAt: null }, select: { unitId: true } })
      : Promise.resolve([]),
    cycle
      ? prisma.messageDraft.findMany({ where: { cycleId: cycle.id }, select: { unitId: true, sentAt: true } })
      : Promise.resolve([]),
  ]);

  const signaled = new Set(signals.map((signal) => signal.unitId));
  const draftSentAt = new Map(drafts.map((draft) => [draft.unitId, draft.sentAt]));

  const items: UnitListItem[] = units.map((unit) => {
    const lastContact = maxDate(unit.lastSignalAt, unit.lastVisitedAt);
    return {
      id: unit.id,
      name: unit.name,
      kelurahan: unit.kelurahan ?? "",
      managerContact: unit.managerContact,
      status: unit.currentStatus as UnitStatus,
      silentCycles: silentCyclesFor(lastContact, cycles),
      monthsSinceContact: unit.lastVisitedAt ? monthsBetween(unit.lastVisitedAt, now) : null,
      lastSignalAt: unit.lastSignalAt?.toISOString() ?? null,
      lastVisitedAt: unit.lastVisitedAt?.toISOString() ?? null,
      signaledThisCycle: signaled.has(unit.id),
      draftSentAt: draftSentAt.get(unit.id)?.toISOString() ?? null,
      isSynthetic: unit.isSynthetic,
    };
  });

  const active = items.filter((item) => item.status !== "CLOSED");
  const closed = items.filter((item) => item.status === "CLOSED");
  const ranked = rankUnits(active, config);

  return {
    cycle: cycle
      ? {
          label: cycle.periodLabel,
          periodLabel: periodLabelId(cycle.periodLabel),
          openedAt: cycle.openedAt.toISOString(),
          cutoffAt: cycle.cutoffAt.toISOString(),
          closedAt: cycle.closedAt?.toISOString() ?? null,
        }
      : null,
    config,
    units: ranked,
    closed,
    generatedAt: now.toISOString(),
  };
}

export async function archiveUnit(unitId: string, actor: Actor): Promise<void> {
  const unit = await prisma.unit.findUnique({ where: { id: unitId } });
  if (!unit) throw new HttpError(404, "Unit tidak ditemukan.", "UNIT_NOT_FOUND");
  if (actor.role === "COORDINATOR" && unit.subDistrictId !== actor.subDistrictId) {
    throw new HttpError(403, "Unit ini di luar kecamatan Anda.", "OUT_OF_SCOPE");
  }

  await prisma.$transaction([
    prisma.unit.update({
      where: { id: unitId },
      data: { currentStatus: "CLOSED", archivedAt: new Date() },
    }),
    prisma.unitToken.updateMany({
      where: { unitId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
    prisma.auditLog.create({
      data: { userId: actor.id, action: "unit.archive", target: unitId },
    }),
  ]);
}
