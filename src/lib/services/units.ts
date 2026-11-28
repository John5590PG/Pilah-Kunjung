/**
 * Unit listing for the coordinator dashboard. Reads PostgreSQL, derives
 * silent cycles / months-since-contact, then reuses the same pure ranking
 * engine as the prototype (src/lib/ranking).
 */
import { prisma } from "@/lib/db/client";
import { HttpError } from "@/lib/api/http";
import { rankUnits, type ScoreBreakdown } from "@/lib/ranking";
import type { SessionRole } from "@/lib/auth/session-token";
import type { ReportedStatus, UnitStatus } from "@/lib/status";
import { countConsecutiveSilentCycles, monthsBetween, periodLabelId } from "./cycle-math";
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

export interface UnitSignalItem {
  id: string;
  unitId: string;
  cycle: string;
  status: ReportedStatus;
  at: string;
  undoneAt: string | null;
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
  signals: UnitSignalItem[];
  generatedAt: string;
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
    prisma.reportingCycle.findMany({
      orderBy: { openedAt: "asc" },
      select: { id: true, periodLabel: true, openedAt: true, closedAt: true },
    }),
    prisma.unit.findMany({
      where: {
        archivedAt: null,
        ...(subDistrictId ? { subDistrictId } : {}),
      },
      orderBy: { name: "asc" },
    }),
    getRankingConfig(subDistrictId),
  ]);

  const unitIds = units.map((unit) => unit.id);
  const [signals, drafts] = await Promise.all([
    unitIds.length > 0
      ? prisma.checkinSignal.findMany({
          where: { unitId: { in: unitIds } },
          orderBy: { submittedAt: "asc" },
          select: {
            id: true,
            unitId: true,
            cycleId: true,
            reportedStatus: true,
            submittedAt: true,
            undoneAt: true,
          },
        })
      : Promise.resolve([]),
    cycle
      ? prisma.messageDraft.findMany({ where: { cycleId: cycle.id }, select: { unitId: true, sentAt: true } })
      : Promise.resolve([]),
  ]);

  const cycleLabelById = new Map(cycles.map((c) => [c.id, c.periodLabel]));
  const closedCycles = cycles.filter((c) => c.closedAt !== null);
  const activeSignalCyclesByUnit = new Map<string, Set<string>>();
  const signaledCurrent = new Set<string>();

  for (const signal of signals) {
    if (signal.undoneAt) continue;
    let set = activeSignalCyclesByUnit.get(signal.unitId);
    if (!set) {
      set = new Set<string>();
      activeSignalCyclesByUnit.set(signal.unitId, set);
    }
    set.add(signal.cycleId);
    if (cycle && signal.cycleId === cycle.id) {
      signaledCurrent.add(signal.unitId);
    }
  }
  const draftSentAt = new Map(drafts.map((draft) => [draft.unitId, draft.sentAt]));

  const items: UnitListItem[] = units.map((unit) => {
    const activeSet = activeSignalCyclesByUnit.get(unit.id) ?? new Set<string>();
    const signaledThisCycle = signaledCurrent.has(unit.id);
    const visitedCurrentCycle = Boolean(
      cycle && unit.lastVisitedAt && unit.lastVisitedAt.getTime() >= cycle.openedAt.getTime(),
    );
    return {
      id: unit.id,
      name: unit.name,
      kelurahan: unit.kelurahan ?? "",
      managerContact: unit.managerContact,
      status: unit.currentStatus as UnitStatus,
      silentCycles: countConsecutiveSilentCycles({
        createdAt: unit.createdAt,
        closedCycles,
        activeSignalCycleIds: activeSet,
        signaledCurrentCycle: signaledThisCycle,
        visitedCurrentCycle,
      }),
      monthsSinceContact: unit.lastVisitedAt ? monthsBetween(unit.lastVisitedAt, now) : null,
      lastSignalAt: unit.lastSignalAt?.toISOString() ?? null,
      lastVisitedAt: unit.lastVisitedAt?.toISOString() ?? null,
      signaledThisCycle,
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
    signals: signals.map((signal) => ({
      id: signal.id,
      unitId: signal.unitId,
      cycle: cycleLabelById.get(signal.cycleId) ?? "",
      status: signal.reportedStatus as ReportedStatus,
      at: signal.submittedAt.toISOString(),
      undoneAt: signal.undoneAt?.toISOString() ?? null,
    })),
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
