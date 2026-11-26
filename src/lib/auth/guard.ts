/** Route-handler guard: authentication + role check (docs/04 #8). */
import { HttpError } from "@/lib/api/http";
import { readSession } from "./session";
import type { SessionRole, SessionUser } from "./session-token";

export async function requireUser(roles?: SessionRole[]): Promise<SessionUser> {
  const user = await readSession();
  if (!user) throw new HttpError(401, "Silakan masuk terlebih dahulu.", "UNAUTHENTICATED");
  if (roles && !roles.includes(user.role)) {
    throw new HttpError(403, "Akun ini tidak punya akses ke tindakan tersebut.", "FORBIDDEN");
  }
  return user;
}

/**
 * Coordinators only see their own sub-district; advisor/admin may pass an
 * explicit filter or see everything (docs/04 #8).
 */
export function scopeSubDistrict(user: SessionUser, requested?: string | null): string | undefined {
  if (user.role === "COORDINATOR") {
    if (!user.subDistrictId) throw new HttpError(403, "Akun koordinator belum ditautkan ke kecamatan.", "NO_SCOPE");
    return user.subDistrictId;
  }
  return requested ?? undefined;
}
