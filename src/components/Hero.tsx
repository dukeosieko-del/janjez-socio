"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-kenya-black py-20 lg:py-32">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--kenya-green)_0%,_transparent_50%)] opacity-10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--kenya-red)_0%,_transparent_50%)] opacity-10"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-kenya-green/10 border border-kenya-green/30 rounded-full px-4 py-2 mb-8">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-kenya-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-kenya-green"></span>
            </span>
            <span className="text-kenya-green text-sm font-semibold">
              Kenya&apos;s Plug for Instant Social Clout
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="text-kenya-white">janjez</span>
            <span className="text-kenya-green">.social</span>
          </h1>

          <p className="text-xl sm:text-2xl text-kenya-white/70 mb-4 max-w-3xl mx-auto leading-relaxed">
            Pata clout chapchap — Lipa na M-Pesa.
          </p>

          <p className="text-base sm:text-lg text-kenya-white/50 mb-10 max-w-2xl mx-auto">
            Automated SMM panel for YouTube, WhatsApp, Instagram, Facebook, TikTok,
            Telegram, Google Maps, and X (Twitter). Instant delivery, drop-free
            guarantee, 24/7 support.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/order"
              className="group inline-flex items-center gap-3 bg-kenya-green text-kenya-black font-bold text-lg px-8 py-4 rounded-xl hover:bg-kenya-green/90 transition-all hover:scale-105 shadow-lg shadow-kenya-green/20"
            >
              🛒 Start New Order
              <svg
                className="h-5 w-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
            <Link
              href="/order?mode=anonymous"
              className="inline-flex items-center gap-3 bg-transparent text-kenya-white font-bold text-lg px-8 py-4 rounded-xl border-2 border-kenya-white/30 hover:border-kenya-white hover:bg-kenya-white/5 transition-all hover:scale-105"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.292-4.292M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Order Anonymously
            </Link>
            <Link
              href="/pay"
              className="inline-flex items-center gap-3 bg-kenya-white/10 text-kenya-white font-bold text-lg px-8 py-4 rounded-xl border border-kenya-white/20 hover:bg-kenya-white/20 transition-all hover:scale-105"
            >
              💳 Top Up via M-Pesa
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-kenya-white/40 text-sm">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-kenya-green" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Instant Delivery
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-kenya-green" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Drop-Free Guarantee
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-kenya-green" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              24/7 Support
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
