import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { fulfillOrder } from "@/lib/smm/fulfillment";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) {
      return auth;
    }

    const body = await request.json();
    const { orderId } = body as { orderId?: string };

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const fulfillmentResult = await fulfillOrder(orderId);
    return NextResponse.json({ ...fulfillmentResult, orderId });
  } catch (err) {
    console.error("SMM fulfill error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to fulfill order" }, { status: 500 });
  }
}
