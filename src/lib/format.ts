const DAY = 86_400_000;

export function daysSince(iso: string | null, now: Date): number | null {
  if (!iso) return null;
  return Math.max(0, Math.floor((now.getTime() - Date.parse(iso)) / DAY));
}

/** English relative label for the coordinator dashboard. */
export function agoEn(iso: string | null, now: Date): string {
  const d = daysSince(iso, now);
  if (d === null) return "Never";
  if (d === 0) return "Today";
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

export function monthsEn(m: number | null): string {
  if (m === null) return "Never";
  if (m === 0) return "This month";
  return `${m} mo ago`;
}

export function dateEn(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function dateTimeEn(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function dateId(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export function timeId(d: Date): string {
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(".", ":");
}

export function csvCell(v: string | number | null): string {
  const s = v === null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
