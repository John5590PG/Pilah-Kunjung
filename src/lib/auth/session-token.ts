/**
 * Stateless, signed session token (HMAC-SHA256).
 *
 * Payload is base64url JSON; only the server can sign it. This avoids a session
 * table while keeping the cookie httpOnly. Keep the TTL short (8h). Revoking a
 * single session is not supported yet — rotate AUTH_SECRET to invalidate all.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { getAuthSecret } from "@/lib/env";

export const SESSION_TTL_SECONDS = 8 * 60 * 60;

export type SessionRole = "COORDINATOR" | "ADVISOR" | "ADMIN";

export interface SessionUser {
  id: string;
  email: string;
  role: SessionRole;
  subDistrictId: string | null;
}

export interface SessionPayload extends SessionUser {
  /** Unix seconds. */
  exp: number;
}

function sign(body: string): string {
  return createHmac("sha256", getAuthSecret()).update(body).digest("base64url");
}

export function signSessionToken(user: SessionUser, nowMs: number = Date.now()): string {
  const payload: SessionPayload = {
    ...user,
    exp: Math.floor(nowMs / 1000) + SESSION_TTL_SECONDS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string | undefined | null, nowMs: number = Date.now()): SessionPayload | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, signature] = parts;
  if (!body || !signature) return null;

  const expected = Buffer.from(sign(body), "utf8");
  const given = Buffer.from(signature, "utf8");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
  } catch {
    return null;
  }

  if (
    typeof payload?.id !== "string" ||
    typeof payload?.email !== "string" ||
    typeof payload?.exp !== "number" ||
    !["COORDINATOR", "ADVISOR", "ADMIN"].includes(payload?.role)
  ) {
    return null;
  }
  if (payload.exp * 1000 <= nowMs) return null;

  return payload;
}

export function sessionUserFromPayload(payload: SessionPayload): SessionUser {
  const { id, email, role, subDistrictId } = payload;
  return { id, email, role, subDistrictId };
}
