/**
 * Session cookie helpers (Next.js). Reading works in Server Components and
 * Route Handlers; writing only in Route Handlers / Server Actions.
 */
import { cookies } from "next/headers";
import {
  SESSION_TTL_SECONDS,
  sessionUserFromPayload,
  signSessionToken,
  verifySessionToken,
  type SessionUser,
} from "./session-token";

export const SESSION_COOKIE = "pk_session";

export async function readSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const payload = verifySessionToken(store.get(SESSION_COOKIE)?.value);
  return payload ? sessionUserFromPayload(payload) : null;
}

export async function writeSession(user: SessionUser): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, signSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
