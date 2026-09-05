"use client";

import Image from "next/image";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useAuth } from "@/components/AuthContext";
import MpesaModal from "@/components/MpesaModal";
import { submitOrder, submitAnonymousOrder } from "@/lib/order-log";
import { JanjezService } from "@/lib/janjez-services";
import { getDripFeedLimitsSync, type DripFeedLimits } from "@/lib/drip-feed-settings";
import { calculateOrderCost } from "@/lib/pricing";
import { fetchJSON } from "@/lib/client/fetchWithTimeout";

export interface FulfillmentProps {
  platformId: string;
  platformName: string;
  platformIcon: string;
  subcategoryName: string;
  deliverable?: { name: string; price: string; note?: string; flag?: string; minQty?: number; maxQty?: number };
  service?: JanjezService;
  onRequireAuth?: (tab?: "login" | "register") => void;
  allowAnonymous?: boolean;
}

export default function FulfillmentForm({ platformId, platformName, platformIcon, subcategoryName, deliverable, service, onRequireAuth, allowAnonymous = true }: FulfillmentProps) {
  const { user, walletBalance } = useAuth();
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [mpesaOpen, setMpesaOpen] = useState(false);
  const [requiredAmount, setRequiredAmount] = useState(0);
  const [dripFeed, setDripFeed] = useState(false);
  const [runs, setRuns] = useState("");
  const [intervalMin, setIntervalMin] = useState("");
  const [dripFeedLimits, setDripFeedLimits] = useState<DripFeedLimits>(getDripFeedLimitsSync);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [anonymousPlacing, setAnonymousPlacing] = useState(false);

  useEffect(() => {
    fetchJSON("/api/admin/settings/drip-feed")
      .then((data) => setDripFeedLimits(data as DripFeedLimits))
      .catch(() => {});
  }, []);

  const ratePerUnit = useMemo(() => {
    if (service) return Number(service.selling_price_ksh);
    if (deliverable) {
      const match = deliverable.price.replace(" Ksh", "").match(/([\d,.]+)/);
      if (match) return parseFloat(match[1].replace(/,/g, "")) * 1000;
    }
    return 0;
  }, [service, deliverable]);

  const quantityNum = useMemo(() => {
    const num = parseInt(quantity, 10);
    return Number.isNaN(num) ? 0 : num;
  }, [quantity]);

  const qtyMin = service ? service.min_quantity : (deliverable?.minQty ?? 10);
  const qtyMax = service ? service.max_quantity : (deliverable?.maxQty ?? 10000);

  const subtotal = useMemo(() => {
    if (!ratePerUnit || quantityNum <= 0) return 0;
    return calculateOrderCost(ratePerUnit, quantityNum);
  }, [ratePerUnit, quantityNum]);

  const total = subtotal;

  const quantityError = useMemo(() => {
    if (quantityNum <= 0) return "";
    if (quantityNum < qtyMin) return `Minimum quantity is ${qtyMin.toLocaleString()}`;
    if (quantityNum > qtyMax) return `Maximum quantity is ${qtyMax.toLocaleString()}`;
    return "";
  }, [quantityNum, qtyMin, qtyMax]);

  const dripFeedDisabled = !service ? false : !service.supports_drip_feed;

  const handlePlaceOrder = useCallback(async () => {
    if (!link.trim() || quantityNum <= 0 || quantityError) return;
    if (dripFeed && (parseInt(runs, 10) <= 0 || parseInt(intervalMin, 10) <= 0)) return;

    if (!user && isAnonymous) {
      if (!phoneNumber || !/^\d{9,15}$/.test(phoneNumber.replace(/\s+/g, ""))) {
        setOrderError("Please enter a valid phone number for anonymous checkout.");
        return;
      }
      if (!service) {
        setOrderError("Anonymous checkout requires a Janjez service. Please sign in or select a mapped service.");
        return;
      }

      setAnonymousPlacing(true);
      setPlacing(true);
      setOrderError(null);

      try {
        const result = await submitAnonymousOrder({
          janjezServiceId: service.id,
          link,
          quantity: quantityNum,
          phoneNumber,
          runs: dripFeed ? parseInt(runs, 10) : null,
          interval: dripFeed ? parseInt(intervalMin, 10) : null,
        });

        if (!result.ok) {
          setOrderError(result.error || "Failed to start anonymous checkout.");
          setPlacing(false);
          setAnonymousPlacing(false);
          return;
        }

        setOrderSuccess(true);
        setPlacing(false);
        setAnonymousPlacing(false);
        const orderId = result.data.order_id;
        void orderId;
        const checkoutId = result.data.checkoutRequestId;
        setTimeout(() => {
          window.location.href = checkoutId ? `/orders/track?ref=${checkoutId}` : "/order/anonymous/created";
        }, 2000);
      } catch {
        setOrderError("Unexpected error while starting anonymous checkout.");
        setPlacing(false);
        setAnonymousPlacing(false);
      }
      return;
    }

    if (total > walletBalance) {
      setMpesaOpen(true);
      setRequiredAmount(total);
      return;
    }

    if (!user) {
      if (onRequireAuth) {
        onRequireAuth("login");
      } else {
        window.location.href = "/auth/sign-in";
      }
      return;
    }

    setPlacing(true);
    setOrderError(null);
    setOrderSuccess(false);

    try {
      const quantitySource: "preset" | "custom" = /^\d+$/.test(quantity) ? "preset" : "custom";
      const result = await submitOrder({
        categoryId: platformId,
        serviceId: deliverable?.name || service?.name || subcategoryName,
        quantity: quantityNum,
        link,
        amountPaid: total,
        quantitySource,
        selectedSkuId: deliverable?.name || service?.slug,
        janjezServiceId: service?.id || null,
        categoryName: platformId.charAt(0).toUpperCase() + platformId.slice(1).replace(/-/g, " "),
        subcategoryName: deliverable?.name || service?.name || subcategoryName,
        refillGuarantee: service?.supports_refill ? "standard" : "none",
        runs: dripFeed ? parseInt(runs, 10) : null,
        interval: dripFeed ? parseInt(intervalMin, 10) : null,
      });


      if (!result.ok) {
        if (result.error?.includes("401") || result.error?.includes("Unauthorized")) {
          onRequireAuth?.("login");
        } else if (result.error?.includes("Insufficient wallet balance")) {
          setRequiredAmount(total);
          setMpesaOpen(true);
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
  }, [link, quantityNum, quantityError, total, walletBalance, platformId, deliverable, service, subcategoryName, onRequireAuth, dripFeed, runs, intervalMin, isAnonymous, phoneNumber]);

  const isValid =
    link.trim().length > 0 &&
    quantityNum >= qtyMin &&
    quantityNum <= qtyMax &&
    (!dripFeed ||
      (dripFeedLimits.enabled &&
        parseInt(runs, 10) >= dripFeedLimits.min_runs &&
        parseInt(runs, 10) <= dripFeedLimits.max_runs &&
        parseInt(intervalMin, 10) >= dripFeedLimits.min_interval &&
        parseInt(intervalMin, 10) <= dripFeedLimits.max_interval));

  const displayName = service ? service.name : (deliverable?.name || subcategoryName);
  const displayNote = service ? service.description : deliverable?.note;
  const refillText = service ? (service.supports_refill ? "30 Days Refill Guarantee" : "No refill") : "No refill";

  return (
    <div data-walkthrough="walkthrough-fulfillment-form" className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 flex items-center justify-center">
          <img src={platformIcon} alt={platformName} className="w-10 h-10 object-contain" />
        </div>
        <div>
          <p className="text-kenya-white/50 text-xs uppercase tracking-wider">{platformName}</p>
          <h3 className="text-kenya-white font-bold text-xl">{displayName}</h3>
        </div>
      </div>

        {displayNote && (
          <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-xl p-3 mb-3">
            <p className="text-kenya-white/50 text-xs italic">{displayNote}</p>
          </div>
        )}
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-kenya-white/70 mb-2">
            Link / Username
          </label>
          <input
            type="text"
            required
            data-walkthrough="walkthrough-target-link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Profile, post, channel URL or phone number"
            className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-kenya-white/70 mb-2">
            Quantity
          </label>
          <input
            type="number"
            required
            data-walkthrough="walkthrough-quantity-input"
            min={qtyMin}
            max={qtyMax}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder={`Enter quantity (${qtyMin.toLocaleString()} - ${qtyMax.toLocaleString()})`}
            className={`w-full bg-kenya-black border rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:ring-1 transition-all ${
              quantityError
                ? "border-kenya-red focus:border-kenya-red focus:ring-kenya-red"
                : "border-kenya-white/20 focus:border-kenya-green focus:ring-kenya-green"
            }`}
          />
          {quantityError && <p className="text-kenya-red text-sm mt-2">{quantityError}</p>}
        </div>

        {service && service.supports_drip_feed && (
          <div className="border-t border-kenya-white/10 pt-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="schedule-delivery-ff"
                  checked={dripFeed}
                  onChange={(e) => {
                    setDripFeed(e.target.checked);
                    if (!e.target.checked) {
                      setRuns("");
                      setIntervalMin("");
                    }
                  }}
                  className="w-4 h-4 rounded border-kenya-white/20 bg-kenya-black text-kenya-green focus:ring-kenya-green"
                />
                <label htmlFor="schedule-delivery-ff" className="text-sm font-medium text-kenya-white/70 cursor-pointer">
                  Schedule delivery
                </label>
              </div>
              {dripFeed && <span className="text-xs text-kenya-green bg-kenya-green/10 px-2 py-1 rounded">Enabled</span>}
            </div>
            {dripFeed && (
              <p className="text-kenya-white/50 text-xs mt-2">
                Your total quantity will be delivered gradually over the scheduled period.
              </p>
            )}
            {dripFeed && (
              <>
                <div className="mt-3">
                  <label className="block text-sm font-medium text-kenya-white/70 mb-2">Runs</label>
                  <input
                    type="number"
                    min={1}
                    value={runs}
                    onChange={(e) => setRuns(e.target.value)}
                    placeholder="Number of delivery runs"
                    className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all"
                  />
                  {parseInt(runs, 10) <= 0 && <p className="text-kenya-red text-sm mt-2">Runs must be a positive integer</p>}
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-medium text-kenya-white/70 mb-2">Interval (minutes)</label>
                  <input
                    type="number"
                    min={1}
                    value={intervalMin}
                    onChange={(e) => setIntervalMin(e.target.value)}
                    placeholder="Interval between runs"
                    className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all"
                  />
                  {parseInt(intervalMin, 10) <= 0 && <p className="text-kenya-red text-sm mt-2">Interval must be a positive integer</p>}
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex items-center justify-between bg-kenya-black/60 rounded-xl px-5 py-4 border border-kenya-white/10">
          <div>
            <span className="text-kenya-white/70 font-medium block">Total Charge</span>
            <span className="text-kenya-white/40 text-xs">Wallet balance: KES {walletBalance != null ? walletBalance.toLocaleString() : "—"}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-kenya-green">KES {total.toFixed(2)}</span>
          </div>
        </div>

        {user && total > walletBalance && total > 0 && (
          <div className="bg-kenya-red/10 border border-kenya-red/30 rounded-xl p-4 flex items-center gap-3">
            <Image src="/mpesa-logo.png" alt="M-Pesa" width={20} height={20} className="w-5 h-5 object-contain" />
            <p className="text-kenya-white/80 text-sm">Insufficient wallet balance. Top up via M-Pesa to complete this order.</p>
          </div>
        )}

        {!user && allowAnonymous && service && (
          <div className="border-t border-kenya-white/10 pt-5 space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="anonymous-checkout"
                checked={isAnonymous}
                onChange={(e) => {
                  setIsAnonymous(e.target.checked);
                  if (!e.target.checked) {
                    setPhoneNumber("");
                  }
                }}
                className="w-4 h-4 rounded border-kenya-white/20 bg-kenya-black text-kenya-green focus:ring-kenya-green"
              />
              <label htmlFor="anonymous-checkout" className="text-sm font-medium text-kenya-white/70 cursor-pointer">
                Place order as guest (no account needed)
              </label>
            </div>

            {isAnonymous && (
              <>
                <div>
                  <label className="block text-sm font-medium text-kenya-white/70 mb-2">
                    Phone Number (for M-Pesa)
                  </label>
                  <input
                    type="tel"
                    data-walkthrough="walkthrough-phone-input"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="07XXXXXXXX or 01XXXXXXXX"
                    className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all"
                  />
                </div>
                <div className="bg-kenya-green/5 border border-kenya-green/20 rounded-xl p-4 flex items-start gap-3">
                  <Image src="/mpesa-logo.png" alt="M-Pesa" width={20} height={20} className="w-5 h-5 object-contain mt-0.5" />
                  <p className="text-kenya-white/80 text-xs">
                    You will receive an M-Pesa STK push for the exact order amount. Your order will be processed immediately after payment.
                  </p>
                </div>
              </>
            )}
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
          disabled={!isValid || placing || anonymousPlacing}
          data-walkthrough="walkthrough-guest-checkout"
          className="w-full bg-kenya-green text-kenya-black font-bold text-lg py-4 rounded-xl hover:bg-kenya-green/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-kenya-green flex items-center justify-center gap-2"
        >
          {placing || anonymousPlacing ? "Processing…" : !user && isAnonymous ? "Place & Pay (Guest)" : "Place Order"}
        </button>
      </div>

      <MpesaModal
        isOpen={mpesaOpen}
        onClose={() => setMpesaOpen(false)}
        requiredAmount={requiredAmount}
        serviceName={displayName}
        quantity={quantityNum}
        onSuccess={() => setMpesaOpen(false)}
      />
    </div>
  );
}
