"use client";

import { useState } from "react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
}

export default function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "register">(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(tab === "login" ? "Sign in triggered (demo)" : "Registration triggered (demo)");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-kenya-black border border-kenya-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Tabs */}
        <div className="flex border-b border-kenya-white/10">
          <button
            onClick={() => setTab("login")}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${
              tab === "login"
                ? "text-kenya-green border-b-2 border-kenya-green"
                : "text-kenya-white/50 hover:text-kenya-white"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab("register")}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${
              tab === "register"
                ? "text-kenya-green border-b-2 border-kenya-green"
                : "text-kenya-white/50 hover:text-kenya-white"
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-kenya-white/70 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-kenya-white/70 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all"
            />
          </div>

          {tab === "register" && (
            <div>
              <label className="block text-sm font-medium text-kenya-white/70 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                required={tab === "register"}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07XXXXXXXX or 01XXXXXXXX"
                className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-kenya-green text-kenya-black font-bold text-lg py-3.5 rounded-xl hover:bg-kenya-green/90 transition-colors"
          >
            {tab === "login" ? "Sign In" : "Create Account"}
          </button>

          <p className="text-center text-xs text-kenya-white/40">
            {tab === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              type="button"
              onClick={() => setTab(tab === "login" ? "register" : "login")}
              className="text-kenya-green hover:underline"
            >
              {tab === "login" ? "Register" : "Sign In"}
            </button>
          </p>
        </form>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-kenya-white/50 hover:text-kenya-white transition-colors"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
