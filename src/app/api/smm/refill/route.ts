import { NextResponse } from "next/server";
import { requestRefill } from "@/lib/smm/fulfillment";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId } = body as { orderId?: string };

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const result = await requestRefill(orderId);
    return NextResponse.json({ ...result, orderId });
  } catch (error) {
    console.error("SMM refill error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to request refill" }, { status: 500 });
  }
}
