import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin/auth';
import { rejectPayout } from '@/lib/affiliate/payout';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const reason = body.reason ?? 'No reason provided';
    const payout = await rejectPayout(id, body.rejected_by ?? 'admin', reason);
    return NextResponse.json({ success: true, data: payout });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown';
    const status = message.includes('cannot reject') ? 422 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}