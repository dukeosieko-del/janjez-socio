"use client";

export function ServiceWorkerRegistrar() {
  if (typeof window === "undefined") return null;

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  }

  return null;
}
