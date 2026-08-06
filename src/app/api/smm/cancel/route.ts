import { NextResponse, NextRequest } from "next/server";
import { requestCancel } from "@/lib/smm/fulfillment";
import { requireAdmin, logAdminAction } from "@/lib/server/auth-helpers";
import { rateLimitAdmin } from "@/lib/server/rate-limiter";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const rl = rateLimitAdmin(request);
  if (!rl.ok && rl.response) return rl.response;

  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { orderId } = body as { orderId?: string };

    if (!orderId) {
  
    await logAdminAction({
      actorId: auth.id,
      actorEmail: auth.email,
      action: "provider_order_cancelled",
      targetType: "order",
      request,
    }).catch(() => {});
    return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const result = await requestCancel(orderId);
    return NextResponse.json({ ...result, orderId });
  } catch (error) {
    console.error("SMM cancel error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to request cancel" }, { status: 500 });
  }
}
