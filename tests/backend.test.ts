import { beforeAll, describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { signSessionToken, verifySessionToken } from "@/lib/auth/session-token";
import { countConsecutiveSilentCycles, monthsBetween, nextCycleLabel, silentCyclesFor } from "@/lib/services/cycle-math";

beforeAll(() => {
  process.env.AUTH_SECRET = "unit-test-secret-at-least-16-chars";
});

describe("password hashing", () => {
  it("verifies the right password and rejects the wrong one", () => {
    const stored = hashPassword("rahasia-demo-2026");
    expect(stored.startsWith("scrypt$")).toBe(true);
    expect(verifyPassword("rahasia-demo-2026", stored)).toBe(true);
    expect(verifyPassword("salah", stored)).toBe(false);
  });

  it("rejects malformed hashes without throwing", () => {
    expect(verifyPassword("x", "not-a-hash")).toBe(false);
    expect(verifyPassword("x", "scrypt$1$2$3$4")).toBe(false);
  });
});

describe("signed session token", () => {
  const user = { id: "usr-1", email: "korcam@demo.local", role: "COORDINATOR" as const, subDistrictId: "sd-1" };

  it("round-trips a valid payload", () => {
    const token = signSessionToken(user);
    const payload = verifySessionToken(token);
    expect(payload?.id).toBe("usr-1");
    expect(payload?.role).toBe("COORDINATOR");
    expect(payload?.subDistrictId).toBe("sd-1");
  });

  it("rejects tampering and expiry", () => {
    const token = signSessionToken(user);
    expect(verifySessionToken(`${token.slice(0, -2)}xx`)).toBeNull();
    expect(verifySessionToken(token, Date.now() + 9 * 60 * 60 * 1000)).toBeNull();
    expect(verifySessionToken(undefined)).toBeNull();
  });
});

describe("cycle maths", () => {
  it("rolls over December into January", () => {
    expect(nextCycleLabel("2026-12")).toBe("2027-01");
  });

  it("counts whole months only", () => {
    expect(monthsBetween(new Date(2026, 0, 15), new Date(2026, 1, 14))).toBe(0);
    expect(monthsBetween(new Date(2026, 0, 15), new Date(2026, 1, 15))).toBe(1);
  });

  it("counts only closed cycles after the last contact", () => {
    const cycles = [
      { openedAt: new Date(2026, 7, 1), closedAt: new Date(2026, 8, 1) },
      { openedAt: new Date(2026, 8, 1), closedAt: new Date(2026, 9, 1) },
      { openedAt: new Date(2026, 9, 1), closedAt: null },
    ];
    expect(silentCyclesFor(new Date(2026, 8, 15), cycles)).toBe(0);
    expect(silentCyclesFor(new Date(2026, 7, 15), cycles)).toBe(1);
    expect(silentCyclesFor(null, cycles)).toBe(2);
  });

  it("counts consecutive closed silent cycles bounded by creation month and signals", () => {
    const closedCycles = [
      { id: "c4", openedAt: new Date(2026, 6, 1) },
      { id: "c3", openedAt: new Date(2026, 7, 1) },
      { id: "c2", openedAt: new Date(2026, 8, 1) },
      { id: "c1", openedAt: new Date(2026, 9, 1) },
    ];
    expect(
      countConsecutiveSilentCycles({
        createdAt: new Date(2026, 6, 1),
        closedCycles,
        activeSignalCycleIds: new Set(),
        signaledCurrentCycle: false,
        visitedCurrentCycle: false,
      }),
    ).toBe(4);
    expect(
      countConsecutiveSilentCycles({
        createdAt: new Date(2026, 7, 1),
        closedCycles,
        activeSignalCycleIds: new Set(),
        signaledCurrentCycle: false,
        visitedCurrentCycle: false,
      }),
    ).toBe(3);
    expect(
      countConsecutiveSilentCycles({
        createdAt: new Date(2026, 6, 1),
        closedCycles,
        activeSignalCycleIds: new Set(["c3"]),
        signaledCurrentCycle: false,
        visitedCurrentCycle: false,
      }),
    ).toBe(2);
    expect(
      countConsecutiveSilentCycles({
        createdAt: new Date(2026, 6, 1),
        closedCycles,
        activeSignalCycleIds: new Set(),
        signaledCurrentCycle: true,
        visitedCurrentCycle: false,
      }),
    ).toBe(0);
  });
});
