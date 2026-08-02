import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { syncProviderCatalog } from "@/lib/smm/fulfillment";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) {
      return auth;
    }

    const catalogResult = await syncProviderCatalog();
    return NextResponse.json({ ok: true, ...catalogResult });
  } catch (err) {
    console.error("SMM catalog sync error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to sync catalog" }, { status: 500 });
  }
}
