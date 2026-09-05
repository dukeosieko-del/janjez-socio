import { useRef, useEffect, useCallback } from "react";

export function useWalkthroughTarget(targetId?: string) {
  const ref = useRef<HTMLElement>(null);

  const setRef = useCallback(
    (node: HTMLElement | null) => {
      if (node) {
        ref.current = node;
        if (targetId) {
          node.setAttribute("data-walkthrough", targetId);
        }
      }
    },
    [targetId]
  );

  useEffect(() => {
    if (targetId && ref.current) {
      ref.current.setAttribute("data-walkthrough", targetId);
    }
  }, [targetId]);

  return setRef;
}

export function useWalkthroughHighlight(stepId?: string) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!stepId || !ref.current) return;
    const el = ref.current;
    el.setAttribute("data-walkthrough-target", stepId);

    return () => {
      el.removeAttribute("data-walkthrough-target");
    };
  }, [stepId]);

  return ref;
}
