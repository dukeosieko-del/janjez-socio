import { NextResponse, NextRequest } from "next/server";
import { syncOrderStatuses } from "@/lib/smm/fulfillment";
import { requireAdmin, logAdminAction } from "@/lib/server/auth-helpers";
import { rateLimitAdmin } from "@/lib/server/rate-limiter";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const rl = rateLimitAdmin(request);
  if (!rl.ok && rl.response) return rl.response;

  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json().catch(() => ({}));
    const orderIds = body?.orderIds as string[] | undefined;

    await syncOrderStatuses(orderIds);

    await logAdminAction({
      actorId: auth.id,
      actorEmail: auth.email,
      action: "provider_status_sync",
      targetType: "provider",
      request,
    }).catch(() => {});
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("SMM status sync error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to sync statuses" }, { status: 500 });
  }
}
