import { NextResponse, NextRequest } from "next/server";
import { syncProviderCatalog } from "@/lib/smm/fulfillment";
import { requireAdmin, logAdminAction } from "@/lib/server/auth-helpers";
import { rateLimitAdmin } from "@/lib/server/rate-limiter";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const rl = rateLimitAdmin(request);
  if (!rl.ok && rl.response) return rl.response;

  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const result = await syncProviderCatalog();

    await logAdminAction({
      actorId: auth.id,
      actorEmail: auth.email,
      action: "provider_catalog_sync",
      targetType: "provider",
      request,
    }).catch(() => {});
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("SMM catalog sync error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to sync catalog" }, { status: 500 });
  }
}
