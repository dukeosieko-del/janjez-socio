'use client';

import { useState } from 'react';

export default function MpesaPayoutPage() {
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [remarks, setRemarks] = useState('Payout');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handlePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/partner/mpesa/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          phoneNumber,
          remarks,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage('Payout initiated successfully! Funds will be sent to the recipient.');
      } else {
        setMessage(data.error || 'Failed to initiate payout');
      }
    } catch (error) {
      setMessage('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">M-Pesa Payout</h1>
      
      <form onSubmit={handlePayout} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (KES)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="500"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900"
            placeholder="Enter amount (min 500)"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Phone Number</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            pattern="254[0-9]{9}"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900"
            placeholder="254XXXXXXXXX"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
          <input
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900"
            placeholder="Payout"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Send Payout via M-Pesa'}
        </button>
      </form>
      
      {message && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800">
          {message}
        </div>
      )}
    </div>
  );
}
