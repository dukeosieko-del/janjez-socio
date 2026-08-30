"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";

export default function DashboardPage() {
  const { user, loading, signOut, walletBalance, refreshProfile } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/sign-in");
    }
  }, [user, loading, router]);

  const handleRefreshBalance = async () => {
    setRefreshing(true);
    await refreshProfile();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kenya-black text-kenya-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-kenya-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-kenya-white/60">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-kenya-black">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <AnnouncementBanner />
        <LiveTicker />
        <Header />
        <main className="flex-1">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-2">Dashboard</h1>
              <p className="text-kenya-white/60">
                Welcome back, {user.user_metadata?.full_name || user.email}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-kenya-green/10 border border-kenya-green/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-kenya-green/20 rounded-xl flex items-center justify-center">
                    <span className="text-xl">💰</span>
                  </div>
                  <div>
                    <p className="text-kenya-white/70 text-sm">Wallet Balance</p>
                    <p className="text-2xl font-bold text-kenya-green">
                      KES {Number(walletBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <Link
                  href="/pay"
                  className="inline-flex items-center gap-2 bg-kenya-green text-kenya-black font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-kenya-green/90 transition-colors"
                >
                  <Image src="/mpesa-logo.png" alt="M-Pesa" width={18} height={18} className="w-5 h-5 object-contain" />
                  Top Up via M-Pesa
                </Link>
              </div>

              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-kenya-white/10 rounded-xl flex items-center justify-center">
                    <span className="text-xl">📦</span>
                  </div>
                  <div>
                    <p className="text-kenya-white/70 text-sm">Orders</p>
                    <p className="text-2xl font-bold text-kenya-white">—</p>
                  </div>
                </div>
                <Link href="/orders/all" className="inline-flex items-center gap-2 bg-kenya-white/10 text-kenya-white font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-kenya-white/20 transition-colors border border-kenya-white/10">
                  View Orders
                </Link>
              </div>

              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-kenya-white/10 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🎯</span>
                  </div>
                  <div>
                    <p className="text-kenya-white/70 text-sm">Status</p>
                    <p className="text-lg font-bold text-kenya-white">
                      {user.email_confirmed_at ? "Verified" : "Unverified"}
                    </p>
                  </div>
                </div>
                <p className="text-kenya-white/50 text-xs">
                  {user.email_confirmed_at
                    ? "Your account is active and verified."
                    : "Please verify your email to unlock all features."}
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                <h2 className="text-kenya-white font-bold text-lg mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-3">
                  <Link href="/services" className="inline-flex items-center gap-2 bg-kenya-green text-kenya-black font-bold text-sm px-6 py-3 rounded-xl hover:bg-kenya-green/90 transition-colors">
                    🛒 New Order
                  </Link>
                  <Link href="/orders/all" className="inline-flex items-center gap-2 bg-kenya-white/10 text-kenya-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-kenya-white/20 transition-colors border border-kenya-white/10">
                    📦 My Orders
                  </Link>
                  <button onClick={handleRefreshBalance} disabled={refreshing} className="inline-flex items-center gap-2 bg-kenya-white/10 text-kenya-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-kenya-white/20 transition-colors border border-kenya-white/10 disabled:opacity-50">
                    🔄 Refresh Balance
                  </button>
                  <button onClick={signOut} className="inline-flex items-center gap-2 bg-kenya-red/10 text-kenya-red font-bold text-sm px-6 py-3 rounded-xl hover:bg-kenya-red/20 transition-colors border border-kenya-red/20">
                    Sign Out
                  </button>
                </div>
              </div>

              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
                <h2 className="text-kenya-white font-bold text-lg mb-4">Account Information</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-kenya-white/60">Email</span>
                    <span className="text-kenya-white font-medium">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-kenya-white/60">Email Verified</span>
                    <span className={`font-medium ${user.email_confirmed_at ? "text-kenya-green" : "text-kenya-red"}`}>
                      {user.email_confirmed_at ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-kenya-white/60">Account Created</span>
                    <span className="text-kenya-white font-medium">{new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
