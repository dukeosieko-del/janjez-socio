import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { syncOrderStatuses } from "@/lib/smm/fulfillment";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) {
      return auth;
    }

    const body = await request.json().catch(() => ({}));
    const orderIds = body?.orderIds as string[] | undefined;

    await syncOrderStatuses(orderIds);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("SMM status sync error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to sync statuses" }, { status: 500 });
  }
}
