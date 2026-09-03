import type { WalkthroughEvent } from "../types";

type WalkthrougEventListener = (event: WalkthroughEvent) => void;

let listeners: WalkthrougEventListener[] = [];

export function emitWalkthroughEvent(event: WalkthroughEvent): void {
  listeners.forEach((l) => {
    try {
      l(event);
    } catch {
    }
  });
}

export function onWalkthroughEvent(listener: WalkthrougEventListener): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}
