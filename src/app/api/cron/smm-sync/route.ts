import { NextResponse, NextRequest } from "next/server";
import { syncOrderStatuses } from "@/lib/smm/fulfillment";
import { requireCronSecret } from "@/lib/server/auth-helpers";
import { rateLimitCron } from "@/lib/server/rate-limiter";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const rl = rateLimitCron(request);
  if (!rl.ok && rl.response) return rl.response;

  if (!requireCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await syncOrderStatuses();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("SMM cron sync error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to sync statuses" }, { status: 500 });
  }
}
