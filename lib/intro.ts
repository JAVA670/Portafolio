"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny cross-component signals for the opening sequence:
 *  - `heroReady`  — the hero render has decoded (the preloader waits for it)
 *  - `introDone`  — the preloader has lifted (hero choreography starts)
 */
type Signal = "heroReady" | "introDone";

const state: Record<Signal, boolean> = { heroReady: false, introDone: false };
const listeners = new Set<() => void>();

export function emit(signal: Signal) {
  if (state[signal]) return;
  state[signal] = true;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSignal(signal: Signal) {
  return useSyncExternalStore(
    subscribe,
    () => state[signal],
    () => false
  );
}
