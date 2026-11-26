/**
 * Route-level rate limiters (docs/04 #6). In-memory, per server instance —
 * good enough for the demo; swap for Redis/Upstash when deployed multi-instance.
 */
import { createRateLimiter } from "./rate-limit";

export const loginLimiter = createRateLimiter({ limit: 10, windowMs: 15 * 60 * 1000 });
export const checkinLimiter = createRateLimiter({ limit: 20, windowMs: 60 * 1000 });
export const tokenLookupLimiter = createRateLimiter({ limit: 60, windowMs: 60 * 1000 });
export const writeLimiter = createRateLimiter({ limit: 60, windowMs: 60 * 1000 });
