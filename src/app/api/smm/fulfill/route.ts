import { NextResponse } from "next/server";
import { fulfillOrder } from "@/lib/smm/fulfillment";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId } = body as { orderId?: string };

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const result = await fulfillOrder(orderId);
    return NextResponse.json({ ...result, orderId });
  } catch (error) {
    console.error("SMM fulfill error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fulfill order" }, { status: 500 });
  }
}
