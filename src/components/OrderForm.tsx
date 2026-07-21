"use client";

import { useState, useMemo, useCallback } from "react";
import { ORDER_SERVICES, getServicesByCategory } from "@/lib/data";

interface OrderFormProps {
  onRequireAuth: (tab?: "login" | "register") => void;
  serviceId?: string | null;
  categoryId?: string | null;
  defaultAnonymous?: boolean;
}

export default function OrderForm({ onRequireAuth, serviceId, categoryId, defaultAnonymous = false }: OrderFormProps) {
  const initialCategory = useMemo(() => {
    if (categoryId) return categoryId;
    if (!serviceId) return "";
    const service = ORDER_SERVICES.find((s) => s.id === serviceId);
    return service ? service.categoryId : "";
  }, [serviceId, categoryId]);

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedServiceId, setSelectedServiceId] = useState(serviceId || "");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");
  const [comments, setComments] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(defaultAnonymous);

  const categoryServices = useMemo(() => {
    if (!selectedCategory) return [];
    return getServicesByCategory(selectedCategory);
  }, [selectedCategory]);

  const selectedService = useMemo(() => {
    return ORDER_SERVICES.find((s) => s.id === selectedServiceId) || null;
  }, [selectedServiceId]);

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
  }, []);

  const handleServiceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedServiceId(e.target.value);
    setLink("");
    setQuantity("");
    setComments("");
  }, []);

  const handlePlaceOrder = useCallback(() => {
    if (!selectedService || !link || quantityNum <= 0 || quantityError) return;
    if (isAnonymous) {
      alert("Order placed anonymously! (demo)");
      return;
    }
    onRequireAuth("login");
  }, [selectedService, link, quantityNum, quantityError, isAnonymous, onRequireAuth]);

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
          {ORDER_SERVICES.length > 0 &&
            [...new Set(ORDER_SERVICES.map((s) => s.categoryId))].map((catId) => (
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
  );
}
