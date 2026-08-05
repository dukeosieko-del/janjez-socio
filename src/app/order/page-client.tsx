"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import OrderForm from "@/components/OrderForm";
import MpesaModal from "@/components/MpesaModal";
import { useAuth } from "@/components/AuthContext";

export default function OrderPageClient() {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("service");
  const categoryId = searchParams.get("category");
  const anonymous = searchParams.get("mode") === "anonymous";
  const { openAuth } = useAuth();
  const [mpesaOpen, setMpesaOpen] = useState(false);

  const handleRequireAuth = (tab: "login" | "register" = "login") => {
    openAuth(tab);
  };

  const handleInsufficientBalance = () => {
    setMpesaOpen(true);
  };

  return (
    <div className="min-h-screen flex bg-kenya-black">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <AnnouncementBanner />
        <LiveTicker />
        <Header />

        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-10">
              <h1 className="text-4xl sm:text-5xl font-bold text-kenya-white mb-3">
                New Order
              </h1>
              <p className="text-kenya-white/60 text-lg max-w-2xl">
                Select a category and service, enter your details, and place your order.
                Instant delivery guaranteed.
              </p>
            </div>

            <OrderForm onRequireAuth={handleRequireAuth} onInsufficientBalance={handleInsufficientBalance} serviceId={serviceId} categoryId={categoryId} defaultAnonymous={anonymous} />
          </div>
        </main>

        <Footer />
      </div>
      <MpesaModal isOpen={mpesaOpen} onClose={() => setMpesaOpen(false)} />
    </div>
  );
}
