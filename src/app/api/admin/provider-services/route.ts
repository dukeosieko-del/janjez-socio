import { NextResponse, NextRequest } from "next/server";
import { listProviderServices } from "@/lib/janjez-services";
import { requireAdmin } from "@/lib/server/auth-helpers";
import { rateLimitAdmin } from "@/lib/server/rate-limiter";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const rl = rateLimitAdmin(request);
  if (!rl.ok && rl.response) return rl.response;

  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const supportsDripFeed = searchParams.get("supports_drip_feed") === "true";

    const services = await listProviderServices({ search, category, supportsDripFeed: supportsDripFeed || undefined });

    return NextResponse.json({ services, count: services.length });
  } catch (error) {
    console.error("Admin provider services error:", error);
    return NextResponse.json({ error: "Failed to load provider services" }, { status: 500 });
  }
}
