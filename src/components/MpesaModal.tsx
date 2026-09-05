"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useAuth } from "./AuthContext";
import { calculateMpesaAmount, SERVICE_CHARGE_KES } from "@/lib/pricing";
import { fetchWithTimeout } from "@/lib/client/fetchWithTimeout";

interface MpesaModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredAmount?: number;
  serviceName?: string;
  quantity?: number;
  onSuccess?: () => void;
}

const POLL_INTERVAL = 5000;
const POLL_TIMEOUT = 120000;

export default function MpesaModal({ isOpen, onClose, requiredAmount, serviceName, quantity, onSuccess }: MpesaModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"input" | "processing" | "success">("input");
  const [txId, setTxId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [chargedAmount, setChargedAmount] = useState<number | null>(null);
  const { session, walletBalance, refreshProfile } = useAuth();
  const suggestedAmount = requiredAmount
    ? Math.max(0, requiredAmount - Number(walletBalance || 0))
    : 0;

  const resetAndClose = () => {
    setStep("input");
    setPhoneNumber("");
    setAmount("");
    setChargedAmount(null);
    setTxId("");
    setError(null);
    setCheckoutRequestId(null);
    onClose();
  };

  useEffect(() => {
    if (requiredAmount && requiredAmount > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAmount(requiredAmount.toFixed(2));
    }
  }, [requiredAmount]);

  const handleTopUp = async () => {
    if (!phoneNumber || !amount) return;
    setError(null);
    setStep("processing");

    const numAmount = Number(amount);
    const mpesaAmount = calculateMpesaAmount(numAmount);
    setChargedAmount(mpesaAmount);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const initiateRes = await fetchWithTimeout("/api/mpesa/stk-push", {
        method: "POST",
        headers,
        body: JSON.stringify({ phoneNumber, amount: mpesaAmount }),
      });

      const initiateData = await initiateRes.json();

      if (!initiateRes.ok) {
        throw new Error(initiateData.error || "Failed to initiate M-Pesa payment");
      }

      const checkoutId = initiateData.checkoutRequestId;
      setCheckoutRequestId(checkoutId);

      const startTime = Date.now();
      const token = session?.access_token;

      const poll = async () => {
        try {
          const headers: Record<string, string> = {};
          if (token) headers.Authorization = `Bearer ${token}`;

          const statusRes = await fetchWithTimeout(
            `/api/mpesa/check-status?checkoutRequestId=${encodeURIComponent(checkoutId)}`,
            {
              method: "GET",
              headers,
            }
          );

          const statusData = await statusRes.json();

          if (statusData.paid) {
            setTxId(checkoutId.slice(0, 10));
            setStep("success");
            if (token) await refreshProfile();
            return;
          }

          if (Date.now() - startTime >= POLL_TIMEOUT) {
            throw new Error("Payment timed out. Please check your phone and try again.");
          }

          setTimeout(poll, POLL_INTERVAL);
        } catch (pollErr) {
          console.error("M-Pesa poll error:", pollErr);
          setError(pollErr instanceof Error ? pollErr.message : "Payment processing failed. Please try again.");
          setStep("input");
        }
      };

      setTimeout(poll, POLL_INTERVAL);
    } catch (err) {
      console.error("M-Pesa top-up error:", err);
      setError(err instanceof Error ? err.message : "Payment processing failed. Please try again.");
      setStep("input");
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div data-walkthrough="walkthrough-mpesa-payment" className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-kenya-black border border-kenya-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        {step === "input" && (
          <>
            <div className="flex items-center justify-between p-6 border-b	border-kenya-white/10">
              <div className="flex items-center gap-3">
                <Image src="/mpesa-logo.png" alt="M-Pesa" width={40} height={40} className="w-10 h-10 object-contain" />
                <div>
                  <h2 className="text-xl font-bold text-kenya-white">Lipa na M-Pesa</h2>
                  <p className="text-kenya-white/50 text-sm">Top up your wallet instantly</p>
                  {(serviceName || quantity) && (
                    <p className="text-kenya-white/40 text-xs mt-1">
                      {serviceName}{quantity ? ` x${quantity}` : ""}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-kenya-white/50 hover:text-kenya-white transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-kenya-white/70 mb-2">
                  M-Pesa Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="07XXXXXXXX or 01XXXXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-kenya-white/70 mb-2">
                  {requiredAmount ? "Order Amount (KES)" : "Amount (KES)"}
                </label>
                <input
                  type="number"
                  placeholder={requiredAmount ? `Required: KES ${requiredAmount.toFixed(2)}` : "Enter amount"}
                  value={requiredAmount ? requiredAmount.toFixed(2) : amount}
                  onChange={(e) => !requiredAmount && setAmount(e.target.value)}
                  readOnly={!!requiredAmount}
                  className={`w-full bg-kenya-black border rounded-xl px-4 py-3 text-kenya-white focus:outline-none focus:ring-1 transition-all ${
                    requiredAmount
                      ? "border-kenya-green/30 bg-kenya-green/5 text-kenya-green cursor-not-allowed"
                      : "border-kenya-white/20 placeholder-kenya-white/30 focus:border-green-500 focus:ring-green-500"
                  }`}
                />
                {requiredAmount && (
                  <p className="text-xs text-kenya-white/50 mt-1">Amount is calculated from your order and cannot be changed.</p>
                )}
              </div>

              {!requiredAmount && (
                <div className="grid grid-cols-4 gap-2">
                  {[suggestedAmount, 100, 500, 1000].filter((v, i, a) => a.indexOf(v) === i).map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAmount(preset.toString())}
                      className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        amount === preset.toString()
                          ? "bg-kenya-green text-kenya-black"
                          : "bg-kenya-white/5 text-kenya-white/70 hover:bg-kenya-white/10"
                      }`}
                    >
                      KES {preset.toLocaleString()}
                    </button>
                  ))}
                </div>
              )}

              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs text-green-400 leading-relaxed">
                    You will receive an M-Pesa STK push on your phone. Enter your
                    M-Pesa PIN to complete the payment. Funds will be added to your
                    wallet instantly.
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-kenya-red/10 border border-kenya-red/30 rounded-xl p-4">
                  <p className="text-kenya-red text-sm">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-kenya-white/50 mb-2">
                <span>Current balance</span>
                <span>KES {walletBalance.toLocaleString()}</span>
              </div>

              <button
                onClick={handleTopUp}
                disabled={!phoneNumber || !amount}
                data-walkthrough="walkthrough-mpesa-pay"
                className="w-full bg-green-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600 flex items-center justify-center gap-2"
              >
                <Image src="/mpesa-logo.png" alt="M-Pesa" width={24} height={24} className="w-6 h-6 object-contain" />
                Pay with M-Pesa
              </button>
            </div>
          </>
        )}

        {step === "processing" && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-xl font-bold text-kenya-white mb-2">Processing Payment</h3>
            <p className="text-kenya-white/60 text-sm">
              Please check your phone and enter your M-Pesa PIN to complete the transaction.
            </p>
            {checkoutRequestId && (
              <p className="text-kenya-white/40 text-xs mt-4 font-mono">
                Ref: {checkoutRequestId.slice(0, 10)}
              </p>
            )}
          </div>
        )}

        {step === "success" && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Image src="/mpesa-logo.png" alt="M-Pesa" width={48} height={48} className="w-12 h-12 object-contain" />
            </div>
            <h3 className="text-xl font-bold text-kenya-white mb-2">Payment Successful!</h3>
            <p className="text-kenya-white/60 text-sm mb-2">
              KES {chargedAmount !== null ? chargedAmount.toLocaleString() : "0"} has been added to your wallet.
            </p>
            <p className="text-kenya-green text-sm font-medium mb-6">
              Transaction ID: {txId}
            </p>
            <button
              onClick={() => {
                onSuccess?.();
                resetAndClose();
              }}
              className="bg-kenya-green text-kenya-black font-bold py-3 px-8 rounded-xl hover:bg-kenya-green/90 transition-colors"
            >
              Start Ordering
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
