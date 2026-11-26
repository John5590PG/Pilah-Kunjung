/**
 * Cycle rollover (docs/08 task 3). One transaction:
 *   1. units without an active signal in the current cycle -> UNCONFIRMED
 *   2. close the current cycle
 *   3. open the next calendar cycle with a fresh cutoff
 */
import { prisma } from "@/lib/db/client";
import { HttpError } from "@/lib/api/http";
import { cycleLabel, cycleWindow, nextCycleLabel, periodLabelId } from "./cycle-math";
import { getRankingConfig } from "./settings";

export interface RolloverResult {
  closedCycle: string;
  openedCycle: string;
  markedUnconfirmed: number;
  openedAt: string;
  cutoffAt: string;
}

export async function getCurrentCycle() {
  return prisma.reportingCycle.findFirst({ orderBy: { openedAt: "desc" } });
}

/** Creates the current calendar cycle if the database is empty (POST context only). */
export async function ensureCurrentCycle() {
  const existing = await getCurrentCycle();
  if (existing) return existing;

  const config = await getRankingConfig();
  const label = cycleLabel(new Date());
  const { openedAt, cutoffAt } = cycleWindow(label, config.cutoffDays);
  return prisma.reportingCycle.create({ data: { periodLabel: label, openedAt, cutoffAt } });
}

export async function rolloverCycle(actorId: string): Promise<RolloverResult> {
  const config = await getRankingConfig();

  return prisma.$transaction(async (tx) => {
    const current = await tx.reportingCycle.findFirst({ orderBy: { openedAt: "desc" } });
    if (!current) {
      throw new HttpError(409, "Belum ada siklus yang bisa ditutup. Buka siklus terlebih dahulu.", "NO_CYCLE");
    }

    const nextLabel = nextCycleLabel(current.periodLabel);
    const alreadyOpened = await tx.reportingCycle.findUnique({ where: { periodLabel: nextLabel } });
    if (current.closedAt || alreadyOpened) {
      throw new HttpError(409, `Siklus ${nextLabel} sudah dibuka.`, "CYCLE_ALREADY_OPEN");
    }

    const signaled = await tx.checkinSignal.findMany({
      where: { cycleId: current.id, undoneAt: null },
      select: { unitId: true },
      distinct: ["unitId"],
    });
    const signaledIds = new Set(signaled.map((signal) => signal.unitId));

    const activeUnits = await tx.unit.findMany({
      where: { archivedAt: null, currentStatus: { not: "CLOSED" } },
      select: { id: true },
    });
    const silentIds = activeUnits.map((unit) => unit.id).filter((id) => !signaledIds.has(id));

    if (silentIds.length > 0) {
      await tx.unit.updateMany({
        where: { id: { in: silentIds } },
        data: { currentStatus: "UNCONFIRMED" },
      });
    }

    const now = new Date();
    await tx.reportingCycle.update({ where: { id: current.id }, data: { closedAt: now } });

    const { openedAt, cutoffAt } = cycleWindow(nextLabel, config.cutoffDays);
    await tx.reportingCycle.create({ data: { periodLabel: nextLabel, openedAt, cutoffAt } });

    await tx.auditLog.create({
      data: { userId: actorId, action: "cycle.rollover", target: `${current.periodLabel}->${nextLabel}` },
    });

    return {
      closedCycle: current.periodLabel,
      openedCycle: nextLabel,
      markedUnconfirmed: silentIds.length,
      openedAt: openedAt.toISOString(),
      cutoffAt: cutoffAt.toISOString(),
    };
  });
}

export { periodLabelId };
