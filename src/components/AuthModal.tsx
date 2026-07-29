"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/components/AuthContext";
import SignInForm from "@/components/auth/SignInForm";
import SignUpForm from "@/components/auth/SignUpForm";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
}

type ModalTab = "login" | "register" | "forgot-password";

export default function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const [tab, setTab] = useState<ModalTab>(defaultTab);
  const { user, supabaseError } = useAuth();

  useEffect(() => {
    if (user && isOpen) {
      onClose();
    }
  }, [user, isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop:blur-sm p-4">
      <div className="bg-kenya-black border border-kenya-white/10 rounded-2xl w-full max-w-md shadow-2xl relative">
        {supabaseError && (
          <div className="p-4 border-b border-kenya-white/10">
            <div className="bg-kenya-red/10 border border-kenya-red/30 rounded-xl p-4">
              <p className="text-kenya-red text-sm">{supabaseError}</p>
            </div>
          </div>
        )}
        {tab !== "forgot-password" && (
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
        )}

        <div className="p-6">
          {tab === "forgot-password" ? (
            <ResetPasswordForm onBackToSignIn={() => setTab("login")} />
          ) : tab === "login" ? (
            <SignInForm onSuccess={onClose} onForgotPassword={() => setTab("forgot-password")} />
          ) : (
            <SignUpForm onSuccess={onClose} />
          )}
          {tab === "forgot-password" ? (
            <p className="text-center text-xs text-kenya-white/40 mt-4">
              <button
                type="button"
                onClick={() => setTab("login")}
                className="text-kenya-green hover:underline"
              >
                Back to sign in
              </button>
            </p>
          ) : (
            <p className="text-center text-xs text-kenya-white/40 mt-4">
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
          )}
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-kenya-white/50 hover:text-kenya-white transition-colors"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>,
    document.body
  );
}
