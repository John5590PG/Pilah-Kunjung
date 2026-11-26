/**
 * Token lifecycle (docs/04 #2). Raw tokens are returned exactly once, at
 * issue/rotation time; the database stores only SHA-256(pepper + token).
 */
import { prisma } from "@/lib/db/client";
import { HttpError } from "@/lib/api/http";
import { getAppBaseUrl, getTokenPepper } from "@/lib/env";
import { generateToken, hashToken } from "@/lib/security/token";

export interface IssuedToken {
  token: string;
  url: string;
  createdAt: string;
}

export async function issueUnitToken(unitId: string, actorId: string): Promise<IssuedToken> {
  const unit = await prisma.unit.findUnique({ where: { id: unitId }, select: { id: true, archivedAt: true } });
  if (!unit) throw new HttpError(404, "Unit tidak ditemukan.", "UNIT_NOT_FOUND");
  if (unit.archivedAt) throw new HttpError(409, "Unit sudah diarsipkan.", "UNIT_ARCHIVED");

  const raw = generateToken();
  const tokenHash = await hashToken(raw, getTokenPepper());
  const now = new Date();

  await prisma.$transaction([
    prisma.unitToken.updateMany({ where: { unitId, revokedAt: null }, data: { revokedAt: now } }),
    prisma.unitToken.create({ data: { unitId, tokenHash, createdAt: now } }),
    prisma.auditLog.create({ data: { userId: actorId, action: "token.rotate", target: unitId } }),
  ]);

  return {
    token: raw,
    url: `${getAppBaseUrl()}/c/${raw}`,
    createdAt: now.toISOString(),
  };
}

export async function revokeUnitTokens(unitId: string, actorId: string): Promise<number> {
  const now = new Date();
  const result = await prisma.unitToken.updateMany({ where: { unitId, revokedAt: null }, data: { revokedAt: now } });
  await prisma.auditLog.create({ data: { userId: actorId, action: "token.revoke", target: unitId } });
  return result.count;
}
