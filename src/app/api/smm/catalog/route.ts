import { NextResponse } from "next/server";
import { syncProviderCatalog } from "@/lib/smm/fulfillment";

export const runtime = "nodejs";

export async function POST() {
  try {
    const result = await syncProviderCatalog();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("SMM catalog sync error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to sync catalog" }, { status: 500 });
  }
}
