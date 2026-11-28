/**
 * Pure cycle/date maths shared by the ranking and the rollover service.
 * No database imports so it can be unit-tested cheaply.
 */

export function cycleLabel(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function nextCycleLabel(label: string): string {
  const [year, month] = label.split("-").map(Number);
  if (!year || !month) throw new Error(`Label siklus tidak valid: ${label}`);
  return cycleLabel(new Date(year, month, 1)); // month index === next month
}

const MONTHS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function periodLabelId(label: string): string {
  const [year, month] = label.split("-").map(Number);
  const name = MONTHS_ID[(month ?? 1) - 1] ?? label;
  return `${name} ${year}`;
}

export function cycleWindow(label: string, cutoffDays: number): { openedAt: Date; cutoffAt: Date } {
  const [year, month] = label.split("-").map(Number);
  const openedAt = new Date(year, (month ?? 1) - 1, 1, 0, 0, 0, 0);
  const cutoffAt = new Date(openedAt.getTime() + cutoffDays * 86_400_000);
  return { openedAt, cutoffAt };
}

/** Whole calendar months between two dates, never negative. */
export function monthsBetween(from: Date, to: Date): number {
  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  if (to.getDate() < from.getDate()) months -= 1;
  return Math.max(0, months);
}

export interface CycleStamp {
  openedAt: Date;
  closedAt: Date | null;
}

/**
 * Consecutive completed cycles with no manager signal or coordinator visit
 * after `lastContact`. The current (open) cycle is not counted yet; it becomes
 * silent at rollover, matching src/lib/demo/state.ts#advanceCycle.
 */
export function silentCyclesFor(lastContact: Date | null, cycles: CycleStamp[]): number {
  const closed = cycles.filter((cycle) => cycle.closedAt !== null);
  if (!lastContact) return closed.length;
  return closed.filter((cycle) => cycle.openedAt.getTime() > lastContact.getTime()).length;
}

export interface ClosedCycleRef {
  id: string;
  openedAt: Date;
}

/**
 * Counts consecutive closed cycles without a manager signal prior to the
 * current cycle, bounded by unit creation month and reset if the unit already
 * signaled or received a coordinator visit in the current cycle.
 */
export function countConsecutiveSilentCycles(opts: {
  createdAt: Date;
  closedCycles: ClosedCycleRef[];
  activeSignalCycleIds: Set<string>;
  signaledCurrentCycle: boolean;
  visitedCurrentCycle: boolean;
}): number {
  if (opts.signaledCurrentCycle || opts.visitedCurrentCycle) return 0;

  const createdMonthStart = new Date(opts.createdAt.getFullYear(), opts.createdAt.getMonth(), 1).getTime();
  const ordered = [...opts.closedCycles].sort((a, b) => b.openedAt.getTime() - a.openedAt.getTime());

  let count = 0;
  for (const cycle of ordered) {
    if (cycle.openedAt.getTime() < createdMonthStart) break;
    if (opts.activeSignalCycleIds.has(cycle.id)) break;
    count += 1;
  }
  return count;
}
