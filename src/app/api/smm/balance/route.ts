import { NextResponse, NextRequest } from "next/server";
import { getProviderBalance } from "@/lib/smm/provider";
import { requireAdmin, logAdminAction } from "@/lib/server/auth-helpers";
import { rateLimitAdmin } from "@/lib/server/rate-limiter";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const rl = rateLimitAdmin(request);
  if (!rl.ok && rl.response) return rl.response;

  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    await logAdminAction({ actor_id: auth.id, actor_email: auth.email, action: "provider_balance_viewed" });
    const balance = await getProviderBalance();
    return NextResponse.json({ ...balance });
  } catch (error) {
    console.error("SMM balance error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load balance" }, { status: 500 });
  }
}
