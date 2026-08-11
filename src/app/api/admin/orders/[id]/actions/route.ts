import { NextResponse, NextRequest } from "next/server";
import { cancelOrder, refillOrder } from "@/lib/smm/fulfillment";
import { requireAdmin } from "@/lib/server/auth-helpers";
import { rateLimitAdmin } from "@/lib/server/rate-limiter";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const rl = rateLimitAdmin(request);
  if (!rl.ok && rl.response) return rl.response;

  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { action, order_id } = body as { action?: string; order_id?: string };

    if (!order_id) {
      return NextResponse.json({ error: "order_id is required" }, { status: 400 });
    }

    let result: unknown;
    if (action === "cancel") {
      result = await cancelOrder(order_id);
    } else if (action === "refill") {
      result = await refillOrder(order_id);
    } else {
      return NextResponse.json({ error: "Invalid action. Use 'cancel' or 'refill'." }, { status: 400 });
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Admin order action error:", error);
    return NextResponse.json({ error: "Failed to process action" }, { status: 500 });
  }
}
