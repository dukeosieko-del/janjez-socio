import { NextResponse, NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/server/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: commentId } = await params;

  if (!commentId) {
    return NextResponse.json({ error: "Comment ID is required" }, { status: 400 });
  }

  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const { error } = await supabase
    .from("blog_comments")
    .update({
      is_reported: true,
      status: "reported",
      updated_at: new Date().toISOString(),
    })
    .eq("id", commentId);

  if (error) {
    console.error("Failed to report comment:", error);
    return NextResponse.json({ error: "Failed to report comment" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
