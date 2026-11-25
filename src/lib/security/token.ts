/**
 * Personal link tokens (docs/04-SECURITY-UX #1).
 * 128-bit random, base64url; only the SHA-256(pepper + token) hash is meant to be stored.
 *
 * STATUS: library only. The prototype UI uses fixed DEMO tokens (see seed/README.md);
 * wiring this to a database is planned for the backend phase.
 */

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** 16 random bytes (128 bit) -> 22-char URL-safe string. */
export function generateToken(): string {
  return toBase64Url(globalThis.crypto.getRandomValues(new Uint8Array(16)));
}

/** SHA-256 hex of `pepper + token`. Never store or log the raw token. */
export async function hashToken(token: string, pepper: string): Promise<string> {
  const data = new TextEncoder().encode(pepper + token);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
