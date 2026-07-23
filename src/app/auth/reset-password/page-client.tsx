"use client";

import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";

export default function ResetPasswordClient() {
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
              <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-2">Reset Password</h1>
              <p className="text-kenya-white/60">Enter your email and we&apos;ll send you a reset link</p>
            </div>
            {supabaseError && (
              <div className="bg-kenya-red/10 border border-kenya-red/30 rounded-2xl p-6 sm:p-8 mb-6">
                <p className="text-kenya-red text-sm">{supabaseError}</p>
              </div>
            )}
            <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6 sm:p-8">
              <ResetPasswordForm />
              <div className="mt-6 text-center text-sm text-kenya-white/60">
                <p>
                  Remember your password?{" "}
                  <Link href="/auth/sign-in" className="text-kenya-green hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
