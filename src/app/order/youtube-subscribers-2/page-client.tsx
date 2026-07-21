"use client";

import { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";
import { ORDER_SERVICES, getServicesByCategory } from "@/lib/data";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import MpesaModal from "@/components/MpesaModal";

const YOUTUBE_SUBS_CATEGORY = "youtube-subscribers-2";
const DEMO_WALLET_BALANCE = 5000; // KES

export default function YouTubeSubscribersClient() {
  const { openAuth } = useAuth();
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);


  const [mpesaOpen, setMpesaOpen] = useState(false);
  const [walletBalance] = useState(DEMO_WALLET_BALANCE);

  const subscriberServices = useMemo(() => getServicesByCategory(YOUTUBE_SUBS_CATEGORY), []);
  const selectedService = useMemo(() => ORDER_SERVICES.find((s) => s.id === selectedServiceId) || null, [selectedServiceId]);

  const quantityNum = useMemo(() => {
    const num = parseInt(quantity, 10);
    return isNaN(num) ? 0 : num;
  }, [quantity]);

  const subtotal = useMemo(() => {
    if (!selectedService || quantityNum <= 0) return 0;
    return selectedService.rate * quantityNum;
  }, [selectedService, quantityNum]);

  const total = useMemo(() => {
    if (subtotal <= 0) return 0;
    const discount = 0.95; // Happy Hour -5%
    return subtotal * discount;
  }, [subtotal]);

  const quantityError = useMemo(() => {
    if (!selectedService || quantityNum <= 0) return "";
    if (quantityNum < selectedService.min) return `Minimum quantity is ${selectedService.min}`;
    if (quantityNum > selectedService.max) return `Maximum quantity is ${selectedService.max.toLocaleString()}`;
    return "";
  }, [selectedService, quantityNum]);

  const handleServiceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedServiceId(e.target.value);
    setLink("");
    setQuantity("");
  }, []);

  const handlePlaceOrder = useCallback(() => {
    if (!selectedService || !link || quantityNum <= 0 || quantityError) return;

    // M-Pesa wallet balance guard
    if (total > walletBalance) {
      setMpesaOpen(true);
      return;
    }

    if (isAnonymous) {
      window.location.href = "/orders/all";
      return;
    }
    openAuth("login");
  }, [selectedService, link, quantityNum, quantityError, total, walletBalance, isAnonymous]);

  const isValid =
    selectedService &&
    link.trim().length > 0 &&
    quantityNum >= (selectedService?.min ?? 0) &&
    quantityNum <= (selectedService?.max ?? 0);

  return (
    <div className="min-h-screen flex bg-kenya-black">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <AnnouncementBanner />
        <LiveTicker />
        <Header />

        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Page Header */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">👥</span>
                <h1 className="text-4xl sm:text-5xl font-bold text-kenya-white">
                  YouTube Subscribers
                </h1>
              </div>
              <p className="text-kenya-white/60 text-lg max-w-2xl">
                Grow your YouTube channel with real, non-drop subscribers. Choose from non-drop, high-quality, or monetization-ready packages with refill guarantees.
              </p>
            </div>

            {/* Quick Order Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {subscriberServices.map((service) => (
                <Link
                  key={service.id}
                  href={`/order/youtube-subscribers-2/${service.id}`}
                  className="group bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-5 hover:border-kenya-green/50 transition-all duration-300 hover:transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">👥</span>
                    <h3 className="text-sm font-bold text-kenya-white group-hover:text-kenya-green transition-colors line-clamp-1">
                      {service.name}
                    </h3>
                  </div>
                  <p className="text-kenya-white/50 text-xs mb-3 line-clamp-2">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-kenya-green font-bold text-sm">KES {service.rate.toFixed(2)}</span>
                    <svg className="h-4 w-4 text-kenya-green opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>

            {/* Service Selection */}
            <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6 mb-6">
              <label className="block text-sm font-semibold text-kenya-white/70 mb-3 uppercase tracking-wider">
                Select YouTube Subscribers Service
              </label>
              <select
                value={selectedServiceId}
                onChange={handleServiceChange}
                className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-3 text-kenya-white focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all appearance-none cursor-pointer"
              >
                <option value="" className="bg-kenya-black text-kenya-white/50">
                  -- Choose a service --
                </option>
                {subscriberServices.map((service) => (
                  <option key={service.id} value={service.id} className="bg-kenya-black text-kenya-white">
                    {service.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Description */}
            {selectedService && (
              <div className="bg-kenya-green/10 border border-kenya-green/30 rounded-2xl p-6 mb-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-kenya-white">{selectedService.name}</h3>
                  <span className="bg-kenya-black/60 text-kenya-green text-xs font-mono px-3 py-1 rounded-lg border border-kenya-green/30">
                    #{selectedService.serviceId}
                  </span>
                </div>
                <p className="text-kenya-white/70 text-sm mb-4">{selectedService.description}</p>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="inline-flex items-center gap-1.5 bg-kenya-black/60 text-kenya-white text-xs px-3 py-1.5 rounded-lg border border-kenya-white/10">
                    ⚡ Rate: KES {selectedService.rate.toFixed(2)} / subscriber
                  </span>
                  {selectedService.refill !== "No refill" && (
                    <span className="inline-flex items-center gap-1.5 bg-kenya-green/20 text-kenya-green text-xs px-3 py-1.5 rounded-lg border border-kenya-green/30">
                      🔄 {selectedService.refill}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 bg-kenya-black/60 text-kenya-white/60 text-xs px-3 py-1.5 rounded-lg border border-kenya-white/10">
                    Min: {selectedService.min.toLocaleString()} | Max: {selectedService.max.toLocaleString()}
                  </span>
                </div>

                {/* Delivery Metrics */}
                <div className="bg-kenya-black/40 rounded-xl p-4 border border-kenya-white/5 mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <span className="text-kenya-white/40 text-xs uppercase tracking-wider">Delivery Speed</span>
                      <p className="text-kenya-white font-medium text-sm mt-1">{selectedService.speed || "Standard"}</p>
                    </div>
                    <div>
                      <span className="text-kenya-white/40 text-xs uppercase tracking-wider">Start Time</span>
                      <p className="text-kenya-white font-medium text-sm mt-1">{selectedService.startTime || "Instant"}</p>
                    </div>
                    <div>
                      <span className="text-kenya-white/40 text-xs uppercase tracking-wider">Refill Period</span>
                      <p className="text-kenya-white font-medium text-sm mt-1">{selectedService.refill}</p>
                    </div>
                  </div>
                </div>

                {/* Important Requirements */}
                {selectedService.notice && (
                  <div className="bg-kenya-red/10 border border-kenya-red/30 rounded-xl p-4 flex items-start gap-3">
                    <svg className="h-5 w-5 text-kenya-red mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-kenya-white/80 text-sm">{selectedService.notice}</p>
                  </div>
                )}
              </div>
            )}

            {/* Order Form */}
            {selectedService && (
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6 mb-6">
                <h3 className="text-lg font-bold text-kenya-white mb-5">Order Details</h3>

                <div className="space-y-5">
                  {/* Link Input */}
                  <div>
                    <label className="block text-sm font-medium text-kenya-white/70 mb-2">
                      🔗 Channel Link / Username
                    </label>
                    <input
                      type="url"
                      required
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="https://www.youtube.com/@channelname or channel URL"
                      className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all"
                    />
                  </div>

                  {/* Quantity Input */}
                  <div>
                    <label className="block text-sm font-medium text-kenya-white/70 mb-2">
                      🔢 Quantity
                    </label>
                    <input
                      type="number"
                      required
                      min={selectedService.min}
                      max={selectedService.max}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder={`Enter quantity (${selectedService.min} - ${selectedService.max.toLocaleString()})`}
                      className={`w-full bg-kenya-black border rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:ring-1 transition-all ${
                        quantityError
                          ? "border-kenya-red focus:border-kenya-red focus:ring-kenya-red"
                          : "border-kenya-white/20 focus:border-kenya-green focus:ring-kenya-green"
                      }`}
                    />
                    {quantityError && (
                      <p className="text-kenya-red text-sm mt-2">{quantityError}</p>
                    )}
                  </div>

                  {/* Total Charge */}
                  <div className="flex items-center justify-between bg-kenya-black/60 rounded-xl px-5 py-4 border border-kenya-white/10">
                    <div>
                      <span className="text-kenya-white/70 font-medium block">Total Charge</span>
                      <span className="text-kenya-white/40 text-xs">Wallet balance: KES {walletBalance.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {total > 0 && (
                        <span className="text-xs bg-kenya-red text-white font-bold px-2 py-0.5 rounded">
                          -5% Happy Hour
                        </span>
                      )}
                      <span className="text-2xl font-bold text-kenya-green">
                        KES {total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Insufficient balance warning */}
                  {total > walletBalance && total > 0 && (
                    <div className="bg-kenya-red/10 border border-kenya-red/30 rounded-xl p-4 flex items-center gap-3">
                      <svg className="h-5 w-5 text-kenya-red flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p className="text-kenya-white/80 text-sm">
                        Insufficient wallet balance. Click &quot;Place Order&quot; to top up via M-Pesa.
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
                    🛒 Place Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div><MpesaModal isOpen={mpesaOpen} onClose={() => setMpesaOpen(false)} />
    </div>
  );
}
