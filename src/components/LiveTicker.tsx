"use client";

import { TICKER_ITEMS } from "@/lib/data";

export default function LiveTicker() {
  return (
    <div className="w-full bg-kenya-black/90 border-y border-kenya-green/30 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap py-2">
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span
            key={i}
            className="mx-8 text-sm text-kenya-green flex items-center gap-2"
          >
            <span className="inline-block w-2 h-2 bg-kenya-green rounded-full animate-pulse"></span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
