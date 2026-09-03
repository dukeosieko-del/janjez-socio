"use client";

import { useState, useEffect } from "react";
import { X } from "./icons";

interface PopupOfferProps {
  trigger?: string;
  title: string;
  description: string;
  offerLabel?: string;
  offerHref?: string;
  storageKey: string;
  delayMs?: number;
  showOnce?: boolean;
  bgClass?: string;
}

export default function PopupOffer({
  trigger = "open-blog-popup",
  title,
  description,
  offerLabel = "Claim Offer",
  offerHref = "/services",
  storageKey,
  delayMs = 5000,
  showOnce = true,
  bgClass = "bg-gradient-to-r from-kenya-green/20 to-kenya-green/5",
}: PopupOfferProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (showOnce) {
      const dismissed = sessionStorage.getItem(storageKey);
      if (dismissed === "true") return;
    }

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, delayMs);

    const handleTrigger = () => setIsOpen(true);
    window.addEventListener(trigger, handleTrigger);

    return () => {
      clearTimeout(timer);
      window.removeEventListener(trigger, handleTrigger);
    };
  }, [trigger, delayMs, showOnce, storageKey]);

  const handleDismiss = () => {
    setIsOpen(false);
    if (showOnce) {
      sessionStorage.setItem(storageKey, "true");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full mx-4">
      <div className={`${bgClass} border border-kenya-green/30 rounded-2xl p-6 shadow-2xl shadow-kenya-green/20 relative animate-fade-in-up`}>
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-kenya-white/50 hover:text-kenya-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-kenya-green/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🔥</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-kenya-white mb-1">{title}</h3>
            <p className="text-sm text-kenya-white/70 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <a
            href={offerHref}
            className="flex-1 bg-kenya-green text-kenya-black font-bold text-sm py-2 px-4 rounded-lg hover:bg-kenya-green/90 transition-colors text-center"
          >
            {offerLabel}
          </a>
          <button
            onClick={handleDismiss}
            className="flex-1 bg-kenya-white/10 text-kenya-white text-sm py-2 px-4 rounded-lg hover:bg-kenya-white/20 transition-colors"
          >
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}
