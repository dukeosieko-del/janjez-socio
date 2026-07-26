"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";

export default function SignUpForm({ onSuccess }: { onSuccess?: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { customSignUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const { error, message } = await customSignUp(email, password);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(message || "Account created! Check your email to verify.");
      setLoading(false);
      setTimeout(() => router.push("/auth/sign-in"), 2500);
    }
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
          <p className="text-kenya-green text-sm">{success}</p>
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
      <div>
        <label className="block text-sm font-medium text-kenya-white/70 mb-2">Confirm Password</label>
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all"
          placeholder="••••••••"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-kenya-green text-kenya-black font-bold text-lg py-4 rounded-xl hover:bg-kenya-green/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? "Creating account..." : "Sign Up"}
      </button>
    </form>
  );
}
