"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const handled = useRef(false);

  const next = searchParams.get("next") || "/services";
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error_description") || searchParams.get("error");

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const supabase = createClient();
    if (!supabase) {
      queueMicrotask(() => setError("Authentication service is temporarily unavailable."));
      return;
    }

    if (errorParam) {
      queueMicrotask(() => setError(errorParam));
      return;
    }

    if (!code) {
      queueMicrotask(() => router.replace("/auth/sign-in?error=missing_code"));
      return;
    }

    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error: exchangeError }) => {
        if (exchangeError) {
          console.error("[auth/callback] exchange failed:", exchangeError.message);
          setError(exchangeError.message);
          return;
        }
        router.replace(next);
      })
      .catch((err) => {
        console.error("[auth/callback] exchange threw:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      });
  }, [router, searchParams, next, code, errorParam]);

  if (error) {
    const backHref = next && next !== "/services"
      ? `/auth/sign-in?next=${encodeURIComponent(next)}`
      : "/auth/sign-in";
    return (
      <div className="min-h-screen flex items-center justify-center bg-kenya-black text-kenya-white px-4">
        <div className="max-w-md w-full bg-kenya-white/5 border border-kenya-red/30 rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold text-kenya-red mb-2">Sign-in failed</h1>
          <p className="text-kenya-white/70 mb-6 break-words">{error}</p>
          <a
            href={backHref}
            className="inline-block bg-kenya-green text-kenya-black font-bold px-6 py-3 rounded-xl hover:bg-kenya-green/90 transition-colors"
          >
            Back to sign-in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-kenya-black text-kenya-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-kenya-green mx-auto mb-4" />
        <p>Completing sign-in…</p>
      </div>
    </div>
  );
}
