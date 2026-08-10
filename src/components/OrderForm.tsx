"use client";

import { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/components/AuthContext";
import { ORDER_SERVICES, getServicesByCategory } from "@/lib/data";
import { submitOrder } from "@/lib/order-log";

export interface OrderFormService {
  id: string;
  categoryId: string;
  name: string;
  serviceId: string;
  rate: number;
  min: number;
  max: number;
  description: string;
  refill: string;
  requiresComments?: boolean;
  requiresLink?: boolean;
  speed?: string;
  startTime?: string;
  notice?: string;
  monetizable?: boolean;
  supports_drip_feed?: boolean;
  janjez_service_id?: string;
}

interface OrderFormProps {
  onRequireAuth: (tab?: "login" | "register") => void;
  onInsufficientBalance?: () => void;
  serviceId?: string | null;
  categoryId?: string | null;
  defaultAnonymous?: boolean;
  services?: OrderFormService[];
}

function isOrderFormService(s: OrderFormService | (typeof ORDER_SERVICES)[number]): s is OrderFormService {
  return "janjez_service_id" in s;
}

function toOrderFormService(s: { id: string; category: string; name: string; selling_price_ksh: number; min_quantity: number; max_quantity: number; description: string | null; supports_refill: boolean; supports_drip_feed: boolean; }): OrderFormService {
  return {
    id: s.id,
    categoryId: s.category.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: s.name,
    serviceId: s.id,
    rate: s.selling_price_ksh,
    min: s.min_quantity,
    max: s.max_quantity,
    description: s.description || "",
    refill: s.supports_refill ? "Refill supported" : "No refill",
    requiresComments: false,
    supports_drip_feed: s.supports_drip_feed,
    janjez_service_id: s.id,
  };
}

export default function OrderForm({ onRequireAuth, onInsufficientBalance, serviceId, categoryId, defaultAnonymous = false, services: dynamicServices }: OrderFormProps) {
  const { user, walletBalance } = useAuth();
  const availableServices = dynamicServices && dynamicServices.length > 0 ? dynamicServices : ORDER_SERVICES;

  const initialCategory = useMemo(() => {
    if (categoryId) return categoryId;
    if (!serviceId) return "";
    const service = availableServices.find((s) => s.id === serviceId);
    return service ? service.categoryId : "";
  }, [serviceId, categoryId, availableServices]);

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedServiceId, setSelectedServiceId] = useState(serviceId || "");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");
  const [comments, setComments] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(defaultAnonymous);
  const [dripFeedEnabled, setDripFeedEnabled] = useState(false);
  const [runs, setRuns] = useState("");
  const [interval, setInterval] = useState("");
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const categoryServices = useMemo(() => {
    if (!selectedCategory) return [];
    return getServicesByCategory(selectedCategory);
  }, [selectedCategory]);

  const selectedService = useMemo(() => {
    return availableServices.find((s) => s.id === selectedServiceId) || null;
  }, [selectedServiceId, availableServices]);

  const quantityNum = useMemo(() => {
    const num = parseInt(quantity, 10);
    return isNaN(num) ? 0 : num;
  }, [quantity]);

  const total = useMemo(() => {
    if (!selectedService || quantityNum <= 0) return 0;
    const discount = 0.95;
    return selectedService.rate * quantityNum * discount;
  }, [selectedService, quantityNum]);

  const quantityError = useMemo(() => {
    if (!selectedService || quantityNum <= 0) return "";
    if (quantityNum < selectedService.min) return `Minimum quantity is ${selectedService.min}`;
    if (quantityNum > selectedService.max) return `Maximum quantity is ${selectedService.max.toLocaleString()}`;
    return "";
  }, [selectedService, quantityNum]);

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const cat = e.target.value;
    setSelectedCategory(cat);
    setSelectedServiceId("");
    setLink("");
    setQuantity("");
    setComments("");
    setDripFeedEnabled(false);
    setRuns("");
    setInterval("");
  }, []);

  const handleServiceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedServiceId(e.target.value);
    setLink("");
    setQuantity("");
    setComments("");
    setDripFeedEnabled(false);
    setRuns("");
    setInterval("");
  }, []);

  const handlePlaceOrder = useCallback(async () => {
    if (!selectedService || !link || quantityNum <= 0 || quantityError) return;
    if (!user) {
      onRequireAuth("login");
      return;
    }

    if (dripFeedEnabled) {
      const runsNum = parseInt(runs, 10);
      const intervalNum = parseInt(interval, 10);
      if (!runs || isNaN(runsNum) || runsNum <= 0) {
        setOrderError("Runs must be a positive integer.");
        return;
      }
      if (!interval || isNaN(intervalNum) || intervalNum <= 0) {
        setOrderError("Interval must be a positive integer (minutes).");
        return;
      }
    }

    if (total > walletBalance) {
      onInsufficientBalance?.();
      return;
    }

    setPlacing(true);
    setOrderError(null);
    setOrderSuccess(false);

    try {
      const quantitySource: "preset" | "custom" = /^\d+$/.test(quantity) ? "preset" : "custom";
      const result = await submitOrder({
        categoryId: selectedCategory,
        serviceId: selectedService.name,
        quantity: quantityNum,
        link,
        amountPaid: total,
        quantitySource,
        selectedSkuId: selectedService.serviceId,
        janjezServiceId: "janjez_service_id" in selectedService ? selectedService.janjez_service_id : undefined,
        runs: ("supports_drip_feed" in selectedService && selectedService.supports_drip_feed && dripFeedEnabled) ? (parseInt(runs, 10) || null) : null,
        interval: ("supports_drip_feed" in selectedService && selectedService.supports_drip_feed && dripFeedEnabled) ? (parseInt(interval, 10) || null) : null,
      });

      if (!result.ok) {
        if (result.error?.includes("401") || result.error?.includes("Unauthorized")) {
          onRequireAuth("login");
        } else {
          setOrderError(result.error || "Failed to place order.");
        }
        return;
      }

      setOrderSuccess(true);
      setTimeout(() => {
        window.location.href = "/orders/all";
      }, 1500);
    } catch {
      setOrderError("Unexpected error while placing order.");
    } finally {
      setPlacing(false);
    }
  }, [selectedService, link, quantityNum, quantityError, onRequireAuth, onInsufficientBalance, user, walletBalance, total, selectedCategory, quantity, dripFeedEnabled, runs, interval]);

  const isValid =
    selectedService &&
    link.trim().length > 0 &&
    quantityNum >= (selectedService?.min ?? 0) &&
    quantityNum <= (selectedService?.max ?? 0);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Category Selection */}
      <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6 mb-6">
        <label className="block text-sm font-semibold text-kenya-white/70 mb-3 uppercase tracking-wider">
          Select Category
        </label>
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-3 text-kenya-white focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all appearance-none cursor-pointer"
        >
          <option value="" className="bg-kenya-black text-kenya-white/50">
            -- Choose a platform --
          </option>
          {availableServices.length > 0 &&
            [...new Set(availableServices.map((s) => s.categoryId))].map((catId) => (
              <option key={catId} value={catId} className="bg-kenya-black text-kenya-white">
                {catId
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </option>
            ))}
        </select>
      </div>

      {/* Service Selection */}
      {selectedCategory && (
        <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6 mb-6">
          <label className="block text-sm font-semibold text-kenya-white/70 mb-3 uppercase tracking-wider">
            Select Service
          </label>
          <select
            value={selectedServiceId}
            onChange={handleServiceChange}
            className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-3 text-kenya-white focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all appearance-none cursor-pointer"
          >
            <option value="" className="bg-kenya-black text-kenya-white/50">
              -- Choose a service --
            </option>
            {categoryServices.map((service) => (
              <option key={service.id} value={service.id} className="bg-kenya-black text-kenya-white">
                {service.name}
              </option>
            ))}
          </select>
        </div>
      )}

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
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 bg-kenya-black/60 text-kenya-white text-xs px-3 py-1.5 rounded-lg border border-kenya-white/10">
              ⚡ Rate: KES {selectedService.rate.toFixed(2)} / 1k
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
                🔗 Link / Username
              </label>
              <input
                type="url"
                required
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://x.com/username/status/..."
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

            {/* Comments (conditional) */}
            {selectedService.requiresComments && (
              <div>
                <label className="block text-sm font-medium text-kenya-white/70 mb-2">
                  💬 Custom Comments / Text
                </label>
                <textarea
                  required
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Enter your custom comments, mentions, or crypto bot text here..."
                  rows={4}
                  className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all resize-none"
                />
              </div>
            )}

            {/* Drip-feed toggle */}
            {"supports_drip_feed" in selectedService && selectedService.supports_drip_feed && (
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

            {"supports_drip_feed" in selectedService && selectedService.supports_drip_feed && dripFeedEnabled && (
              <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-xl p-4 space-y-3">
                <p className="text-xs text-kenya-white/60">
                  Quantity is the <span className="text-kenya-green font-semibold">TOTAL</span> amount delivered across the entire drip-feed schedule.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-kenya-white/70 mb-2">
                      Runs
                    </label>
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
                    <label className="block text-sm font-medium text-kenya-white/70 mb-2">
                      Interval (minutes)
                    </label>
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

            {/* Total Charge */}
            <div className="flex items-center justify-between bg-kenya-black/60 rounded-xl px-5 py-4 border border-kenya-white/10">
              <span className="text-kenya-white/70 font-medium">Total Charge</span>
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
            {orderError && (
              <div className="bg-kenya-red/10 border border-kenya-red/30 rounded-xl p-4">
                <p className="text-kenya-red text-sm">{orderError}</p>
              </div>
            )}

            {orderSuccess && (
              <div className="bg-kenya-green/10 border border-kenya-green/30 rounded-xl p-4">
                <p className="text-kenya-green text-sm font-medium">Order recorded successfully. Redirecting…</p>
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
        </div>
      )}
    </div>
  );
}

export { toOrderFormService };