/**
 * Coordinator visit/call confirmations (docs/08 task 1).
 * A visit is the second source of truth: it can move Unconfirmed -> Operating,
 * and it resets the "months since contact" clock used by the ranking.
 */
import { prisma } from "@/lib/db/client";
import { HttpError } from "@/lib/api/http";
import type { ContactMode, UnitStatus } from "@/lib/status";
import type { Actor } from "./units";
import { resolveScope } from "./units";

export interface VisitInput {
  unitId: string;
  mode: ContactMode;
  verifiedStatus: Exclude<UnitStatus, "UNCONFIRMED">;
  note?: string;
}

export async function recordVisit(actor: Actor, input: VisitInput) {
  const unit = await prisma.unit.findUnique({ where: { id: input.unitId } });
  if (!unit) throw new HttpError(404, "Unit tidak ditemukan.", "UNIT_NOT_FOUND");

  const scope = resolveScope(actor);
  if (scope && unit.subDistrictId !== scope) {
    throw new HttpError(403, "Unit ini di luar kecamatan Anda.", "OUT_OF_SCOPE");
  }
  if (unit.archivedAt) throw new HttpError(409, "Unit sudah diarsipkan.", "UNIT_ARCHIVED");

  const now = new Date();
  const note = input.note?.trim().slice(0, 280) || null;

  return prisma.$transaction(async (tx) => {
    const visit = await tx.visitConfirmation.create({
      data: {
        unitId: unit.id,
        coordinatorId: actor.id,
        contactMode: input.mode,
        verifiedStatus: input.verifiedStatus,
        actionNote: note,
        verifiedAt: now,
      },
    });

    await tx.unit.update({
      where: { id: unit.id },
      data: {
        currentStatus: input.verifiedStatus,
        lastVisitedAt: now,
      },
    });

    await tx.auditLog.create({
      data: { userId: actor.id, action: "visit.record", target: unit.id },
    });

    return {
      id: visit.id,
      unitId: visit.unitId,
      mode: visit.contactMode,
      verifiedStatus: visit.verifiedStatus,
      note: visit.actionNote,
      at: visit.verifiedAt.toISOString(),
    };
  });
}

export async function listVisits(actor: Actor, unitId?: string) {
  return prisma.visitConfirmation.findMany({
    where: {
      ...(unitId ? { unitId } : {}),
      ...(actor.role === "COORDINATOR" && actor.subDistrictId
        ? { unit: { subDistrictId: actor.subDistrictId } }
        : {}),
    },
    orderBy: { verifiedAt: "desc" },
    take: 100,
    include: {
      unit: { select: { name: true } },
      coordinator: { select: { email: true } },
    },
  });
}
