/** Demo-mode ranking weights, kept in localStorage (synthetic, browser-only). */
import { DEFAULT_CONFIG, type RankingConfig } from "@/lib/ranking";

const KEY = "pilah-kunjung-demo-settings-v1";

function isValid(value: unknown): value is RankingConfig {
  if (!value || typeof value !== "object") return false;
  const config = value as Record<string, unknown>;
  return (
    typeof config.wSilent === "number" &&
    typeof config.wUnconfirmed === "number" &&
    typeof config.wPaused === "number" &&
    typeof config.cutoffDays === "number" &&
    [config.wSilent, config.wUnconfirmed, config.wPaused].every((n) => Number.isInteger(n) && (n as number) >= 0 && (n as number) <= 10) &&
    Number.isInteger(config.cutoffDays) &&
    (config.cutoffDays as number) >= 1 &&
    (config.cutoffDays as number) <= 31
  );
}

export function loadDemoConfig(): RankingConfig {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isValid(parsed)) return parsed;
    }
  } catch {
    /* storage blocked or corrupt: use defaults */
  }
  return { ...DEFAULT_CONFIG };
}

export function saveDemoConfig(config: RankingConfig): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(config));
  } catch {
    /* in-memory only */
  }
}

export function resetDemoConfig(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
