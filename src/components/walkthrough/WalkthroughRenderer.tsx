"use client";

import { useWalkthrough } from "@/lib/walkthrough/engine/useWalkthrough";
import StepPopover from "./StepPopover";
import Spotlight from "./Spotlight";

export default function WalkthroughRenderer() {
  const {
    activeJourney,
    currentStep,
    stepIndex,
    totalSteps,
    state,
    isActive,
    isMobile,
    next,
    back,
    skip,
    close,
    markStepCompleted,
  } = useWalkthrough();

  if (!isActive || !currentStep) return null;

  const isLastStep = stepIndex >= totalSteps - 1;
  const target = currentStep.target;
  const isActionStep = currentStep.actionExpectation === "click";
  const stepCompleted = state.completedSteps.includes(currentStep.id);

  const handlePrimary = () => {
    if (isActionStep && !stepCompleted) {
      return;
    }
    if (isLastStep) {
      skip();
    } else {
      markStepCompleted(currentStep.id);
      next();
    }
  };

  const handleActionCompletion = () => {
    markStepCompleted(currentStep.id);
  };

  return (
    <>
      <Spotlight target={target} isVisible={isActive} />
      <StepPopover
        step={currentStep}
        isVisible={isActive}
        isMobile={isMobile}
        onNext={handlePrimary}
        onBack={back}
        onSkip={skip}
        onPrimaryAction={isActionStep ? handleActionCompletion : undefined}
        activeAction={isActionStep && !stepCompleted}
      />
    </>
  );
}
