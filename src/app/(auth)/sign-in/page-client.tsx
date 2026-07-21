"use client";

import { useState } from "react";
import Link from "next/link";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import SignInForm from "@/components/auth/SignInForm";

export default function SignInClient() {
  const [authModal, setAuthModal] = useState<{ open: boolean; tab: "login" | "register" }>({
    open: false,
    tab: "login",
  });

  return (
    <div className="min-h-screen flex bg-kenya-black">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <AnnouncementBanner />
        <LiveTicker />
        <Header />
        <main className="flex-1">
          <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-2">Sign In</h1>
              <p className="text-kenya-white/60">Welcome back to janjez.social</p>
            </div>
            <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6 sm:p-8">
              <SignInForm onSuccess={() => setAuthModal({ open: false, tab: "login" })} />
              <div className="mt-6 text-center text-sm text-kenya-white/60">
                <p>
                  Don&apos;t have an account?{" "}
                  <button onClick={() => setAuthModal({ open: true, tab: "register" })} className="text-kenya-green hover:underline">
                    Sign up
                  </button>
                </p>
                <p className="mt-2">
                  <Link href="/auth/reset-password" className="text-kenya-green hover:underline">
                    Forgot password?
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
      <AuthModal isOpen={authModal.open} onClose={() => setAuthModal({ open: false, tab: "login" })} defaultTab={authModal.tab} />
    </div>
  );
}
