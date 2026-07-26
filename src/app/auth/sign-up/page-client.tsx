"use client";

import { useState } from "react";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import SignUpForm from "@/components/auth/SignUpForm";
import { useAuth } from "@/components/AuthContext";

export default function SignUpClient() {
  const [authModal, setAuthModal] = useState<{ open: boolean; tab: "login" | "register" }>({
    open: false,
    tab: "register",
  });
  const { supabaseError } = useAuth();

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
              <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-2">Create Account</h1>
              <p className="text-kenya-white/60">Join janjez.social and start growing</p>
            </div>
            {supabaseError && (
              <div className="bg-kenya-red/10 border border-kenya-red/30 rounded-2xl p-6 sm:p-8 mb-6">
                <p className="text-kenya-red text-sm">{supabaseError}</p>
              </div>
            )}
            <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6 sm:p-8">
              <SignUpForm />
              <div className="mt-6 text-center text-sm text-kenya-white/60">
                <p>
                  Already have an account?{" "}
                  <button onClick={() => setAuthModal({ open: true, tab: "login" })} className="text-kenya-green hover:underline">
                    Sign in
                  </button>
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
