import { isAdmin } from '@/lib/admin/auth';
import { redirect } from 'next/navigation';
import PayoutQueue from '@/components/admin/PayoutQueue';

export default async function WithdrawalsPage() {
  const admin = await isAdmin();
  if (!admin) redirect('/');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Withdrawal Queue</h1>
      <p className="text-gray-600 mb-6">Review and approve affiliate payout requests.</p>
      <PayoutQueue />
    </div>
  );
}