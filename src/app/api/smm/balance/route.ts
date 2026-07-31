import { NextResponse } from "next/server";
import { getProviderBalance } from "@/lib/smm/provider";

export const runtime = "nodejs";

export async function GET() {
  try {
    const balance = await getProviderBalance();
    return NextResponse.json({ ...balance });
  } catch (error) {
    console.error("SMM balance error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load balance" }, { status: 500 });
  }
}
