import { describe, expect, it } from "vitest";
import { generateToken, hashToken } from "@/lib/security/token";
import { createRateLimiter } from "@/lib/security/rate-limit";

describe("token", () => {
  it("generates url-safe 128-bit tokens (22 chars), unique", () => {
    const t = generateToken();
    expect(t).toMatch(/^[A-Za-z0-9_-]{22}$/);
    expect(generateToken()).not.toBe(t);
  });

  it("hashes with pepper deterministically; pepper changes the hash", async () => {
    const h1 = await hashToken("abc", "p1");
    expect(h1).toMatch(/^[0-9a-f]{64}$/);
    expect(await hashToken("abc", "p1")).toBe(h1);
    expect(await hashToken("abc", "p2")).not.toBe(h1);
    expect(h1).not.toContain("abc");
  });
});

describe("rate limiter", () => {
  it("blocks after the limit and resets after the window", () => {
    let t = 0;
    const rl = createRateLimiter({ limit: 2, windowMs: 1000, now: () => t });
    expect(rl.check("ip")).toBe(true);
    expect(rl.check("ip")).toBe(true);
    expect(rl.check("ip")).toBe(false);
    expect(rl.check("other")).toBe(true);
    t = 1001;
    expect(rl.check("ip")).toBe(true);
  });
});
