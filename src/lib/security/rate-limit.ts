/**
 * Fixed-window in-memory rate limiter (docs/04-SECURITY-UX #6).
 * STATUS: library only — not wired to any endpoint yet (no backend in the prototype).
 * An in-memory limiter is per-instance; a shared store is needed for real serverless use.
 */
export interface RateLimiterOptions {
  limit: number;
  windowMs: number;
  now?: () => number;
}

export function createRateLimiter({ limit, windowMs, now = Date.now }: RateLimiterOptions) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return {
    /** Returns true if the call is allowed. */
    check(key: string): boolean {
      const t = now();
      const entry = hits.get(key);
      if (!entry || t >= entry.resetAt) {
        hits.set(key, { count: 1, resetAt: t + windowMs });
        return true;
      }
      entry.count += 1;
      return entry.count <= limit;
    },
  };
}
