import { NextResponse } from "next/server";
import { syncOrderStatuses } from "@/lib/smm/fulfillment";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const orderIds = body?.orderIds as string[] | undefined;

    await syncOrderStatuses(orderIds);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("SMM status sync error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to sync statuses" }, { status: 500 });
  }
}
