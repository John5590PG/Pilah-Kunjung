/**
 * Password hashing with Node's built-in scrypt (docs/04-SECURITY-UX #7).
 * Format: scrypt$N$r$p$<salt base64url>$<hash base64url>
 * No third-party dependency, no plaintext, constant-time comparison.
 */
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const N = 16_384;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;
const SALT_BYTES = 16;

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_BYTES);
  const key = scryptSync(password, salt, KEY_LENGTH, { N, r: R, p: P });
  return ["scrypt", N, R, P, salt.toString("base64url"), key.toString("base64url")].join("$");
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [, nRaw, rRaw, pRaw, saltRaw, hashRaw] = parts;
  const n = Number(nRaw);
  const r = Number(rRaw);
  const p = Number(pRaw);
  if (!Number.isInteger(n) || !Number.isInteger(r) || !Number.isInteger(p)) return false;
  if (n <= 0 || r <= 0 || p <= 0) return false;

  const salt = Buffer.from(saltRaw, "base64url");
  const expected = Buffer.from(hashRaw, "base64url");
  if (salt.length === 0 || expected.length === 0) return false;

  const actual = scryptSync(password, salt, expected.length, { N: n, r, p });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** Hash used to keep login timing roughly constant when the email is unknown. */
export const DUMMY_PASSWORD_HASH = hashPassword("not-a-real-password");
