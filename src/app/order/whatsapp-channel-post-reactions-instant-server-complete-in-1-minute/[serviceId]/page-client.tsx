"use client";

import { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/components/AuthContext";
import { getServiceById } from "@/lib/data";
import Link from "next/link";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import MpesaModal from "@/components/MpesaModal";

const DEMO_WALLET_BALANCE = 5000; // KES
const HAPPY_HOUR_DISCOUNT = 0.95; // -5%

interface FulfillmentClientProps {
  serviceId: string;
}

export default function FulfillmentClient({ serviceId }: FulfillmentClientProps) {
  const { openAuth } = useAuth();
  const service = useMemo(() => getServiceById(serviceId), [serviceId]);

  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);


  const [mpesaOpen, setMpesaOpen] = useState(false);
  const [walletBalance] = useState(DEMO_WALLET_BALANCE);

  const quantityNum = useMemo(() => {
    const num = parseInt(quantity, 10);
    return isNaN(num) ? 0 : num;
  }, [quantity]);

  const subtotal = useMemo(() => {
    if (!service || quantityNum <= 0) return 0;
    return service.rate * quantityNum;
  }, [service, quantityNum]);

  const total = useMemo(() => {
    if (subtotal <= 0) return 0;
    return subtotal * HAPPY_HOUR_DISCOUNT;
  }, [subtotal]);

  const savings = useMemo(() => {
    return subtotal - total;
  }, [subtotal, total]);

  const quantityError = useMemo(() => {
    if (!service || quantityNum <= 0) return "";
    if (quantityNum < service.min) return `Minimum quantity is ${service.min.toLocaleString()}`;
    if (quantityNum > service.max) return `Maximum quantity is ${service.max.toLocaleString()}`;
    return "";
  }, [service, quantityNum]);

  const handlePlaceOrder = useCallback(() => {
    if (!service || !link || quantityNum <= 0 || quantityError) return;

    if (total > walletBalance) {
      setMpesaOpen(true);
      return;
    }

    if (isAnonymous) {
      alert("Order placed anonymously! (demo)");
      return;
    }
    openAuth("login");
  }, [service, link, quantityNum, quantityError, total, walletBalance, isAnonymous]);

  const isValid =
    service &&
    link.trim().length > 0 &&
    quantityNum >= service.min &&
    quantityNum <= service.max;

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kenya-black text-kenya-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Service Not Found</h1>
          <p className="text-kenya-white/60">The requested service could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-kenya-black">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <AnnouncementBanner />
        <LiveTicker />
        <Header />

        <main className="flex-1">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-kenya-white/50 mb-6">
              <Link href="/order" className="hover:text-kenya-green transition-colors">New Order</Link>
              <span>/</span>
              <Link href="/order/whatsapp-channel-post-reactions-instant-server-complete-in-1-minute" className="hover:text-kenya-green transition-colors">WhatsApp Channel Post Reactions</Link>
              <span>/</span>
              <span className="text-kenya-green font-medium">#{service.serviceId}</span>
            </nav>

            {/* Service Header */}
            <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6 sm:p-8 mb-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-kenya-green/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🚀</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-kenya-white">{service.name}</h1>
                  </div>
                  <p className="text-kenya-white/60 text-sm sm:text-base">{service.description}</p>
                </div>
              </div>

              {/* Service Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-kenya-black/40 rounded-xl p-4 border border-kenya-white/5">
                  <span className="text-kenya-white/40 text-xs uppercase tracking-wider block mb-1">Min / Max</span>
                  <p className="text-kenya-white font-bold text-sm">{service.min.toLocaleString()} / {service.max.toLocaleString()}</p>
                </div>
                <div className="bg-kenya-black/40 rounded-xl p-4 border border-kenya-white/5">
                  <span className="text-kenya-white/40 text-xs uppercase tracking-wider block mb-1">Speed</span>
                  <p className="text-kenya-white font-bold text-sm">{service.speed || "Standard"}</p>
                </div>
                <div className="bg-kenya-black/40 rounded-xl p-4 border border-kenya-white/5">
                  <span className="text-kenya-white/40 text-xs uppercase tracking-wider block mb-1">Base Rate</span>
                  <p className="text-kenya-white font-bold text-sm">KES {service.rate.toFixed(4)}</p>
                </div>
                <div className="bg-kenya-black/40 rounded-xl p-4 border border-kenya-green/30">
                  <span className="text-kenya-green text-xs uppercase tracking-wider block mb-1">Final Rate</span>
                  <p className="text-kenya-green font-bold text-lg">KES {(service.rate * HAPPY_HOUR_DISCOUNT).toFixed(4)}</p>
                </div>
              </div>

              {/* Refill Badge */}
              {service.refill !== "No refill" && (
                <div className="inline-flex items-center gap-2 bg-kenya-green/20 text-kenya-green text-sm font-semibold px-4 py-2 rounded-xl border border-kenya-green/30">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  {service.refill}
                </div>
              )}
            </div>

            {/* Important Requirements */}
            {service.notice && (
              <div className="bg-kenya-red/10 border border-kenya-red/30 rounded-2xl p-6 mb-6 flex items-start gap-4">
                <div className="w-10 h-10 bg-kenya-red/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="h-6 w-6 text-kenya-red" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-kenya-white font-semibold mb-1">Important Requirements</h3>
                  <p className="text-kenya-white/70 text-sm leading-relaxed">{service.notice}</p>
                </div>
              </div>
            )}

            {/* Order Form */}
            <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6 sm:p-8 mb-6">
              <h2 className="text-xl font-bold text-kenya-white mb-6">Complete Your Order</h2>

              <div className="space-y-6">
                {/* Link Input */}
                <div>
                  <label className="block text-sm font-medium text-kenya-white/70 mb-2">
                    🔗 WhatsApp Channel Post Link
                  </label>
                  <input
                    type="url"
                    required
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://whatsapp.com/channel/... or direct message link"
                    className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-3.5 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all"
                  />
                  <p className="text-kenya-white/40 text-xs mt-2">Ensure the target WhatsApp channel post link is direct, public, and accessible</p>
                </div>

                {/* Quantity Input */}
                <div>
                  <label className="block text-sm font-medium text-kenya-white/70 mb-2">
                    🔢 Quantity
                  </label>
                  <input
                    type="number"
                    required
                    min={service.min}
                    max={service.max}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder={`Enter quantity (${service.min.toLocaleString()} - ${service.max.toLocaleString()})`}
                    className={`w-full bg-kenya-black border rounded-xl px-4 py-3.5 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:ring-1 transition-all ${
                      quantityError
                        ? "border-kenya-red focus:border-kenya-red focus:ring-kenya-red"
                        : "border-kenya-white/20 focus:border-kenya-green focus:ring-kenya-green"
                    }`}
                  />
                  {quantityError && (
                    <p className="text-kenya-red text-sm mt-2">{quantityError}</p>
                  )}
                  {!quantityError && quantityNum > 0 && (
                    <p className="text-kenya-green text-sm mt-2">
                      ✓ Valid quantity
                    </p>
                  )}
                </div>

                {/* Price Breakdown */}
                {quantityNum > 0 && !quantityError && (
                  <div className="bg-kenya-black/60 rounded-xl p-5 border border-kenya-white/10 space-y-3">
                    <h3 className="text-kenya-white font-semibold text-sm uppercase tracking-wider mb-3">Price Breakdown</h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-kenya-white/60">Quantity</span>
                      <span className="text-kenya-white font-medium">{quantityNum.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-kenya-white/60">Unit Rate</span>
                      <span className="text-kenya-white font-medium">KES {service.rate.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-kenya-white/60">Subtotal</span>
                      <span className="text-kenya-white font-medium">KES {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-kenya-green">Happy Hour Discount (-5%)</span>
                      <span className="text-kenya-green font-medium">- KES {savings.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-kenya-white/10 pt-3 flex items-center justify-between">
                      <span className="text-kenya-white font-semibold">Total Charge</span>
                      <span className="text-kenya-green font-bold text-xl">KES {total.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Insufficient balance warning */}
                {total > walletBalance && total > 0 && (
                  <div className="bg-kenya-red/10 border border-kenya-red/30 rounded-xl p-4 flex items-center gap-3">
                    <svg className="h-5 w-5 text-kenya-red flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-kenya-white/80 text-sm">
                      Insufficient wallet balance (KES {walletBalance.toLocaleString()}). Click &quot;Place Order&quot; to top up via M-Pesa.
                    </p>
                  </div>
                )}

                {/* Anonymous toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 rounded border-kenya-white/20 bg-kenya-black text-kenya-green focus:ring-kenya-green"
                  />
                  <label htmlFor="anonymous" className="text-sm text-kenya-white/70 cursor-pointer">
                    Place order anonymously (no account required)
                  </label>
                </div>

                {/* Submit */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={!isValid}
                  className="w-full bg-kenya-green text-kenya-black font-bold text-lg py-4 rounded-xl hover:bg-kenya-green/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-kenya-green flex items-center justify-center gap-2"
                >
                  🛒 Place Order — KES {total > 0 ? total.toFixed(2) : "0.00"}
                </button>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div><MpesaModal isOpen={mpesaOpen} onClose={() => setMpesaOpen(false)} />
    </div>
  );
}
