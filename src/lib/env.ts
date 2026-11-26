/**
 * Server-side environment access. Secrets are never exposed to the client.
 * In development missing secrets fall back to obviously-insecure values so the
 * prototype keeps working; in production they fail fast.
 */

const warned = new Set<string>();

function fallback(name: string, devValue: string): string {
  if (process.env.NODE_ENV === "production") {
    throw new Error(`${name} wajib diisi di production (lihat .env.example).`);
  }
  if (!warned.has(name)) {
    warned.add(name);
    console.warn(`[env] ${name} belum diisi, memakai nilai dev yang tidak aman.`);
  }
  return devValue;
}

export function getAuthSecret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 16) return fallback("AUTH_SECRET", "dev-only-insecure-auth-secret");
  return value;
}

export function getTokenPepper(): string {
  const value = process.env.TOKEN_PEPPER;
  if (!value || value.length < 16) return fallback("TOKEN_PEPPER", "dev-only-insecure-token-pepper");
  return value;
}

export function getAppBaseUrl(): string {
  return (process.env.APP_BASE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

export function databaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
