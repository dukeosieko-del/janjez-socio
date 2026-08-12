import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const count = Math.max(1, Math.min(10, parseInt(searchParams.get("count") || "1", 10)));

    const { data, error } = await supabase
      .from("janjez_services")
      .select("id, name, slug, category, subcategory, is_active, supports_drip_feed, provider_service_id")
      .eq("is_active", true)
      .eq("supports_drip_feed", true)
      .not("provider_service_id", "is", null)
      .order("id", { ascending: false });

    if (error) {
      console.error("Happy Hour service query error:", error);
      return NextResponse.json({ error: "Failed to query services" }, { status: 500 });
    }

    const services = data || [];
    const shuffled = services.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    return NextResponse.json({ services: selected });
  } catch (error) {
    console.error("Happy Hour API error:", error);
    return NextResponse.json({ error: "Failed to find Happy Hour service" }, { status: 500 });
  }
}
