import { NextResponse } from 'next/server';
import { releaseHeldCommissions } from '@/lib/cron/affiliate-hold';
import { syncOrders } from '@/lib/cron/order-sync';

/**
 * Scheduled cron endpoint.
 *
 * Vercel cron config (vercel.json):
 *   /api/cron/affiliate-release  daily at 02:00 UTC
 *   /api/cron/order-sync          every 30 minutes
 *
 * Auth: bearer token must match CRON_SECRET env var.
 */
export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  const expected = process.env.CRON_SECRET;
  if (!expected || auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: Record<string, unknown> = {};

  try {
    await releaseHeldCommissions();
    results.affiliate_release = 'ok';
  } catch (err) {
    results.affiliate_release = err instanceof Error ? err.message : 'unknown';
  }

  try {
    await syncOrders();
    results.order_sync = 'ok';
  } catch (err) {
    results.order_sync = err instanceof Error ? err.message : 'unknown';
  }

  return NextResponse.json({ success: true, results });
}