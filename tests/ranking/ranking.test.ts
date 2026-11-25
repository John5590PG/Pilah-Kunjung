import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG, rankUnits, score, visitBonus } from "@/lib/ranking";
import type { RankInput } from "@/lib/ranking";

const u = (o: Partial<RankInput>): RankInput => ({
  status: "OPERATING",
  silentCycles: 0,
  monthsSinceContact: 0,
  lastSignalAt: null,
  ...o,
});

describe("ranking (docs/06)", () => {
  it("reproduces documented examples A, B, C", () => {
    expect(score(u({ status: "UNCONFIRMED", silentCycles: 3, monthsSinceContact: null }))).toBe(11);
    expect(score(u({ status: "PAUSED", silentCycles: 1, monthsSinceContact: 4 }))).toBe(5);
    expect(score(u({ status: "OPERATING", silentCycles: 0, monthsSinceContact: 1 }))).toBe(0);
  });

  it("excludes Closed units", () => {
    expect(score(u({ status: "CLOSED", silentCycles: 9 }))).toBeNull();
    const ranked = rankUnits([u({ status: "CLOSED" }), u({ status: "PAUSED" })]);
    expect(ranked).toHaveLength(1);
    expect(ranked[0].status).toBe("PAUSED");
  });

  it("applies visit bonus boundaries at 3 and 6 months, and for 'never'", () => {
    expect(visitBonus(null)).toBe(2);
    expect(visitBonus(7)).toBe(2);
    expect(visitBonus(6)).toBe(1);
    expect(visitBonus(3)).toBe(1);
    expect(visitBonus(2)).toBe(0);
    expect(visitBonus(0)).toBe(0);
  });

  it("uses weights from config", () => {
    const cfg = { ...DEFAULT_CONFIG, wSilent: 5, wUnconfirmed: 10 };
    expect(score(u({ status: "UNCONFIRMED", silentCycles: 2, monthsSinceContact: 0 }), cfg)).toBe(20);
  });

  it("breaks ties by older last signal (never = oldest), then input order", () => {
    const a = { ...u({ status: "PAUSED", lastSignalAt: "2026-10-01T00:00:00Z" }), id: "a" };
    const b = { ...u({ status: "PAUSED", lastSignalAt: "2026-08-01T00:00:00Z" }), id: "b" };
    const c = { ...u({ status: "PAUSED", lastSignalAt: null }), id: "c" };
    const d = { ...u({ status: "PAUSED", lastSignalAt: null }), id: "d" };
    expect(rankUnits([a, b, d, c]).map((x) => x.id)).toEqual(["d", "c", "b", "a"]);
  });

  it("handles a unit with no history at all", () => {
    const r = rankUnits([u({ status: "UNCONFIRMED", silentCycles: 0, monthsSinceContact: null })]);
    expect(r[0].score).toBe(5); // 0 + 3 + 2
    expect(r[0].rank).toBe(1);
  });
});
