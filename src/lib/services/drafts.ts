/** Marks a WhatsApp reminder draft as sent for the active cycle. */
import { prisma } from "@/lib/db/client";
import { HttpError } from "@/lib/api/http";
import { ensureCurrentCycle } from "./cycles";

export async function markDraftSent(unitId: string, actorId: string) {
  const unit = await prisma.unit.findUnique({ where: { id: unitId }, select: { id: true, archivedAt: true } });
  if (!unit) throw new HttpError(404, "Unit tidak ditemukan.", "UNIT_NOT_FOUND");
  if (unit.archivedAt) throw new HttpError(409, "Unit sudah diarsipkan.", "UNIT_ARCHIVED");

  const cycle = await ensureCurrentCycle();
  const now = new Date();
  const messageText = "Pengingat check-in bulan ini. Buka tautan yang dikirimkan koordinator.";

  await prisma.$transaction([
    prisma.messageDraft.upsert({
      where: { cycleId_unitId: { cycleId: cycle.id, unitId } },
      update: { sentAt: now, sentById: actorId, messageText },
      create: { cycleId: cycle.id, unitId, messageText, sentAt: now, sentById: actorId },
    }),
    prisma.auditLog.create({ data: { userId: actorId, action: "draft.mark_sent", target: unitId } }),
  ]);

  return { unitId, sentAt: now.toISOString(), cycle: cycle.periodLabel };
}
