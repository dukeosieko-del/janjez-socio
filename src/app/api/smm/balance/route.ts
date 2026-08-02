import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { getProviderBalance } from "@/lib/smm/provider";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) {
      return auth;
    }

    const balance = await getProviderBalance();
    return NextResponse.json({ ...balance });
  } catch (err) {
    console.error("SMM balance error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to load balance" }, { status: 500 });
  }
}
