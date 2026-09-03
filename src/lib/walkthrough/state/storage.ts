import type { WalkthroughState } from "../types";

const STORAGE_KEY = "janjez-walkthrough-state";
const INTERACTION_TIMEOUT_MS = 5 * 60 * 1000;

export function loadWalkthroughState(journeyId: string): WalkthroughState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: Record<string, WalkthroughState> = JSON.parse(raw);
    const journeyState = parsed[journeyId];
    if (!journeyState) return null;

    if (journeyState.lastInteraction) {
      const elapsed = Date.now() - new Date(journeyState.lastInteraction).getTime();
      if (elapsed > INTERACTION_TIMEOUT_MS * 24) {
        delete parsed[journeyId];
        saveWalkthroughState(journeyId, { ...journeyState, dismissed: true });
        return { ...journeyState, dismissed: true };
      }
    }

    return journeyState;
  } catch {
    return null;
  }
}

export function saveWalkthroughState(journeyId: string, state: Partial<WalkthroughState>): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all: Record<string, WalkthroughState> = raw ? JSON.parse(raw) : {};
    all[journeyId] = {
      journeyId,
      stepIndex: 0,
      started: false,
      completed: false,
      skipped: false,
      dismissed: false,
      lastInteraction: null,
      version: 1,
      completedSteps: [],
      ...all[journeyId],
      ...state,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
  }
}

export function clearWalkthroughState(journeyId?: string): void {
  if (typeof window === "undefined") return;
  if (journeyId) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const all: Record<string, WalkthroughState> = JSON.parse(raw);
        delete all[journeyId];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      }
    } catch {
    }
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function getJourneyVersion(journeyId: string): number {
  const state = loadWalkthroughState(journeyId);
  return state?.version ?? 0;
}
