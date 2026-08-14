import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const platformId = searchParams.get("platform_id");
  const subcategory = searchParams.get("subcategory");

  let query = supabase
    .from("janjez_services")
    .select("*")
    .eq("published", true)
    .order("display_order", { ascending: true });

  if (platformId) query = query.eq("platform_id", platformId);
  if (subcategory) query = query.eq("subcategory", subcategory);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ services: data || [] });
}
