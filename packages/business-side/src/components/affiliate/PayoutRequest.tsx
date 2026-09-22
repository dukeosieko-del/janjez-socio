'use client';

import { useState } from 'react';

export function PayoutRequest() {
  const [amount, setAmount] = useState('');
  const [mpesa, setMpesa] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setBalanceError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/affiliate/payout/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount), mpesa_number: mpesa }),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = data.error || 'Payout failed';
        // Surface balance errors distinctly so the user can top up instead
        // of retrying blindly.
        if (msg.toLowerCase().includes('insufficient balance')) {
          setBalanceError(msg);
        } else {
          setError(msg);
        }
      } else {
        setSuccess(true);
        setAmount('');
        setMpesa('');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Request Payout</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (min KES 500)
          </label>
          <input
            type="number"
            min={500}
            step={100}
            value={amount}
            onChange={e => {
              setAmount(e.target.value);
              setBalanceError(null);
            }}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            MPesa Number
          </label>
          <input
            type="tel"
            value={mpesa}
            onChange={e => setMpesa(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="2547XXXXXXXX"
          />
        </div>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {balanceError && (
        <p className="text-amber-600 text-sm bg-amber-50 border border-amber-200 rounded px-3 py-2">
          {balanceError}
        </p>
      )}
      {success && <p className="text-green-600 text-sm">Payout requested successfully!</p>}
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Processing...' : 'Request Payout'}
      </button>
    </form>
  );
}