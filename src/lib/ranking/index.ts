/**
 * Visit-priority ranking — deterministic, NO AI (docs/06-RANKING-LOGIC.md).
 *
 *   score = wSilent × M_silent + W_status + B_visit
 *
 * Initial heuristic proposed by the team; weights are NOT validated yet and are
 * meant to be calibrated with practitioners. Pure functions only (easy to test).
 */
import type { UnitStatus } from "../status";

export interface RankingConfig {
  /** multiplier for consecutive silent cycles (default 2) */
  wSilent: number;
  wUnconfirmed: number;
  wPaused: number;
  /** days after a cycle opens before "no signal" becomes Unconfirmed */
  cutoffDays: number;
}

export const DEFAULT_CONFIG: RankingConfig = {
  wSilent: 2,
  wUnconfirmed: 3,
  wPaused: 2,
  cutoffDays: 7,
};

export interface RankInput {
  status: UnitStatus;
  /** consecutive monthly cycles without a manager signal or coordinator verification */
  silentCycles: number;
  /** months since last coordinator contact/visit; null = never */
  monthsSinceContact: number | null;
  /** ISO date of the last manager signal; null = never. Used only for tie-breaks. */
  lastSignalAt?: string | null;
}

export interface ScoreBreakdown {
  silent: number; // wSilent × M
  status: number; // W_status
  visitBonus: number; // B_visit
  total: number;
}

export function visitBonus(monthsSinceContact: number | null): number {
  if (monthsSinceContact === null || monthsSinceContact > 6) return 2;
  if (monthsSinceContact >= 3) return 1;
  return 0;
}

/** null = excluded from the visit list (Closed units). */
export function breakdown(u: RankInput, cfg: RankingConfig = DEFAULT_CONFIG): ScoreBreakdown | null {
  if (u.status === "CLOSED") return null;
  const w = { UNCONFIRMED: cfg.wUnconfirmed, PAUSED: cfg.wPaused, OPERATING: 0 }[u.status];
  const silent = cfg.wSilent * u.silentCycles;
  const bonus = visitBonus(u.monthsSinceContact);
  return { silent, status: w, visitBonus: bonus, total: silent + w + bonus };
}

export function score(u: RankInput, cfg: RankingConfig = DEFAULT_CONFIG): number | null {
  return breakdown(u, cfg)?.total ?? null;
}

export type Ranked<T> = T & { rank: number; score: number; breakdown: ScoreBreakdown };

/**
 * Highest score first. Ties: older last signal first (never = oldest), then input order.
 * Closed units are excluded (returned separately by `splitClosed` if needed).
 */
export function rankUnits<T extends RankInput>(units: T[], cfg: RankingConfig = DEFAULT_CONFIG): Ranked<T>[] {
  const scored = units
    .map((u, index) => ({ u, index, b: breakdown(u, cfg) }))
    .filter((x): x is { u: T; index: number; b: ScoreBreakdown } => x.b !== null);

  scored.sort((a, b) => {
    if (b.b.total !== a.b.total) return b.b.total - a.b.total;
    const ta = a.u.lastSignalAt ? Date.parse(a.u.lastSignalAt) : -Infinity;
    const tb = b.u.lastSignalAt ? Date.parse(b.u.lastSignalAt) : -Infinity;
    if (ta !== tb) return ta - tb;
    return a.index - b.index;
  });

  return scored.map((x, i) => ({ ...x.u, rank: i + 1, score: x.b.total, breakdown: x.b }));
}
