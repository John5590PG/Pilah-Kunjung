import { describe, expect, it } from "vitest";
import {
  advanceCycle, canUndo, checkIn, createInitialState, findByToken,
  latestActiveSignal, latestVisit, recordVisit, undoCheckIn,
} from "@/lib/demo/state";

const NOW = new Date("2026-11-25T08:00:00Z");
const fresh = () => createInitialState(NOW);

describe("demo seed", () => {
  it("has 30 synthetic units with unique tokens and a status mix", () => {
    const s = fresh();
    expect(s.units).toHaveLength(30);
    expect(s.units.every((u) => u.isSynthetic)).toBe(true);
    expect(new Set(s.units.map((u) => u.token)).size).toBe(30);
    const statuses = new Set(s.units.map((u) => u.status));
    expect(statuses.size).toBe(4);
  });
});

describe("check-in", () => {
  it("updates status, resets silent cycles, records a signal", () => {
    const s0 = fresh();
    const tok = s0.units[0].token; // u01 unconfirmed, 3 silent
    const s1 = checkIn(s0, tok, "PAUSED", NOW);
    const u = findByToken(s1, tok)!;
    expect(u.status).toBe("PAUSED");
    expect(u.silentCycles).toBe(0);
    expect(u.signaledThisCycle).toBe(true);
    expect(s1.signals).toHaveLength(1);
  });

  it("is a no-op for an unknown token", () => {
    const s0 = fresh();
    expect(checkIn(s0, "nope", "OPERATING", NOW)).toBe(s0);
  });

  it("undo within 10 minutes restores the previous state; after that it does not", () => {
    const s0 = fresh();
    const tok = s0.units[0].token;
    const s1 = checkIn(s0, tok, "OPERATING", NOW);
    const later = new Date(NOW.getTime() + 5 * 60_000);
    expect(canUndo(latestActiveSignal(s1, s0.units[0].id), later)).toBe(true);
    const s2 = undoCheckIn(s1, tok, later);
    const u = findByToken(s2, tok)!;
    expect(u.status).toBe("UNCONFIRMED");
    expect(u.silentCycles).toBe(3);
    expect(s2.signals[0].undoneAt).not.toBeNull();

    const tooLate = new Date(NOW.getTime() + 11 * 60_000);
    expect(undoCheckIn(s1, tok, tooLate)).toBe(s1);
  });
});

describe("visit confirmation", () => {
  it("updates status and is visible as latest visit (feedback for manager)", () => {
    const s0 = fresh();
    const unit = s0.units[0];
    const s1 = recordVisit(s0, unit.id, { mode: "CALL", verifiedStatus: "PAUSED", note: "Ganti pengurus" }, NOW);
    const u = s1.units[0];
    expect(u.status).toBe("PAUSED");
    expect(u.monthsSinceContact).toBe(0);
    expect(u.lastVisitedAt).toBe(NOW.toISOString());
    expect(latestVisit(s1, unit.id)?.note).toBe("Ganti pengurus");
  });

  it("truncates notes to 280 chars", () => {
    const s0 = fresh();
    const s1 = recordVisit(s0, s0.units[0].id, { mode: "VISIT", verifiedStatus: "OPERATING", note: "x".repeat(500) }, NOW);
    expect(s1.visits[0].note).toHaveLength(280);
  });
});

describe("cycle rollover (demo)", () => {
  it("turns silent non-closed units Unconfirmed and moves to next month", () => {
    const s0 = fresh();
    const s1 = advanceCycle(s0);
    expect(s1.cycle).toBe("2026-12");
    // u03 was OPERATING & signaled this cycle -> becomes silent now (new cycle) but only after next rollover
    const u03 = s1.units.find((u) => u.id === "u03")!;
    expect(u03.status).toBe("OPERATING");
    expect(u03.signaledThisCycle).toBe(false);
    const s2 = advanceCycle(s1);
    expect(s2.cycle).toBe("2027-01");
    expect(s2.units.find((u) => u.id === "u03")!.status).toBe("UNCONFIRMED");
    expect(s2.units.find((u) => u.id === "u03")!.silentCycles).toBe(1);
  });

  it("never reopens Closed units", () => {
    const s = advanceCycle(advanceCycle(fresh()));
    expect(s.units.find((u) => u.id === "u09")!.status).toBe("CLOSED");
  });
});
