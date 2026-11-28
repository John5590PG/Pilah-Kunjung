/**
 * Single data layer for both modes:
 *  - demo: localStorage via lib/demo (still works with no .env / no database)
 *  - api : PostgreSQL via /api/* (detected automatically through /api/health)
 *
 * Components keep rendering a DemoState-shaped object, but every mutation is a
 * real POST in API mode. The public ranking engine stays the pure one (docs/06).
 */
"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import seedUnits from "@/data/seed-units.json";
import { useDemo } from "@/lib/demo/store";
import {
  checkIn as demoCheckIn,
  cycleLabel,
  recordVisit as demoVisit,
  undoCheckIn as demoUndo,
  markDraftSent as demoDraftSent,
  advanceCycle as demoRoll,
  type DemoSignal,
  type DemoState,
  type DemoUnit,
  type DemoVisit,
  type VisitInput,
} from "@/lib/demo/state";
import { DEFAULT_CONFIG, type RankingConfig } from "@/lib/ranking";
import { loadDemoConfig, resetDemoConfig, saveDemoConfig } from "@/lib/demo/settings";
import type { ReportedStatus } from "@/lib/status";
import { apiFetch, apiPost } from "@/lib/api/client";
import type { UnitsResult, UnitListItem } from "@/lib/services/units";

export type Mode = "loading" | "demo" | "api";

export interface TokenView {
  id: string;
  name: string;
  kelurahan: string;
  status: string;
  isSynthetic: boolean;
  lastSignalAt: string | null;
  signalAt: string | null;
  signalStatus: ReportedStatus | null;
  cycle: string | null;
  canUndo: boolean;
  visit: { mode: "CALL" | "VISIT"; verifiedStatus: string; note: string | null; at: string } | null;
}

interface ApiVisit {
  id: string;
  unitId: string;
  contactMode: "CALL" | "VISIT";
  verifiedStatus: string;
  actionNote: string | null;
  verifiedAt: string;
}

interface AppData {
  mode: Mode;
  state: DemoState | null;
  config: RankingConfig;
  busy: boolean;
  error: string | null;
  refreshKey: number;
  tokenView?: TokenView | null;
  actions: {
    checkIn(token: string, status: ReportedStatus): Promise<void>;
    undo(token: string): Promise<void>;
    recordVisit(unitId: string, input: VisitInput): Promise<void>;
    markDraftSent(unitId: string): Promise<void>;
    rollover(): Promise<void>;
    resetDemo(): void;
    setDemoConfig(config: RankingConfig): void;
    refresh(): Promise<void>;
    reloadToken(): void;
  };
}

const AppDataContext = createContext<AppData | null>(null);

const seedTokenById = new Map(
  (seedUnits as Array<{ id: string; token: string }>).map((unit) => [unit.id, unit.token]),
);

function toDemoUnit(unit: UnitListItem): DemoUnit {
  return {
    id: unit.id,
    name: unit.name,
    kelurahan: unit.kelurahan,
    token: seedTokenById.get(unit.id) ?? "invalid-token",
    contact: unit.managerContact ?? "",
    status: unit.status,
    silentCycles: unit.silentCycles,
    monthsSinceContact: unit.monthsSinceContact,
    lastSignalAt: unit.lastSignalAt,
    lastVisitedAt: unit.lastVisitedAt,
    signaledThisCycle: unit.signaledThisCycle,
    draftSentAt: unit.draftSentAt,
    isSynthetic: true as const,
  };
}

function toDemoState(data: UnitsResult, visits: ApiVisit[]): DemoState {
  const demoVisits: DemoVisit[] = visits.map((visit) => ({
    id: visit.id,
    unitId: visit.unitId,
    mode: visit.contactMode,
    verifiedStatus: visit.verifiedStatus as DemoVisit["verifiedStatus"],
    note: visit.actionNote ?? "",
    at: visit.verifiedAt,
  }));

  const demoSignals: DemoSignal[] = (data.signals ?? []).map((sig) => ({
    id: sig.id,
    unitId: sig.unitId,
    cycle: sig.cycle,
    status: sig.status,
    at: sig.at,
    undoneAt: sig.undoneAt,
    before: { status: "UNCONFIRMED", silentCycles: 0, lastSignalAt: null, signaledThisCycle: false },
  }));

  return {
    version: 1,
    cycle: data.cycle?.label ?? cycleLabel(new Date()),
    units: [...data.units, ...data.closed].map(toDemoUnit),
    signals: demoSignals,
    visits: demoVisits,
  };
}

