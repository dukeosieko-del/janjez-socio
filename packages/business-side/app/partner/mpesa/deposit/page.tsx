'use client';

import { useState } from 'react';

export default function MpesaDepositPage() {
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/partner/mpesa/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          phoneNumber,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage('STK push sent! Check your phone to complete payment.');
      } else {
        setMessage(data.error || 'Failed to initiate deposit');
      }
    } catch (error) {
      setMessage('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">M-Pesa Deposit</h1>
      
      <form onSubmit={handleDeposit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (KES)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="50"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900"
            placeholder="Enter amount"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            pattern="254[0-9]{9}"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900"
            placeholder="254XXXXXXXXX"
          />
          <p className="text-xs text-gray-500 mt-1">Format: 254XXXXXXXXX</p>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Deposit via M-Pesa'}
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
