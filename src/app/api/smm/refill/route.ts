import { NextResponse, NextRequest } from "next/server";
import { requestRefill } from "@/lib/smm/fulfillment";
import { requireAdmin, logAdminAction } from "@/lib/server/auth-helpers";
import { rateLimitAdmin } from "@/lib/server/rate-limiter";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const rl = rateLimitAdmin(request);
  if (!rl.ok && rl.response) return rl.response;

  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    await logAdminAction({ actor_id: auth.id, actor_email: auth.email, action: "provider_order_refilled" });
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
