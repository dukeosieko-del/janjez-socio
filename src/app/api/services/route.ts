import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "";
    const search = searchParams.get("search") || "";

    let query = supabase
      .from("janjez_services")
      .select("*, provider_service:provider_services(*)")
      .eq("is_active", true);

    if (category) {
      query = query.ilike("category", `%${category}%`);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query.order("display_order", { ascending: true }).order("name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ services: data || [] });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load services" }, { status: 500 });
  }
}
