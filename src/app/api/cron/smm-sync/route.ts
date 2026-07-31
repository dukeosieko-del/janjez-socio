import { NextResponse } from "next/server";
import { syncOrderStatuses } from "@/lib/smm/fulfillment";

export const runtime = "nodejs";

export async function POST() {
  try {
    await syncOrderStatuses();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("SMM cron sync error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to sync statuses" }, { status: 500 });
  }
}
