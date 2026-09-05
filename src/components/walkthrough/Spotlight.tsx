"use client";

import { useEffect, useState } from "react";
import { resolveTarget } from "@/lib/walkthrough/engine/target-resolver";

interface SpotlightProps {
  target?: string | null;
  isVisible: boolean;
}

export default function Spotlight({ target, isVisible }: SpotlightProps) {
  const [metrics, setMetrics] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (!target || !isVisible) {
      setMetrics(null);
      return;
    }

    const update = () => {
      const m = resolveTarget(target);
      if (m) {
        setMetrics({
          top: m.top,
          left: m.left,
          width: m.width,
          height: m.height,
        });
      } else {
        setMetrics(null);
      }
    };

    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [target, isVisible]);

  if (!isVisible || !metrics) return null;

  const { top, left, width, height } = metrics;

  const spotlightStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: 9998,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    boxShadow: "inset 0 0 0 9999px rgba(0, 0, 0, 0.6)",
  };

  const spotlightRect: React.CSSProperties = {
    position: "fixed",
    top,
    left,
    width,
    height,
    borderRadius: "8px",
    pointerEvents: "none",
    zIndex: 9998,
    boxShadow:
      "0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 0 4px rgba(0, 168, 89, 0.6)",
    backgroundColor: "transparent",
  };

  return (
    <>
      <div style={spotlightStyle} aria-hidden="true" />
      <div style={spotlightRect} aria-hidden="true" />
    </>
  );
}
