/**
 * One-tap check-in by hashed token (docs/01, docs/04 #1–#4).
 * GET never mutates. POST creates/updates a signal and the unit status.
 * Undo is allowed for 10 minutes and restores the previous snapshot.
 */
import { prisma } from "@/lib/db/client";
import { HttpError } from "@/lib/api/http";
import { getTokenPepper } from "@/lib/env";
import { hashToken } from "@/lib/security/token";
import type { ReportedStatus, UnitStatus } from "@/lib/status";
import { ensureCurrentCycle } from "./cycles";

export const UNDO_WINDOW_MS = 10 * 60 * 1000;

async function findByRawToken(rawToken: string) {
  const tokenHash = await hashToken(rawToken, getTokenPepper());
  return prisma.unitToken.findUnique({
    where: { tokenHash },
    include: { unit: true },
  });
}

export interface TokenUnitView {
  id: string;
  name: string;
  kelurahan: string;
  status: UnitStatus;
  isSynthetic: boolean;
  lastSignalAt: string | null;
  /** Submitted time and reported status of the latest active signal this cycle, if any. */
  signalAt: string | null;
  signalStatus: ReportedStatus | null;
  cycle: string | null;
  canUndo: boolean;
  /** Latest coordinator follow-up, if any (unit-level only, no resident data). */
  visit: {
    mode: "CALL" | "VISIT";
    verifiedStatus: string;
    note: string | null;
    at: string;
  } | null;
}

export async function readToken(rawToken: string): Promise<TokenUnitView> {
  const token = await findByRawToken(rawToken);
  if (!token || token.revokedAt || token.unit.archivedAt) {
    throw new HttpError(404, "Tautan tidak berlaku.", "INVALID_TOKEN");
  }

  const cycle = await prisma.reportingCycle.findFirst({ orderBy: { openedAt: "desc" } });

  const [signal, visit] = await Promise.all([
    cycle
      ? prisma.checkinSignal.findFirst({
          where: { unitId: token.unitId, cycleId: cycle.id, undoneAt: null },
          orderBy: { submittedAt: "desc" },
        })
      : Promise.resolve(null),
    prisma.visitConfirmation.findFirst({
      where: { unitId: token.unitId },
      orderBy: { verifiedAt: "desc" },
    }),
  ]);

  const canUndo = Boolean(
    signal &&
      cycle &&
      signal.cycleId === cycle.id &&
      Date.now() - signal.submittedAt.getTime() <= UNDO_WINDOW_MS,
  );

  return {
    id: token.unit.id,
    name: token.unit.name,
    kelurahan: token.unit.kelurahan ?? "",
    status: token.unit.currentStatus as UnitStatus,
    isSynthetic: token.unit.isSynthetic,
    lastSignalAt: token.unit.lastSignalAt?.toISOString() ?? null,
    signalAt: signal?.submittedAt.toISOString() ?? null,
    signalStatus: (signal?.reportedStatus as ReportedStatus) ?? null,
    cycle: cycle?.periodLabel ?? null,
    canUndo,
    visit: visit
      ? {
          mode: visit.contactMode,
          verifiedStatus: visit.verifiedStatus,
          note: visit.actionNote,
          at: visit.verifiedAt.toISOString(),
        }
      : null,
  };
}

export interface CheckinResult {
  status: ReportedStatus;
  submittedAt: string;
  unitId: string;
  cycle: string;
}

export async function submitCheckin(rawToken: string, status: ReportedStatus): Promise<CheckinResult> {
  const token = await findByRawToken(rawToken);
  if (!token || token.revokedAt || token.unit.archivedAt) {
    throw new HttpError(404, "Tautan tidak berlaku.", "INVALID_TOKEN");
  }

  const cycle = await ensureCurrentCycle();
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const existing = await tx.checkinSignal.findFirst({
      where: { unitId: token.unitId, cycleId: cycle.id, undoneAt: null },
      orderBy: { submittedAt: "desc" },
    });

    if (existing) {
      await tx.checkinSignal.update({
        where: { id: existing.id },
        data: { reportedStatus: status, submittedAt: now, sourceRole: "MANAGER" },
      });
    } else {
      await tx.checkinSignal.create({
        data: {
          unitId: token.unitId,
          cycleId: cycle.id,
          reportedStatus: status,
          sourceRole: "MANAGER",
          submittedAt: now,
          previousStatus: token.unit.currentStatus,
          previousLastSignalAt: token.unit.lastSignalAt,
        },
      });
    }

    await tx.unit.update({
      where: { id: token.unitId },
      data: { currentStatus: status, lastSignalAt: now },
    });
    await tx.auditLog.create({
      data: { action: "checkin.submit", target: token.unitId },
    });

    return { status, submittedAt: now.toISOString(), unitId: token.unitId, cycle: cycle.periodLabel };
  });
}

export async function undoCheckin(rawToken: string): Promise<{ unitId: string; restoredStatus: UnitStatus }> {
  const token = await findByRawToken(rawToken);
  if (!token || token.revokedAt || token.unit.archivedAt) {
    throw new HttpError(404, "Tautan tidak berlaku.", "INVALID_TOKEN");
  }

  const cycle = await prisma.reportingCycle.findFirst({ orderBy: { openedAt: "desc" } });
  if (!cycle) throw new HttpError(404, "Belum ada siklus aktif.", "NO_CYCLE");

  const signal = await prisma.checkinSignal.findFirst({
    where: { unitId: token.unitId, cycleId: cycle.id, undoneAt: null },
    orderBy: { submittedAt: "desc" },
  });
  if (!signal) throw new HttpError(404, "Tidak ada konfirmasi yang bisa dibatalkan.", "NOTHING_TO_UNDO");
  if (Date.now() - signal.submittedAt.getTime() > UNDO_WINDOW_MS) {
    throw new HttpError(409, "Batas 10 menit untuk membatalkan sudah lewat.", "UNDO_WINDOW_PASSED");
  }

  const restoredStatus = (signal.previousStatus ?? "UNCONFIRMED") as UnitStatus;

  await prisma.$transaction([
    prisma.checkinSignal.update({ where: { id: signal.id }, data: { undoneAt: new Date() } }),
    prisma.unit.update({
      where: { id: token.unitId },
      data: { currentStatus: restoredStatus, lastSignalAt: signal.previousLastSignalAt },
    }),
    prisma.auditLog.create({ data: { action: "checkin.undo", target: token.unitId } }),
  ]);

  return { unitId: token.unitId, restoredStatus };
}
