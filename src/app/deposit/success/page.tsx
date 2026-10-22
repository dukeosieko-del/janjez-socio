"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/AuthContext";

/**
 * Salutation shown after a successful M-Pesa deposit.
 *
 * The headline is the agreed copy. Keep it in one place so it can be changed
 * without touching the layout.
 */
const SALUTATION_HEADLINE = "Congratulations on making your deposit!";

function DepositSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { walletBalance, refreshProfile, user, loading } = useAuth();

  const amount = Number(searchParams.get("amount")) || 0;
  const reference = searchParams.get("ref") || "";
  const kind = searchParams.get("type") === "order" ? "order" : "topup";
  const orderId = searchParams.get("order") || "";

  const [balance, setBalance] = useState<number | null>(null);
  const [reconciling, setReconciling] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function sync() {
      try {
        const session = await fetch("/api/mpesa/reconcile", { method: "POST" });
        if (session.ok) {
          const data = await session.json().catch(() => null);
          if (!cancelled && data?.reconciled?.length) {
            await refreshProfile();
          }
        }
      } catch {
        /* best effort — the balance is refreshed from the profile anyway */
      } finally {
        if (!cancelled) setReconciling(false);
      }
    }

    sync();
    return () => {
      cancelled = true;
    };
  }, [refreshProfile]);

  useEffect(() => {
    if (loading) return;
    if (walletBalance === null || walletBalance === undefined) return;
    setBalance(Number(walletBalance) || 0);
  }, [walletBalance, loading]);

  const orderTarget = kind === "order" && orderId ? `/orders/all?ref=${encodeURIComponent(orderId)}` : "/orders/all";

  return (
    <div className="min-h-screen flex bg-kenya-black">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <AnnouncementBanner />
        <LiveTicker />
        <Header />
        <main className="flex-1">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Image src="/mpesa-logo.png" alt="M-Pesa" width={48} height={48} className="w-12 h-12 object-contain" />
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-3">{SALUTATION_HEADLINE}</h1>

              {amount > 0 && (
                <p className="text-lg text-kenya-green font-semibold mb-2">
                  KES {amount.toLocaleString()}
                  {kind === "order" ? " received for your order" : " added to your wallet"}
                </p>
              )}

              {kind === "order" ? (
                <p className="text-kenya-white/70 mb-6">
                  Your order payment has been received and is now being processed for delivery.
                </p>
              ) : (
                <p className="text-kenya-white/70 mb-6">
                  Your funds are reflected on your dashboard balance
                  {balance !== null ? ` (KES ${balance.toLocaleString()})` : ""}.
                </p>
              )}

              {reference && (
                <p className="text-kenya-white/40 text-xs font-mono mb-6">
                  Reference: {reference}
                </p>
              )}

              {reconciling && (
                <p className="text-kenya-white/50 text-sm mb-6">Confirming your balance with M-Pesa…</p>
              )}

              <div className="grid gap-4 sm:grid-cols-2 mt-8">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 bg-kenya-green text-kenya-black font-bold px-6 py-4 rounded-xl hover:bg-kenya-green/90 transition-colors"
                >
                  View My Dashboard
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center gap-2 bg-kenya-white/5 border border-kenya-white/15 text-kenya-white font-bold px-6 py-4 rounded-xl hover:bg-kenya-white/10 transition-colors"
                >
                  Continue to Services
                </Link>
              </div>

              {kind === "order" && (
                <div className="mt-4">
                  <Link
                    href={orderTarget}
                    className="inline-flex items-center justify-center text-kenya-green hover:underline text-sm font-medium"
                  >
                    Track your order
                  </Link>
                </div>
              )}

              <p className="text-kenya-white/40 text-xs mt-10">
                Need help? <a href="mailto:support@janjez.social" className="text-kenya-green hover:underline">Contact support</a>
                {" · "}
                <Link href="/dashboard" className="text-kenya-green hover:underline">Go to dashboard</Link>
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default function DepositSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-kenya-black text-kenya-white">
          Loading…
        </div>
      }
    >
      <DepositSuccessContent />
    </Suspense>
  );
}
