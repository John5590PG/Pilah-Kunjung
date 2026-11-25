/**
 * Prototype state — pure functions over a plain object (no backend).
 * Persisted in localStorage by ./store.ts. All data is SYNTHETIC.
 */
import seed from "@/data/seed-units.json";
import type { ContactMode, ReportedStatus, UnitStatus } from "../status";

export const UNDO_WINDOW_MS = 10 * 60 * 1000;

export interface DemoUnit {
  id: string;
  name: string;
  kelurahan: string;
  token: string;
  contact: string;
  status: UnitStatus;
  silentCycles: number;
  monthsSinceContact: number | null;
  lastSignalAt: string | null;
  lastVisitedAt: string | null;
  signaledThisCycle: boolean;
  draftSentAt: string | null;
  isSynthetic: true;
}

export interface UnitSnapshot {
  status: UnitStatus;
  silentCycles: number;
  lastSignalAt: string | null;
  signaledThisCycle: boolean;
}

export interface DemoSignal {
  id: string;
  unitId: string;
  cycle: string;
  status: ReportedStatus;
  at: string;
  undoneAt: string | null;
  before: UnitSnapshot;
}

export interface DemoVisit {
  id: string;
  unitId: string;
  mode: ContactMode;
  verifiedStatus: ReportedStatus;
  note: string;
  at: string;
}

export interface DemoState {
  version: 1;
  cycle: string; // "YYYY-MM"
  units: DemoUnit[];
  signals: DemoSignal[];
  visits: DemoVisit[];
}

const DAY = 86_400_000;

export function cycleLabel(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function createInitialState(now: Date): DemoState {
  const units: DemoUnit[] = (seed as Array<Record<string, unknown>>).map((s) => {
    const status = s.status as UnitStatus;
    const silentCycles = s.silentCycles as number;
    const daysAgo = s.lastSignalDaysAgo as number | null;
    const months = s.monthsSinceContact as number | null;
    return {
      id: s.id as string,
      name: s.name as string,
      kelurahan: s.kelurahan as string,
      token: s.token as string,
      contact: s.contact as string,
      status,
      silentCycles,
      monthsSinceContact: months,
      lastSignalAt: daysAgo === null ? null : new Date(now.getTime() - daysAgo * DAY).toISOString(),
      lastVisitedAt: months === null ? null : new Date(now.getTime() - months * 30 * DAY).toISOString(),
      signaledThisCycle: silentCycles === 0 && status !== "UNCONFIRMED" && status !== "CLOSED",
      draftSentAt: null,
      isSynthetic: true as const,
    };
  });
  return { version: 1, cycle: cycleLabel(now), units, signals: [], visits: [] };
}

const uid = (p: string, now: Date) => `${p}-${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export function findByToken(s: DemoState, token: string): DemoUnit | undefined {
  return s.units.find((u) => u.token === token);
}

function mapUnit(s: DemoState, id: string, fn: (u: DemoUnit) => DemoUnit): DemoState {
  return { ...s, units: s.units.map((u) => (u.id === id ? fn(u) : u)) };
}

/** Manager taps a status button (POST in the real product; GET never mutates). */
export function checkIn(s: DemoState, token: string, status: ReportedStatus, now: Date): DemoState {
  const unit = findByToken(s, token);
  if (!unit) return s;
  const signal: DemoSignal = {
    id: uid("sig", now),
    unitId: unit.id,
    cycle: s.cycle,
    status,
    at: now.toISOString(),
    undoneAt: null,
    before: {
      status: unit.status,
      silentCycles: unit.silentCycles,
      lastSignalAt: unit.lastSignalAt,
      signaledThisCycle: unit.signaledThisCycle,
    },
  };
  const next = mapUnit(s, unit.id, (u) => ({
    ...u,
    status,
    silentCycles: 0,
    lastSignalAt: now.toISOString(),
    signaledThisCycle: true,
  }));
  return { ...next, signals: [...next.signals, signal] };
}

export function latestActiveSignal(s: DemoState, unitId: string): DemoSignal | undefined {
  return [...s.signals].reverse().find((x) => x.unitId === unitId && !x.undoneAt);
}

export function canUndo(signal: DemoSignal | undefined, now: Date): boolean {
  return !!signal && !signal.undoneAt && now.getTime() - Date.parse(signal.at) <= UNDO_WINDOW_MS;
}

/** "Batalkan" within 10 minutes: restore the unit to its state before the signal. */
export function undoCheckIn(s: DemoState, token: string, now: Date): DemoState {
  const unit = findByToken(s, token);
  if (!unit) return s;
  const sig = latestActiveSignal(s, unit.id);
  if (!sig || !canUndo(sig, now)) return s;
  const next = mapUnit(s, unit.id, (u) => ({ ...u, ...sig.before }));
  return {
    ...next,
    signals: next.signals.map((x) => (x.id === sig.id ? { ...x, undoneAt: now.toISOString() } : x)),
  };
}

export interface VisitInput {
  mode: ContactMode;
  verifiedStatus: ReportedStatus;
  note: string;
}

/** Coordinator logs a call/visit with a verified status; the manager sees it on /c/[token]. */
export function recordVisit(s: DemoState, unitId: string, input: VisitInput, now: Date): DemoState {
  if (!s.units.some((u) => u.id === unitId)) return s;
  const visit: DemoVisit = {
    id: uid("vis", now),
    unitId,
    mode: input.mode,
    verifiedStatus: input.verifiedStatus,
    note: input.note.trim().slice(0, 280),
    at: now.toISOString(),
  };
  const next = mapUnit(s, unitId, (u) => ({
    ...u,
    status: input.verifiedStatus,
    silentCycles: 0,
    monthsSinceContact: 0,
    lastVisitedAt: now.toISOString(),
    signaledThisCycle: true,
  }));
  return { ...next, visits: [...next.visits, visit] };
}

export function latestVisit(s: DemoState, unitId: string): DemoVisit | undefined {
  return [...s.visits].reverse().find((v) => v.unitId === unitId);
}

export function markDraftSent(s: DemoState, unitId: string, now: Date): DemoState {
  return mapUnit(s, unitId, (u) => ({ ...u, draftSentAt: now.toISOString() }));
}

/**
 * DEMO ONLY — simulates "cutoff passes, next cycle opens":
 * non-closed units without a signal this cycle become Unconfirmed (+1 silent cycle).
 * Real automatic rollover is planned (Final Day task 3).
 */
export function advanceCycle(s: DemoState): DemoState {
  const [y, m] = s.cycle.split("-").map(Number);
  const nextCycle = cycleLabel(new Date(y, m, 1)); // month index m == next month
  return {
    ...s,
    cycle: nextCycle,
    units: s.units.map((u) => {
      const silent = u.status !== "CLOSED" && !u.signaledThisCycle;
      return {
        ...u,
        status: silent ? "UNCONFIRMED" : u.status,
        silentCycles: silent ? u.silentCycles + 1 : u.silentCycles,
        monthsSinceContact: u.monthsSinceContact === null ? null : u.monthsSinceContact + 1,
        signaledThisCycle: false,
        draftSentAt: null,
      };
    }),
  };
}
