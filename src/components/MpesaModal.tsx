"use client";

import { useState } from "react";

interface MpesaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MpesaModal({ isOpen, onClose }: MpesaModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"input" | "processing" | "success">("input");
  const [txId, setTxId] = useState("");

  if (!isOpen) return null;

  const handleTopUp = () => {
    if (!phoneNumber || !amount) return;
    setStep("processing");

    setTimeout(() => {
      setTxId("MP" + Date.now().toString().slice(-10));
      setStep("success");
    }, 3000);
  };

  const resetAndClose = () => {
    setStep("input");
    setPhoneNumber("");
    setAmount("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-kenya-black border border-kenya-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        {step === "input" && (
          <>
            <div className="flex items-center justify-between p-6 border-b border-kenya-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-kenya-white">Lipa na M-Pesa</h2>
                  <p className="text-kenya-white/50 text-sm">Top up your wallet instantly</p>
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
                  Amount (KES)
                </label>
                <input
                  type="number"
                  placeholder="Enter amount (minimum KES 100)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="100"
                  className="w-full bg-kenya-black border border-kenya-white/20 rounded-xl px-4 py-3 text-kenya-white placeholder-kenya-white/30 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[100, 500, 1000, 5000].map((preset) => (
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

              <button
                onClick={handleTopUp}
                disabled={!phoneNumber || !amount || Number(amount) < 100}
                className="w-full bg-green-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600 flex items-center justify-center gap-2"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                </svg>
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
          </div>
        )}

        {step === "success" && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-kenya-white mb-2">Payment Successful!</h3>
            <p className="text-kenya-white/60 text-sm mb-2">
              KES {Number(amount).toLocaleString()} has been added to your wallet.
            </p>
            <p className="text-kenya-green text-sm font-medium mb-6">
              Transaction ID: {txId}
            </p>
            <button
              onClick={resetAndClose}
              className="bg-kenya-green text-kenya-black font-bold py-3 px-8 rounded-xl hover:bg-kenya-green/90 transition-colors"
            >
              Start Ordering
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
