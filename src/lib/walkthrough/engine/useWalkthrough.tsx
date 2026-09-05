"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { JourneyDefinition, WalkthroughStep, WalkthroughState, WalkthroughContextType } from "../types";
import { getJourney } from "../journeys";
import { loadWalkthroughState, saveWalkthroughState, clearWalkthroughState } from "../state/storage";
import { emitWalkthroughEvent } from "../state/events";
import { resolveTarget } from "./target-resolver";

const MOBILE_BREAKPOINT = 768;

const WalkthroughContext = createContext<WalkthroughContextType | undefined>(undefined);

export function useWalkthrough() {
  const ctx = useContext(WalkthroughContext);
  if (!ctx) {
    throw new Error("useWalkthrough must be used within a WalkthroughProvider");
  }
  return ctx;
}

export function WalkthroughProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [activeJourney, setActiveJourney] = useState<JourneyDefinition | null>(null);
  const [state, setState] = useState<WalkthroughState>({
    journeyId: null,
    stepIndex: 0,
    started: false,
    completed: false,
    skipped: false,
    dismissed: false,
    lastInteraction: null,
    version: 1,
    completedSteps: [],
  });

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeJourney) {
        close();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeJourney]);

  const start = useCallback((journeyId: string) => {
    const journey = getJourney(journeyId);
    if (!journey) return;

    const saved = loadWalkthroughState(journeyId);
    const initialState: WalkthroughState = {
      journeyId,
      stepIndex: saved?.stepIndex ?? 0,
      started: true,
      completed: saved?.completed ?? false,
      skipped: false,
      dismissed: false,
      lastInteraction: new Date().toISOString(),
      version: journey.version,
      completedSteps: saved?.completedSteps ?? [],
    };

    if (saved?.dismissed) {
      return;
    }

    setState(initialState);
    setActiveJourney(journey);
    saveWalkthroughState(journeyId, initialState);
    emitWalkthroughEvent({ type: "walkthrough_started", journeyId });
  }, []);

  const stop = useCallback(() => {
    if (state.journeyId) {
      clearWalkthroughState(state.journeyId);
    }
    setState({
      journeyId: null,
      stepIndex: 0,
      started: false,
      completed: false,
      skipped: false,
      dismissed: false,
      lastInteraction: null,
      version: 1,
      completedSteps: [],
    });
    setActiveJourney(null);
  }, [state.journeyId]);

  const updateStep = useCallback(
    (newIndex: number) => {
      if (!activeJourney) return;

      const steps = activeJourney.steps;
      if (newIndex < 0 || newIndex >= steps.length) return;

      const newStep = steps[newIndex];
      if (!newStep) return;

      if (newStep.condition && !newStep.condition()) {
        const nextValid = findNextValidIndex(steps, newIndex + 1);
        if (nextValid !== null) {
          updateStep(nextValid);
        } else {
          complete();
        }
        return;
      }

      setState((prev) => {
        const newState: WalkthroughState = {
          ...prev,
          stepIndex: newIndex,
          lastInteraction: new Date().toISOString(),
        };
        if (state.journeyId) {
          saveWalkthroughState(state.journeyId, newState);
        }
        return newState;
      });

      emitWalkthroughEvent({
        type: "walkthrough_step_viewed",
        journeyId: activeJourney.id,
        stepId: newStep.id,
        stepIndex: newIndex,
      });
    },
    [activeJourney, state.journeyId]
  );

  const next = useCallback(() => {
    if (!activeJourney) return;
    const steps = activeJourney.steps;
    const currentIndex = state.stepIndex;
    const nextIndex = findNextValidIndex(steps, currentIndex + 1);

    if (nextIndex === null) {
      complete();
    } else {
      emitWalkthroughEvent({
        type: "walkthrough_step_completed",
        journeyId: activeJourney.id,
        stepId: steps[currentIndex]?.id,
        stepIndex: currentIndex,
      });
      updateStep(nextIndex);
    }
  }, [activeJourney, state.stepIndex, updateStep]);

  const back = useCallback(() => {
    if (!activeJourney) return;
    const steps = activeJourney.steps;
    const currentIndex = state.stepIndex;
    const prevIndex = findPrevValidIndex(steps, currentIndex - 1);

    if (prevIndex !== null) {
      emitWalkthroughEvent({
        type: "walkthrough_step_skipped",
        journeyId: activeJourney.id,
        stepId: steps[currentIndex]?.id,
        stepIndex: currentIndex,
      });
      updateStep(prevIndex);
    }
  }, [activeJourney, state.stepIndex, updateStep]);

  const skip = useCallback(() => {
    if (!activeJourney || !state.journeyId) return;
    setState((prev) => ({ ...prev, skipped: true, started: false }));
    saveWalkthroughState(state.journeyId, { skipped: true, started: false });
    emitWalkthroughEvent({ type: "walkthrough_step_skipped", journeyId: activeJourney.id });
    setActiveJourney(null);
  }, [activeJourney, state.journeyId]);

  const close = useCallback(() => {
    if (!state.journeyId) return;
    setState((prev) => ({ ...prev, dismissed: true, started: false }));
    saveWalkthroughState(state.journeyId, { dismissed: true, started: false });
    emitWalkthroughEvent({ type: "walkthrough_dismissed", journeyId: state.journeyId });
    setActiveJourney(null);
  }, [state.journeyId]);

  const complete = useCallback(() => {
    if (!activeJourney || !state.journeyId) return;
    setState((prev) => ({
      ...prev,
      completed: true,
      started: false,
      lastInteraction: new Date().toISOString(),
    }));
    saveWalkthroughState(state.journeyId, {
      completed: true,
      started: false,
      completedSteps: activeJourney.steps.map((s) => s.id),
      lastInteraction: new Date().toISOString(),
    });
    emitWalkthroughEvent({ type: "walkthrough_completed", journeyId: activeJourney.id });
    setActiveJourney(null);
  }, [activeJourney, state.journeyId]);

  const restart = useCallback(() => {
    if (!activeJourney) return;
    clearWalkthroughState(activeJourney.id);
    start(activeJourney.id);
    emitWalkthroughEvent({ type: "walkthrough_started", journeyId: activeJourney.id });
  }, [activeJourney, start]);

  const resume = useCallback(() => {
    if (activeJourney && state.journeyId && !state.started) {
      start(activeJourney.id);
    }
  }, [activeJourney, state, start]);

  const markStepCompleted = useCallback((stepId: string) => {
    if (!activeJourney || !state.journeyId) return;
    setState((prev) => ({
      ...prev,
      completedSteps: Array.from(new Set([...prev.completedSteps, stepId])),
    }));
    saveWalkthroughState(state.journeyId, {
      completedSteps: Array.from(new Set([...state.completedSteps, stepId])),
    });
  }, [activeJourney, state]);

  const recordInteraction = useCallback(() => {
    if (!state.journeyId) return;
    const newState: WalkthroughState = {
      ...state,
      lastInteraction: new Date().toISOString(),
    };
    setState(newState);
    saveWalkthroughState(state.journeyId, newState);
  }, [state]);

  const isActive = !!activeJourney && state.started;
  const currentStep = activeJourney?.steps[state.stepIndex] ?? null;
  const totalSteps = activeJourney?.steps.length ?? 0;

  useEffect(() => {
    if (activeJourney && isActive && currentStep) {
      recordInteraction();
    }
  }, [pathname, currentStep, isActive, activeJourney, recordInteraction]);

  const contextValue = useMemo<WalkthroughContextType>(
    () => ({
      activeJourney,
      currentStep,
      stepIndex: state.stepIndex,
      totalSteps,
      state,
      isActive,
      isMobile,
      start,
      stop,
      next,
      back,
      skip,
      close,
      restart,
      resume,
      markStepCompleted,
      recordInteraction,
    }),
    [
      activeJourney,
      currentStep,
      state,
      isActive,
      isMobile,
      start,
      stop,
      next,
      back,
      skip,
      close,
      restart,
      resume,
      markStepCompleted,
      recordInteraction,
    ]
  );

  return (
    <WalkthroughContext.Provider value={contextValue}>
      {children}
    </WalkthroughContext.Provider>
  );
}

function findNextValidIndex(steps: WalkthroughStep[], from: number): number | null {
  for (let i = from; i < steps.length; i++) {
    const step = steps[i];
    if (!step) continue;
    if (step.skipOnMobile && typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT) {
      continue;
    }
    if (step.condition && !step.condition()) {
      continue;
    }
    return i;
  }
  return null;
}

function findPrevValidIndex(steps: WalkthroughStep[], from: number): number | null {
  for (let i = from; i >= 0; i--) {
    const step = steps[i];
    if (!step) continue;
    if (step.skipOnMobile && typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT) {
      continue;
    }
    if (step.condition && !step.condition()) {
      continue;
    }
    return i;
  }
  return null;
}
