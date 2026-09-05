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
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all";

    if (type === "comments" || type === "all") {
      const { data: comments, error: commentsError } = await supabase
        .from("blog_comments")
        .select("id, content, status, is_reported, created_at, user_id, post_id, author_name")
        .eq("is_reported", true)
        .order("created_at", { ascending: false });

      if (commentsError) {
        return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
      }

      return NextResponse.json({ ok: true, reports: comments || [] });
    }

    return NextResponse.json({ ok: true, reports: [] });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
