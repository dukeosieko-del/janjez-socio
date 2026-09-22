'use client';

import { useState, useEffect } from 'react';

interface PayoutRow {
  id: string;
  amount: number;
  mpesa_ref: string | null;
  mpesa_number: string | null;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  paid_at: string | null;
  mpesa_receipt: string | null;
  failure_reason: string | null;
  created_at: string;
  affiliates: {
    id: string;
    affiliate_code: string | null;
    janjez_user_id: string | null;
  } | null;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  pending_admin_approval: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function PayoutQueue() {
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch('/api/admin/affiliate/payouts?status=pending_admin_approval');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setPayouts(data.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleApprove(id: string) {
    setActing(id);
    try {
      const res = await fetch(`/api/admin/affiliate/payouts/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Approve failed');
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setActing(null);
    }
  }

  async function handleReject(id: string) {
    const reason = window.prompt('Rejection reason (optional):') || 'No reason provided';
    if (reason === null) return; // user cancelled
    setActing(id);
    try {
      const res = await fetch(`/api/admin/affiliate/payouts/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Reject failed');
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setActing(null);
    }
  }

  if (loading) {
    return <div className="text-gray-500 py-8 text-center">Loading payout queue...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
        {error}
      </div>
    );
  }

  if (payouts.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
        <p className="text-gray-500">No payouts pending approval.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Pending Payout Requests ({payouts.length})
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-6 py-3 font-medium text-gray-500">Affiliate</th>
              <th className="px-6 py-3 font-medium text-gray-500">Code</th>
              <th className="px-6 py-3 font-medium text-gray-500">Amount</th>
              <th className="px-6 py-3 font-medium text-gray-500">MPesa</th>
              <th className="px-6 py-3 font-medium text-gray-500">Ref</th>
              <th className="px-6 py-3 font-medium text-gray-500">Requested</th>
              <th className="px-6 py-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payouts.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 text-gray-900">
                  {p.affiliates?.janjez_user_id?.slice(0, 8) + '…' || '—'}
                </td>
                <td className="px-6 py-3 text-gray-600 font-mono">
                  {p.affiliates?.affiliate_code || '—'}
                </td>
                <td className="px-6 py-3 font-medium text-gray-900">
                  KES {Number(p.amount).toLocaleString()}
                </td>
                <td className="px-6 py-3 text-gray-600">{p.mpesa_number || '—'}</td>
                <td className="px-6 py-3 text-gray-500 font-mono text-xs">{p.mpesa_ref || '—'}</td>
                <td className="px-6 py-3 text-gray-500">
                  {new Date(p.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(p.id)}
                      disabled={acting === p.id}
                      className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {acting === p.id ? '…' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(p.id)}
                      disabled={acting === p.id}
                      className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      {acting === p.id ? '…' : 'Reject'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}