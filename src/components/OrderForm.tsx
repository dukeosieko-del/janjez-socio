"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useAuth } from "@/components/AuthContext";
import { getServiceCatalogue, getServicesByCategory, getServiceById } from "@/lib/service-queries";
import { submitOrder, submitAnonymousOrder } from "@/lib/order-log";
import { calculateOrderCost } from "@/lib/pricing";

interface ServiceCatalogueItem {
  id: string;
  serviceId: string;
  categoryId: string;
  name: string;
  description: string;
  rate: number;
  min: number;
  max: number;
  refill: string;
  requiresLink: boolean;
  requiresComments: boolean;
  speed: string;
  startTime: string;
  notice: string;
  monetizable: boolean;
  slug: string;
  subcategory: string | null;
  provider_service_id: string | null;
  supports_drip_feed: boolean;
  supports_refill: boolean;
  supports_cancel: boolean;
  display_order: number;
}

interface OrderFormProps {
  onRequireAuth: (tab?: "login" | "register") => void;
  onInsufficientBalance?: (amount: number) => void;
  serviceId?: string | null;
  categoryId?: string | null;
  defaultAnonymous?: boolean;
  janjezServiceId?: string | null;
}

export default function OrderForm({ onRequireAuth, onInsufficientBalance, serviceId, categoryId, defaultAnonymous = false, janjezServiceId }: OrderFormProps) {
  const { user, walletBalance } = useAuth();
  const [catalogue, setCatalogue] = useState<ServiceCatalogueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getServiceCatalogue("show_guarded")
      .then((services) => {
        if (!cancelled) {
          setCatalogue(services as ServiceCatalogueItem[]);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const initialCategory = useMemo(() => {
    if (categoryId) return categoryId;
    if (!serviceId || catalogue.length === 0) return "";
    const service = catalogue.find((s) => s.id === serviceId);
    return service ? service.categoryId : "";
  }, [serviceId, categoryId, catalogue]);

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedServiceId, setSelectedServiceId] = useState(serviceId || "");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");
  const [comments, setComments] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(defaultAnonymous);
  const [dripFeed, setDripFeed] = useState(false);
  const [runs, setRuns] = useState("");
  const [interval, setInterval] = useState("");
  const [placing, setPlacing] = useState(false);
  const [anonymousPlacing, setAnonymousPlacing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  const categoryServices = useMemo(() => {
    if (!selectedCategory) return [];
    return getServicesByCategory(catalogue, selectedCategory);
  }, [selectedCategory, catalogue]);

  const selectedService = useMemo(() => {
    return getServiceById(catalogue, selectedServiceId) || null;
  }, [selectedServiceId, catalogue]);

  const quantityNum = useMemo(() => {
    const num = parseInt(quantity, 10);
    return isNaN(num) ? 0 : num;
  }, [quantity]);

  const total = useMemo(() => {
    if (!selectedService || quantityNum <= 0) return 0;
    return calculateOrderCost(selectedService.rate, quantityNum);
  }, [selectedService, quantityNum]);

  const quantityError = useMemo(() => {
    if (!selectedService || quantityNum <= 0) return "";
    if (quantityNum < selectedService.min) return `Minimum quantity is ${selectedService.min}`;
    if (quantityNum > selectedService.max) return `Maximum quantity is ${selectedService.max.toLocaleString()}`;
    return "";
  }, [selectedService, quantityNum]);

  const runsNum = useMemo(() => {
    const num = parseInt(runs, 10);
    return isNaN(num) ? 0 : num;
  }, [runs]);

  const intervalNum = useMemo(() => {
    const num = parseInt(interval, 10);
    return isNaN(num) ? 0 : num;
  }, [interval]);

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const cat = e.target.value;
    setSelectedCategory(cat);
    setSelectedServiceId("");
    setLink("");
    setQuantity("");
    setComments("");
  }, []);

  const handleServiceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedServiceId(e.target.value);
    setLink("");
    setQuantity("");
    setComments("");
  }, []);

  const handlePlaceOrder = useCallback(async () => {
    if (!selectedService || !link || quantityNum <= 0 || quantityError) return;
    if (dripFeed && (runsNum <= 0 || intervalNum <= 0)) return;

    if (!user && isAnonymous) {
      if (!phoneNumber || !/^\d{9,15}$/.test(phoneNumber.replace(/\s+/g, ""))) {
        setOrderError("Please enter a valid phone number for anonymous checkout.");
        return;
      }
      if (!janjezServiceId && !selectedService?.id) {
        setOrderError("Anonymous checkout requires a mapped service.");
        return;
      }

      setAnonymousPlacing(true);
      setPlacing(true);
      setOrderError(null);
      setOrderSuccess(false);

      try {
        const result = await submitAnonymousOrder({
          janjezServiceId: janjezServiceId || selectedService!.id,
          link,
          quantity: quantityNum,
          phoneNumber,
          runs: dripFeed ? runsNum : null,
          interval: dripFeed ? intervalNum : null,
        });

         if (!result.ok) {
          const orderId = result.order_id;
          setOrderError(
            orderId
              ? `${result.error || "Failed to start anonymous checkout."} Your order reference is ${orderId}. You can track it at /orders/track?ref=${orderId.split("-").pop() || orderId}.`
              : result.error || "Failed to start anonymous checkout."
          );
          setPlacing(false);
          setAnonymousPlacing(false);
          return;
        }

        setOrderSuccess(true);
        setPlacing(false);
        setAnonymousPlacing(false);
        const checkoutId = result.data?.checkoutRequestId;
        const orderId = result.order_id;
        setTimeout(() => {
          window.location.href = checkoutId ? `/orders/track?ref=${checkoutId}` : orderId ? `/orders/track?ref=${orderId.split("-").pop() || orderId}` : "/order/anonymous/created";
        }, 2000);
      } catch {
        setOrderError("Unexpected error while starting anonymous checkout.");
        setPlacing(false);
        setAnonymousPlacing(false);
      }
      return;
    }

    if (!user) {
      onRequireAuth("login");
      return;
    }

    if (total > walletBalance) {
      onInsufficientBalance?.(total);
      return;
    }

    setPlacing(true);
    setOrderError(null);
    setOrderSuccess(false);

    try {
      const quantitySource: "preset" | "custom" = /^\d+$/.test(quantity) ? "preset" : "custom";
      const result = await submitOrder({
        categoryId: selectedService.categoryId,
        serviceId: selectedService.name,
        quantity: quantityNum,
        link,
        amountPaid: total,
        quantitySource,
        selectedSkuId: selectedService.serviceId,
        janjezServiceId: janjezServiceId || null,
        categoryName: selectedService.categoryId.charAt(0).toUpperCase() + selectedService.categoryId.slice(1).replace(/-/g, " "),
        subcategoryName: selectedService.name,
        refillGuarantee: selectedService.refill === "No refill" ? "none" : "standard",
        runs: dripFeed ? runsNum : null,
        interval: dripFeed ? intervalNum : null,
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
  }, [selectedService, link, quantityNum, quantityError, dripFeed, runsNum, intervalNum, onRequireAuth, onInsufficientBalance, user, walletBalance, total, selectedService?.categoryId, selectedService?.name, selectedService?.serviceId, selectedService?.id, quantity, janjezServiceId, isAnonymous, phoneNumber]);

  const isValid =
    selectedService &&
    link.trim().length > 0 &&
    quantityNum >= (selectedService?.min ?? 0) &&
    quantityNum <= (selectedService?.max ?? 0) &&
    (!dripFeed || (runsNum > 0 && intervalNum > 0)) &&
    (!isAnonymous || (phoneNumber.trim().length > 0 && /^\d{9,15}$/.test(phoneNumber.replace(/\s+/g, ""))));

  return (
    <div className="max-w-4xl mx-auto">
      {loading && (
        <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6 mb-6 text-kenya-white/60 text-sm">
          Loading services…
        </div>
      )}

      {!loading && catalogue.length === 0 && (
        <div className="bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-6 mb-6 text-kenya-white/60 text-sm">
          No services available right now. Please check back later.
        </div>
      )}

      {/* Category Selection */}
      {!loading && catalogue.length > 0 && (
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
            {[...new Set(catalogue.map((s) => s.categoryId))].map((catId) => (
              <option key={catId} value={catId} className="bg-kenya-black text-kenya-white">
                {catId
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Service Selection */}
      {!loading && selectedCategory && (
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
          </div>
          <p className="text-kenya-white/70 text-sm mb-4">{selectedService.description}</p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 bg-kenya-black/60 text-kenya-white text-xs px-3 py-1.5 rounded-lg border border-kenya-white/10">
              Rate: KES {selectedService.rate.toFixed(2)} / 1k
            </span>
            {selectedService.refill !== "No refill" && (
              <span className="inline-flex items-center gap-1.5 bg-kenya-green/20 text-kenya-green text-xs px-3 py-1.5 rounded-lg border border-kenya-green/30">
                {selectedService.refill}
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
                Link / Username
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
                Quantity
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

            {/* Drip Feed Toggle */}
            <div className="border-t border-kenya-white/10 pt-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="schedule-delivery"
                    checked={dripFeed}
                    onChange={(e) => {
                      setDripFeed(e.target.checked);
                      if (!e.target.checked) {
                        setRuns("");
                        setInterval("");
                      }
                    }}
                    className="w-4 h-4 rounded border-kenya-white/20 bg-kenya-black text-kenya-green focus:ring-kenya-green"
                  />
                  <label htmlFor="schedule-delivery" className="text-sm font-medium text-kenya-white/70 cursor-pointer">
                    Schedule delivery
                  </label>
                </div>
                {dripFeed && (
                  <span className="text-xs text-kenya-green bg-kenya-green/10 px-2 py-1 rounded">
                    Enabled
                  </span>
                )}
              </div>
              {dripFeed && (
                <p className="text-kenya-white/50 text-xs mt-2">
                  Your total quantity will be delivered gradually across the scheduled runs.
                </p>
              )}
            </div>

            {/* Drip Feed Inputs */}
            {dripFeed && (
              <>
                <div>
                  <label className="block text-sm font-medium text-kenya-white/70 mb-2">
                    Runs
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={runs}
                    onChange={(e) => setRuns(e.target.value)}
                    placeholder="Number of delivery runs"
                    className={`w-full bg-kenya-black border rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:ring-1 transition-all ${
                      dripFeed && runsNum <= 0
                        ? "border-kenya-red focus:border-kenya-red focus:ring-kenya-red"
                        : "border-kenya-white/20 focus:border-kenya-green focus:ring-kenya-green"
                    }`}
                  />
                  {dripFeed && runsNum <= 0 && (
                    <p className="text-kenya-red text-sm mt-2">Runs must be a positive integer</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-kenya-white/70 mb-2">
                    Interval (minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={interval}
                    onChange={(e) => setInterval(e.target.value)}
                    placeholder="Interval between runs"
                    className={`w-full bg-kenya-black border rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:ring-1 transition-all ${
                      dripFeed && intervalNum <= 0
                        ? "border-kenya-red focus:border-kenya-red focus:ring-kenya-red"
                        : "border-kenya-white/20 focus:border-kenya-green focus:ring-kenya-green"
                    }`}
                  />
                  {dripFeed && intervalNum <= 0 && (
                    <p className="text-kenya-red text-sm mt-2">Interval must be a positive integer</p>
                  )}
                </div>
              </>
            )}

            {/* Comments (conditional) */}
            {selectedService.requiresComments && (
              <div>
                <label className="block text-sm font-medium text-kenya-white/70 mb-2">
                  Custom Comments / Text
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

            {isAnonymous && (
              <div>
                <label className="block text-sm font-medium text-kenya-white/70 mb-2">
                  Phone Number (for M-Pesa)
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="07XXXXXXXX or 01XXXXXXXX"
                  className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all"
                />
              </div>
            )}

            {/* Total Charge */}
            <div className="flex items-center justify-between bg-kenya-black/60 rounded-xl px-5 py-4 border border-kenya-white/10">
              <span className="text-kenya-white/70 font-medium">Total Charge</span>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-kenya-green">
              KES {total.toFixed(2)}
            </span>
          </div>
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
              disabled={!isValid || placing || anonymousPlacing}
              className="w-full bg-kenya-green text-kenya-black font-bold text-lg py-4 rounded-xl hover:bg-kenya-green/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-kenya-green flex items-center justify-center gap-2"
            >
              {placing || anonymousPlacing ? "Processing…" : isAnonymous ? "Place & Pay (Guest)" : "Place Order"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}