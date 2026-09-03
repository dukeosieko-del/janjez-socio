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

  const body = await request.json().catch(() => null);
  const content = body?.content;

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "Reply content is required" }, { status: 400 });
  }

  if (content.length > 5000) {
    return NextResponse.json({ error: "Reply too long (max 5000 characters)" }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const { data: parentComment, error: parentError } = await supabase
    .from("blog_comments")
    .select("post_id")
    .eq("id", commentId)
    .single();

  if (parentError || !parentComment) {
    return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
  }

  let status = "pending";
  if (user.role === "admin" || user.role === "moderator") {
    status = "approved";
  }

  const { data, error } = await supabase
    .from("blog_comments")
    .insert({
      post_id: parentComment.post_id,
      parent_id: commentId,
      user_id: user.id,
      content: content.trim(),
      status,
    })
    .select("id, content, status, created_at")
    .single();

  if (error) {
    console.error("Failed to create reply:", error);
    return NextResponse.json({ error: "Failed to create reply" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, comment: data });
}
