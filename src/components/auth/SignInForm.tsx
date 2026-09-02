"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

export default function SignInForm({ onSuccess, onForgotPassword }: { onSuccess?: () => void; onForgotPassword?: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const safeNext = (() => {
    const raw = searchParams.get("next");
    if (!raw) return "/services";
    if (!raw.startsWith("/") || raw.startsWith("//")) return "/services";
    if (raw.startsWith("/auth/")) return "/services";
    return raw;
  })();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      onSuccess?.();
      router.push(safeNext);
    }
  };

  return (
    <>
      <GoogleAuthButton />
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-kenya-white/10"></div>
        </div>
        <div className="relative flex justify-center text-xs text-kenya-white/50">
          <span className="px-2 bg-kenya-black">OR SIGN IN WITH EMAIL</span>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
        <div className="bg-kenya-red/10 border border-kenya-red/30 rounded-xl p-4">
          <p className="text-kenya-red text-sm">{error}</p>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-kenya-white/70 mb-2">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-kenya-white/70 mb-2">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all"
          placeholder="••••••••"
        />
      </div>
      <div className="text-right">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-xs text-kenya-green hover:underline"
        >
          Forgot password?
        </button>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-kenya-green text-kenya-black font-bold text-lg py-4 rounded-xl hover:bg-kenya-green/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
      </form>
    </>
  );
}
