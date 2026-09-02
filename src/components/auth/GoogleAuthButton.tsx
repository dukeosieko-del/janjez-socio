"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthContext";

export default function GoogleAuthButton() {
  const [loading, setLoading] = useState(false);
  const { signInWithOAuth, supabaseError } = useAuth();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signInWithOAuth("google");
    setLoading(false);
  };

  if (supabaseError) return null;

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 bg-kenya-white/10 border border-kenya-white/20 text-kenya-white font-medium py-3 rounded-xl hover:bg-kenya-white/15 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg className="w-5 h-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.67 1.22 9.14 3.6l6.84-6.84C35.9 2.38 30.47 0 24 0 14.37 0 6.27 5.67 2.38 13.55l7.92 6.16C12.07 13.66 17.5 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.1 24.5c0-1.73-.17-3.4-.48-5.04H24v9.5h12.42c-.54 2.47-2.15 4.57-4.47 6.07l7.18 5.58C43.6 41.4 46.1 34.7 46.1 24.5z" />
        <path fill="#FBBC05" d="M10.3 28.72L2.37 34.88C5.65 42.32 14.2 47.5 24 47.5c5.9 0 10.97-2.12 15.15-5.68l-7.18-5.58c-2.02 1.35-4.48 2.16-7.05 2.16-5.38 0-9.94-3.42-11.53-8.02l-7.1-5.56z" />
        <path fill="#34A853" d="M24 47.5c5.27 0 10.05-1.41 14.12-3.75l-7.18-5.58c-2.1 1.4-4.77 2.23-7.64 2.23-5.85 0-10.78-3.7-12.76-8.75l-.01.02C5.6 36.26 9.24 30.32 14.7 26.75L10.3 28.72z" />
      </svg>
      {loading ? "Signing in..." : "Continue with Google"}
    </button>
  );
}
