"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-kenya-black p-4">
      <div className="max-w-md w-full bg-kenya-white/5 border border-kenya-red/30 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-kenya-red/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="h-8 w-8 text-kenya-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-kenya-white mb-2">Something went wrong</h2>
        <p className="text-kenya-white/60 text-sm mb-6">
          We encountered an unexpected error. Please try again or contact support if the problem persists.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 bg-kenya-green text-kenya-black font-bold text-sm px-6 py-3 rounded-xl hover:bg-kenya-green/90 transition-colors"
          >
            Try again
          </button>
          <a
            href="/contact-us"
            className="inline-flex items-center justify-center gap-2 bg-kenya-white/10 text-kenya-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-kenya-white/20 transition-colors border border-kenya-white/10"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}