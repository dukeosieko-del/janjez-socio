import type { ReactNode } from "react";

export type StepPlacement =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "bottom-center"
  | "top-center";

export type StepActionExpectation =
  | "click"
  | "input"
  | "scroll-into-view"
  | "none";

export type StepNextBehaviour =
  | "auto"
  | "action"
  | "manual";

export interface WalkthroughStep {
  id: string;
  journeyId: string;
  title: string;
  description: string | ReactNode;
  target?: string;
  route?: string;
  placement?: StepPlacement;
  condition?: () => boolean;
  required?: boolean;
  actionExpectation?: StepActionExpectation;
  nextBehaviour?: StepNextBehaviour;
  action?: () => void | Promise<void>;
  skipOnMobile?: boolean;
  mobileAsSheet?: boolean;
}

export interface JourneyDefinition {
  id: string;
  title: string;
  description: string;
  version: number;
  steps: WalkthroughStep[];
  autoStart?: boolean;
  showProgress?: boolean;
  allowSkip?: boolean;
}

export interface WalkthroughState {
  journeyId: string | null;
  stepIndex: number;
  started: boolean;
  completed: boolean;
  skipped: boolean;
  dismissed: boolean;
  lastInteraction: string | null;
  version: number;
  completedSteps: string[];
}

export interface WalkthroughEvent {
  type:
    | "walkthrough_started"
    | "walkthrough_step_viewed"
    | "walkthrough_step_completed"
    | "walkthrough_step_skipped"
    | "walkthrough_dismissed"
    | "walkthrough_completed";
  journeyId?: string;
  stepId?: string;
  stepIndex?: number;
}

export interface WalkthroughContextType {
  activeJourney: JourneyDefinition | null;
  currentStep: WalkthroughStep | null;
  stepIndex: number;
  totalSteps: number;
  state: WalkthroughState;
  isActive: boolean;
  isMobile: boolean;
  start: (journeyId: string) => void;
  stop: () => void;
  next: () => void;
  back: () => void;
  skip: () => void;
  close: () => void;
  restart: () => void;
  resume: () => void;
  markStepCompleted: (stepId: string) => void;
  recordInteraction: () => void;
}
