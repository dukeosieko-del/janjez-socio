import { NextResponse, NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (admin instanceof Response) return admin;

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const { data, error } = await supabase
      .from("blog_ratings")
      .select("id, rating, created_at, user:profiles!left(id, full_name, email), post:blog_posts!left(id, title)")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: "Failed to fetch ratings" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, ratings: data || [] });
  } catch {
    return NextResponse.json({ error: "Failed to fetch ratings" }, { status: 500 });
  }
}
