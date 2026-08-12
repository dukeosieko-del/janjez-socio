"use client";

import { useState, useEffect } from "react";

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex items-center gap-2 bg-kenya-black/80 border border-kenya-red rounded-lg px-4 py-2">
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-kenya-red opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-kenya-red"></span>
      </span>
      <span className="text-kenya-red font-bold text-sm uppercase tracking-wider">
        Happy Hour
      </span>
      <span className="text-kenya-white font-mono text-lg font-bold">
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}
