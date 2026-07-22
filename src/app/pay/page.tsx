"use client";

import { useState } from "react";
import Image from "next/image";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import MpesaModal from "@/components/MpesaModal";

export default function AddFundsPage() {
  const [mpesaOpen, setMpesaOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-kenya-black">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <AnnouncementBanner />
        <LiveTicker />
        <Header />
        <main className="flex-1">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-4">Add Funds</h1>
              <p className="text-kenya-white/60 text-lg">Top up your wallet instantly with M-Pesa.</p>
            </div>
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6 sm:p-8 mb-6">
                <div className="grid gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Image src="/mpesa-logo.png" alt="M-Pesa" width={28} height={28} className="w-7 h-7 object-contain" />
                      <h2 className="text-kenya-white font-bold text-lg">M-Pesa Top-Up</h2>
                    </div>
                    <p className="text-kenya-white/70 text-sm leading-relaxed mb-4">Add funds directly to your janjez.social wallet using M-Pesa. Instant credit after successful payment.</p>
                    <button
                      onClick={() => setMpesaOpen(true)}
                      className="inline-flex items-center gap-2 bg-kenya-green text-kenya-black font-bold text-sm px-6 py-3 rounded-xl hover:bg-kenya-green/90 transition-colors"
                    >
                      <Image src="/mpesa-logo.png" alt="M-Pesa" width={20} height={20} className="w-5 h-5 object-contain" />
                      Top Up via M-Pesa
                    </button>
                  </div>
                <div className="bg-kenya-black/40 rounded-xl p-5 border border-kenya-white/5">
                  <h3 className="text-kenya-white font-semibold text-sm uppercase tracking-wider mb-3">How it works</h3>
                  <ol className="list-decimal list-inside text-kenya-white/70 text-sm space-y-2">
                    <li>Click &quot;Top Up via M-Pesa&quot; above.</li>
                    <li>Enter your M-Pesa registered phone number.</li>
                    <li>Choose the amount you want to add.</li>
                    <li>Complete the payment on your phone.</li>
                    <li>Funds reflect in your wallet instantly.</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
      <MpesaModal isOpen={mpesaOpen} onClose={() => setMpesaOpen(false)} />
    </div>
  );
}
