"use client";

import Image from "next/image";
import { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/components/AuthContext";
import MpesaModal from "@/components/MpesaModal";
import { submitOrder } from "@/lib/order-log";
import { HAPPY_HOUR_DISCOUNT } from "@/lib/services";

export interface FulfillmentProps {
  platformId: string;
  platformName: string;
  platformIcon: string;
  subcategoryName: string;
  deliverable: { name: string; price: string; note?: string; flag?: string; minQty?: number; maxQty?: number };
  onRequireAuth?: (tab?: "login" | "register") => void;
}

export default function FulfillmentForm({ platformId, platformName, platformIcon, subcategoryName, deliverable, onRequireAuth }: FulfillmentProps) {
  const { user, walletBalance } = useAuth();
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [mpesaOpen, setMpesaOpen] = useState(false);

  const parsedAmount = useMemo(() => parseFloat(deliverable.price.replace(" Ksh", "") || "0"), [deliverable.price]);
  const quantityNum = useMemo(() => {
    const num = parseInt(quantity, 10);
    return Number.isNaN(num) ? 0 : num;
  }, [quantity]);

  const subtotal = useMemo(() => {
    if (!parsedAmount || quantityNum <= 0) return 0;
    return parsedAmount * quantityNum;
  }, [parsedAmount, quantityNum]);

  const total = useMemo(() => {
    if (subtotal <= 0) return 0;
    return subtotal * HAPPY_HOUR_DISCOUNT;
  }, [subtotal]);

  const qtyMin = deliverable.minQty ?? 10;
  const qtyMax = deliverable.maxQty ?? 10000;

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
        serviceId: deliverable.name,
        quantity: quantityNum,
        link,
        amountPaid: total,
        quantitySource,
        selectedSkuId: deliverable.name,
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
  }, [link, quantityNum, quantityError, total, walletBalance, platformId, deliverable.name]);

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

      {deliverable.flag && (
          <div className="bg-kenya-red/10 border border-kenya-red/30 rounded-xl p-3">
            <p className="text-kenya-red text-xs">{deliverable.flag}</p>
          </div>
        )}
        {deliverable.note && (
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