const COORDINATOR_PREFIXES = ["/dashboard", "/cycles", "/units", "/settings"];

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const demo = useDemo();
  const pathname = usePathname();
  const [mode, setMode] = useState<Mode>("loading");
  const [apiState, setApiState] = useState<DemoState | null>(null);
  const [apiConfig, setApiConfig] = useState<RankingConfig>(DEFAULT_CONFIG);
  const [demoConfig, setDemoConfigState] = useState<RankingConfig>({ ...DEFAULT_CONFIG });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  const needsCoordinatorData = COORDINATOR_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  useEffect(() => {
    setDemoConfigState(loadDemoConfig());
  }, []);

  useEffect(() => {
    let alive = true;
    apiFetch<{ mode: "api" | "demo" }>("/api/health")
      .then((health) => alive && setMode(health.mode))
      .catch(() => alive && setMode("demo"));
    return () => {
      alive = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (mode !== "api" || !needsCoordinatorData) return;
    try {
      const [data, visitData] = await Promise.all([
        apiFetch<UnitsResult>("/api/units"),
        apiFetch<{ visits: ApiVisit[] }>("/api/visits"),
      ]);
      setApiState(toDemoState(data, visitData.visits));
      setApiConfig(data.config);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal memuat data dari server.");
    }
  }, [mode, needsCoordinatorData]);

  useEffect(() => {
    if (mode === "api" && needsCoordinatorData) void refresh();
  }, [mode, needsCoordinatorData, refresh, revision]);

  const run = useCallback(
    async (action: () => Promise<unknown> | void) => {
      setBusy(true);
      setError(null);
      try {
        await action();
        if (mode === "api") setRevision((value) => value + 1);
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : "Tindakan gagal.";
        setError(message);
        throw cause;
      } finally {
        setBusy(false);
      }
    },
    [mode],
  );

  const demoAction = (action: () => void): Promise<void> => Promise.resolve(action());

  const value: AppData = {
    mode,
    state: mode === "api" ? apiState : demo.state,
    config: mode === "api" ? apiConfig : demoConfig,
    busy,
    error,
    refreshKey: revision,
    actions: {
      checkIn: (token, status) =>
        mode === "api"
          ? run(() => apiPost("/api/checkin", { token, status }))
          : demoAction(() => demo.update((state) => demoCheckIn(state, token, status, new Date()))),
      undo: (token) =>
        mode === "api"
          ? run(() => apiPost("/api/checkin/undo", { token }))
          : demoAction(() => demo.update((state) => demoUndo(state, token, new Date()))),
      recordVisit: (unitId, input) =>
        mode === "api"
          ? run(() => apiPost("/api/visits", { unitId, ...input }))
          : demoAction(() => demo.update((state) => demoVisit(state, unitId, input, new Date()))),
      markDraftSent: (unitId) =>
        mode === "api"
          ? run(() => apiPost("/api/cycles/draft", { unitId }))
          : demoAction(() => demo.update((state) => demoDraftSent(state, unitId, new Date()))),
      rollover: () =>
        mode === "api"
          ? run(() => apiPost("/api/cycles", { action: "rollover" }))
          : demoAction(() => demo.update(demoRoll)),
      resetDemo: () => {
        if (mode === "demo") {
          demo.reset();
          resetDemoConfig();
          setDemoConfigState({ ...DEFAULT_CONFIG });
        }
      },
      setDemoConfig: (next) => {
        saveDemoConfig(next);
        setDemoConfigState(next);
      },
      refresh: () => refresh(),
      reloadToken: () => setRevision((value) => value + 1),
    },
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

/** `token` is only supplied by the manager check-in screen. */
export function useAppData(token?: string): AppData {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside AppDataProvider");

  const [tokenState, setTokenState] = useState<{ key: string; value: TokenView | null } | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!token || ctx.mode !== "api") {
      setTokenState(null);
      return;
    }
    let alive = true;
    apiFetch<{ unit: TokenView }>(`/api/checkin?token=${encodeURIComponent(token)}`)
      .then((result) => alive && setTokenState({ key: token, value: result.unit }))
      .catch(() => alive && setTokenState({ key: token, value: null }));
    return () => {
      alive = false;
    };
  }, [token, ctx.mode, ctx.refreshKey, tick]);

  return {
    ...ctx,
    tokenView: token ? (tokenState?.key === token ? tokenState.value : undefined) : undefined,
    actions: { ...ctx.actions, reloadToken: () => setTick((value) => value + 1) },
  };
}
