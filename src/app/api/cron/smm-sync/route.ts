import { NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/server/auth";
import { syncOrderStatuses } from "@/lib/smm/fulfillment";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const authError = requireCronSecret(request);
  if (authError) {
    return authError;
  }

  try {
    await syncOrderStatuses();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("SMM cron sync error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to sync statuses" }, { status: 500 });
  }
}
