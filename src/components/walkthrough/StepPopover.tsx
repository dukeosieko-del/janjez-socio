"use client";

import { useState, useEffect, useMemo } from "react";
import { resolveTarget } from "@/lib/walkthrough/engine/target-resolver";
import type { WalkthroughStep, StepPlacement } from "@/lib/walkthrough/types";

interface StepPopoverProps {
  step: WalkthroughStep;
  isVisible: boolean;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onPrimaryAction?: () => void;
  isMobile: boolean;
  activeAction?: boolean;
}

export default function StepPopover({
  step,
  isVisible,
  onNext,
  onBack,
  onSkip,
  onPrimaryAction,
  isMobile,
  activeAction,
}: StepPopoverProps) {
  const [targetMetrics, setTargetMetrics] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
    centerX: number;
    centerY: number;
  } | null>(null);

  useEffect(() => {
    if (!step.target || !isVisible) {
      setTargetMetrics(null);
      return;
    }
    const m = resolveTarget(step.target);
    if (m) {
      setTargetMetrics({
        top: m.top,
        left: m.left,
        width: m.width,
        height: m.height,
        centerX: m.centerX,
        centerY: m.centerY,
      });
    }

    const update = () => {
      const updated = resolveTarget(step.target!);
      if (updated) {
        setTargetMetrics({
          top: updated.top,
          left: updated.left,
          width: updated.width,
          height: updated.height,
          centerX: updated.centerX,
          centerY: updated.centerY,
        });
      }
    };

    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [step.target, isVisible]);

  const position = useMemo(() => {
    if (!targetMetrics || !isVisible) return null;

    if (isMobile || step.placement === "bottom-center") {
      return {
        position: "fixed" as const,
        bottom: 0,
        left: 0,
        right: 0,
        maxWidth: "100%",
        margin: "0 auto",
        zIndex: 10000,
      };
    }

    const { top, left, width, height, centerY, centerX } = targetMetrics;
    const popoverWidth = Math.min(360, Math.max(240, width * 1.2));
    const placement = step.placement || "bottom";

    const positions: Record<StepPlacement, React.CSSProperties> = {
      top: {
        position: "fixed",
        top: top - 12,
        left: left + width / 2 - popoverWidth / 2,
        width: popoverWidth,
        zIndex: 10000,
        transform: "translateY(-100%)",
      },
      bottom: {
        position: "fixed",
        top: top + height + 12,
        left: left + width / 2 - popoverWidth / 2,
        width: popoverWidth,
        zIndex: 10000,
      },
      left: {
        position: "fixed",
        top: centerY - 80,
        left: left - popoverWidth - 12,
        width: popoverWidth,
        zIndex: 10000,
        maxWidth: "90vw",
      },
      right: {
        position: "fixed",
        top: centerY - 80,
        left: left + width + 12,
        width: popoverWidth,
        zIndex: 10000,
        maxWidth: "90vw",
      },
      "bottom-center": {
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        width: "90%",
        maxWidth: 400,
        zIndex: 10000,
      },
      "top-center": {
        position: "fixed",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        width: "90%",
        maxWidth: 400,
        zIndex: 10000,
      },
    };

    const p = positions[placement] || positions.bottom;

    if (p.left !== undefined && typeof p.left === "number" && p.left < 20) {
      p.left = 20;
      if (p.transform?.includes("translateX(-50%)")) {
        p.transform = p.transform.replace("translateX(-50%)", "");
      }
    }

    return p;
  }, [targetMetrics, isVisible, isMobile, step.placement, step.target]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        ...position,
        maxWidth: isMobile ? "calc(100vw - 32px)" : undefined,
      }}
      className="bg-kenya-white dark:bg-kenya-black border border-kenya-white/20 dark:border-kenya-white/10 rounded-2xl shadow-2xl"
    >
      <div className="p-6">
        {step.title && (
          <h3 className="text-lg font-bold text-kenya-black dark:text-kenya-white mb-2">
            {step.title}
          </h3>
        )}
        <div className="text-kenya-black/70 dark:text-kenya-white/70 text-sm mb-4">
          {typeof step.description === "string" ? (
            <p>{step.description}</p>
          ) : (
            step.description
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="flex-1 px-3 py-2 text-sm text-kenya-white/60 hover:text-kenya-white transition-colors"
          >
            Back
          </button>
          <button
            onClick={onPrimaryAction ?? onNext}
            disabled={activeAction && !!onPrimaryAction}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeAction && onPrimaryAction
                ? "bg-kenya-green text-kenya-black disabled:opacity-50 disabled:cursor-not-allowed"
                : "bg-kenya-green text-kenya-black hover:bg-kenya-green/90"
            }`}
          >
            {step.nextBehaviour === "action" && onPrimaryAction
              ? "Mark Done"
              : step.actionExpectation === "click"
              ? "Got it"
              : "Next"}
          </button>
        </div>
        <div className="mt-3 text-center">
          <button
            onClick={onSkip}
            className="text-xs text-kenya-white/50 hover:text-kenya-white transition-colors"
          >
            Skip walkthrough
          </button>
        </div>
      </div>
    </div>
  );
}
