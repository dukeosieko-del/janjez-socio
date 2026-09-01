"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

export default function SignUpForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { customSignUp } = useAuth();
  const router = useRouter();

  const handleUsernameChange = (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 30);
    setUsername(cleaned);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (username && (username.length < 3 || !/^[a-z0-9_]+$/.test(username))) {
      setError("Username must be 3-30 characters, lowercase letters, numbers, and underscores only");
      setLoading(false);
      return;
    }

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

    const { error, message } = await customSignUp(email, password, undefined, undefined, username || undefined);
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
    <>
      <GoogleAuthButton />
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-kenya-white/10"></div>
        </div>
        <div className="relative flex justify-center text-xs text-kenya-white/50">
          <span className="px-2 bg-kenya-black">OR SIGN UP WITH EMAIL</span>
        </div>
      </div>
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
        <label className="block text-sm font-medium text-kenya-white/70 mb-2">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => handleUsernameChange(e.target.value)}
          className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all"
          placeholder="your_username"
        />
        <p className="text-xs text-kenya-white/40 mt-1">3-30 chars, lowercase letters, numbers, underscores</p>
      </div>
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
    </>
  );
}
