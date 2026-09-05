export interface TargetMetrics {
  top: number;
  left: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  rect: DOMRect;
}

export function resolveTarget(target: string): TargetMetrics | null {
  const selector = `[data-walkthrough="${target}"]`;
  const el = document.querySelector(selector);
  if (!el) return null;

  const rect = el.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    centerX: rect.left + rect.width / 2,
    centerY: rect.top + rect.height / 2,
    rect,
  };
}
