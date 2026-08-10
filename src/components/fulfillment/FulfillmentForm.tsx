"use client";

import Image from "next/image";
import { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/components/AuthContext";
import MpesaModal from "@/components/MpesaModal";
import { submitOrder } from "@/lib/order-log";

export interface FulfillmentProps {
  platformId: string;
  platformName: string;
  platformIcon: string;
  subcategoryName: string;
  deliverable?: { name: string; price: string; note?: string; flag?: string; minQty?: number; maxQty?: number };
  janjezService?: {
    id: string;
    name: string;
    selling_price_ksh: number;
    min_quantity: number;
    max_quantity: number;
    supports_drip_feed: boolean;
    supports_refill: boolean;
    supports_cancel: boolean;
  };
  onRequireAuth?: (tab?: "login" | "register") => void;
}

export default function FulfillmentForm({ platformId, platformName, platformIcon, subcategoryName, deliverable, janjezService, onRequireAuth }: FulfillmentProps) {
  const { user, walletBalance } = useAuth();
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [mpesaOpen, setMpesaOpen] = useState(false);
  const [dripFeedEnabled, setDripFeedEnabled] = useState(false);
  const [runs, setRuns] = useState("");
  const [interval, setInterval] = useState("");

  const useJanjez = !!janjezService;
  const servicePrice = useJanjez ? janjezService!.selling_price_ksh : parseFloat(deliverable?.price.replace(" Ksh", "") || "0");
  const qtyMin = useJanjez ? janjezService!.min_quantity : (deliverable?.minQty ?? 10);
  const qtyMax = useJanjez ? janjezService!.max_quantity : (deliverable?.maxQty ?? 10000);
  const serviceName = useJanjez ? janjezService!.name : (deliverable?.name || "");
  const supportsDripFeed = useJanjez ? janjezService!.supports_drip_feed : false;
  const serviceId = useJanjez ? janjezService!.id : (deliverable?.name || "");

  const quantityNum = useMemo(() => {
    const num = parseInt(quantity, 10);
    return Number.isNaN(num) ? 0 : num;
  }, [quantity]);

  const subtotal = useMemo(() => {
    if (!servicePrice || quantityNum <= 0) return 0;
    return servicePrice * quantityNum;
  }, [servicePrice, quantityNum]);

  const total = useMemo(() => {
    if (subtotal <= 0) return 0;
    return subtotal * 0.95;
  }, [subtotal]);

  const quantityError = useMemo(() => {
    if (quantityNum <= 0) return "";
    if (quantityNum < qtyMin) return `Minimum quantity is ${qtyMin.toLocaleString()}`;
    if (quantityNum > qtyMax) return `Maximum quantity is ${qtyMax.toLocaleString()}`;
    return "";
  }, [quantityNum, qtyMin, qtyMax]);

  const handlePlaceOrder = useCallback(async () => {
    if (!link.trim() || quantityNum <= 0 || quantityError) return;
    if (!user) {
      if (onRequireAuth) {
        onRequireAuth("login");
      } else {
        window.location.href = "/auth/sign-in";
      }
      return;
    }

    if (total > walletBalance) {
      setMpesaOpen(true);
      return;
    }

    setPlacing(true);
    setOrderError(null);
    setOrderSuccess(false);

    try {
      const quantitySource: "preset" | "custom" = /^\d+$/.test(quantity) ? "preset" : "custom";
      const result = await submitOrder({
        categoryId: platformId,
        serviceId: serviceName,
        quantity: quantityNum,
        link,
        amountPaid: total,
        quantitySource,
        selectedSkuId: serviceName,
        janjezServiceId: useJanjez ? serviceId : undefined,
        runs: (supportsDripFeed && dripFeedEnabled) ? (parseInt(runs, 10) || null) : null,
        interval: (supportsDripFeed && dripFeedEnabled) ? (parseInt(interval, 10) || null) : null,
      });

      if (!result.ok) {
        if (result.error?.includes("401") || result.error?.includes("Unauthorized")) {
          onRequireAuth?.("login");
        } else {
          setOrderError(result.error || "Failed to place order.");
        }
        setPlacing(false);
        return;
      }

      setOrderSuccess(true);
      setPlacing(false);
      setTimeout(() => {
        window.location.href = "/orders/all";
      }, 1500);
    } catch {
      setOrderError("Unexpected error while placing order.");
      setPlacing(false);
    }
  }, [link, quantityNum, quantityError, total, walletBalance, platformId, serviceName, useJanjez, serviceId, supportsDripFeed, dripFeedEnabled, runs, interval, user, onRequireAuth]);

  const isValid = link.trim().length > 0 && quantityNum >= qtyMin && quantityNum <= qtyMax;

  return (
    <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 flex items-center justify-center">
          <img src={platformIcon} alt={platformName} className="w-10 h-10 object-contain" />
        </div>
        <div>
          <p className="text-kenya-white/50 text-xs uppercase tracking-wider">{platformName}</p>
          <h3 className="text-kenya-white font-bold text-xl">{subcategoryName}</h3>
        </div>
      </div>

      {(janjezService?.supports_refill || janjezService?.supports_cancel) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {janjezService.supports_refill && (
            <span className="inline-flex items-center gap-1.5 bg-kenya-green/20 text-kenya-green text-xs px-3 py-1.5 rounded-lg border border-kenya-green/30">
              🔄 Refill supported
            </span>
          )}
          {janjezService.supports_cancel && (
            <span className="inline-flex items-center gap-1.5 bg-kenya-white/10 text-kenya-white text-xs px-3 py-1.5 rounded-lg border border-kenya-white/10">
              ❌ Cancel supported
            </span>
          )}
        </div>
      )}

      {deliverable?.flag && (
          <div className="bg-kenya-red/10 border border-kenya-red/30 rounded-xl p-3">
            <p className="text-kenya-red text-xs">{deliverable.flag}</p>
          </div>
        )}
        {deliverable?.note && (
          <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-xl p-3">
            <p className="text-kenya-white/50 text-xs italic">{deliverable.note}</p>
          </div>
        )}
        <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-kenya-white/70 mb-2">🔗 Link</label>
          <input
            type="text"
            required
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Profile, post, channel URL or phone number"
            className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-kenya-white/70 mb-2">🔢 Quantity</label>
          <input
            type="number"
            required
            min={qtyMin}
            max={qtyMax}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder={`Enter quantity (${qtyMin.toLocaleString()} - ${qtyMax.toLocaleString()})`}
            className={`w-full bg-kenya-black border rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:ring-1 transition-all ${
              quantityError ? "border-kenya-red focus:border-kenya-red focus:ring-kenya-red" : "border-kenya-white/20 focus:border-kenya-green focus:ring-kenya-green"
            }`}
          />
          {quantityError && <p className="text-kenya-red text-sm mt-2">{quantityError}</p>}
        </div>

        {supportsDripFeed && (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="drip-feed"
              checked={dripFeedEnabled}
              onChange={(e) => setDripFeedEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-kenya-white/20 bg-kenya-black text-kenya-green focus:ring-kenya-green"
            />
            <label htmlFor="drip-feed" className="text-sm text-kenya-white/70 cursor-pointer">
              Enable drip-feed (deliver over time)
            </label>
          </div>
        )}

        {supportsDripFeed && dripFeedEnabled && (
          <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-xl p-4 space-y-3">
            <p className="text-xs text-kenya-white/60">
              Quantity is the <span className="text-kenya-green font-semibold">TOTAL</span> amount delivered across the entire drip-feed schedule.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-kenya-white/70 mb-2">Runs</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={runs}
                  onChange={(e) => setRuns(e.target.value)}
                  placeholder="e.g. 10"
                  className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-kenya-white/70 mb-2">Interval (minutes)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={interval}
                  onChange={(e) => setInterval(e.target.value)}
                  placeholder="e.g. 60"
                  className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all"
                />
              </div>
            </div>
            {runs && interval && (
              <p className="text-xs text-kenya-white/50">
                Schedule: {(parseInt(runs, 10) || 0) * (parseInt(interval, 10) || 0)} minutes total runtime
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between bg-kenya-black/60 rounded-xl px-5 py-4 border border-kenya-white/10">
          <div>
            <span className="text-kenya-white/70 font-medium block">Total Charge</span>
            <span className="text-kenya-white/40 text-xs">Wallet balance: KES {walletBalance.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-3">
            {total > 0 && <span className="text-xs bg-kenya-red text-white font-bold px-2 py-0.5 rounded">-5% Happy Hour</span>}
            <span className="text-2xl font-bold text-kenya-green">KES {total.toFixed(2)}</span>
          </div>
        </div>

        {total > walletBalance && total > 0 && (
          <div className="bg-kenya-red/10 border border-kenya-red/30 rounded-xl p-4 flex items-center gap-3">
            <Image src="/mpesa-logo.png" alt="M-Pesa" width={20} height={20} className="w-5 h-5 object-contain" />
            <p className="text-kenya-white/80 text-sm">Insufficient wallet balance. Click Place Order to top up via M-Pesa.</p>
          </div>
        )}

        {orderError && (
          <div className="bg-kenya-red/10 border border-kenya-red/30 rounded-xl p-4">
            <p className="text-kenya-red text-sm">{orderError}</p>
          </div>
        )}

        {orderSuccess && (
          <div className="bg-kenya-green/10 border border-kenya-green/30 rounded-xl p-4">
            <p className="text-kenya-green text-sm font-medium">Order recorded successfully. Redirecting to your orders…</p>
          </div>
        )}

        <button
          onClick={handlePlaceOrder}
          disabled={!isValid || placing}
          className="w-full bg-kenya-green text-kenya-black font-bold text-lg py-4 rounded-xl hover:bg-kenya-green/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-kenya-green flex items-center justify-center gap-2"
        >
          {placing ? "Placing Order…" : "🛒 Place Order"}
        </button>
      </div>

      <MpesaModal isOpen={mpesaOpen} onClose={() => setMpesaOpen(false)} />
    </div>
  );
}
