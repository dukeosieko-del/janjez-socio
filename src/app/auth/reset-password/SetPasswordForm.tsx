"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { fetchJSON } from "@/lib/client/fetchWithTimeout";

export default function SetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await fetchJSON("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      setSuccess(true);
      setTimeout(() => router.push("/auth/sign-in"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-kenya-red/10 border border-kenya-red/30 rounded-xl p-4">
          <p className="text-kenya-red text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-kenya-green/10 border border-kenya-green/30 rounded-xl p-4">
          <p className="text-kenya-green text-sm">Password updated! Redirecting to sign in…</p>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-kenya-white/70 mb-2">New Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter new password (min 6 characters)"
          className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-kenya-white/70 mb-2">Confirm Password</label>
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-kenya-green text-kenya-black font-bold text-lg py-4 rounded-xl hover:bg-kenya-green/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? "Updating…" : "Set New Password"}
      </button>
    </form>
  );
}
