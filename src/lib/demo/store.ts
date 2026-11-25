"use client";

import { useSyncExternalStore } from "react";
import { createInitialState, type DemoState } from "./state";

const KEY = "pilah-kunjung-demo-v1";
let cache: DemoState | null = null;
const listeners = new Set<() => void>();

function load(): DemoState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState;
      if (parsed?.version === 1 && Array.isArray(parsed.units)) return parsed;
    }
  } catch {
    /* storage blocked or corrupt: fall back to seed */
  }
  return createInitialState(new Date());
}

function getSnapshot(): DemoState | null {
  if (typeof window === "undefined") return null;
  if (!cache) cache = load();
  return cache;
}

const getServerSnapshot = () => null;

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) {
      cache = null; // another tab changed the demo state
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function commit(next: DemoState) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* in-memory only for this tab */
  }
  listeners.forEach((l) => l());
}

/** Returns `state === null` until the client has hydrated (render a skeleton). */
export function useDemo() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    state,
    update: (fn: (s: DemoState) => DemoState) => {
      const cur = getSnapshot();
      if (cur) commit(fn(cur));
    },
    reset: () => commit(createInitialState(new Date())),
  };
}
