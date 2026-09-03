import { NextResponse, NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/server/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCommentsForPost } from "@/lib/blog/queries";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ ok: true, comments: [] });
    }

    const { data: post, error: postError } = await supabase
      .from("blog_posts")
      .select("id")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (postError || !post) {
      return NextResponse.json({ ok: true, comments: [] });
    }

    const comments = await getCommentsForPost(post.id);
    return NextResponse.json({ ok: true, comments });
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return NextResponse.json({ ok: true, comments: [] });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const content = body?.content;
  const parentId = body?.parent_id;

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
  }

  if (content.length > 5000) {
    return NextResponse.json({ error: "Comment too long (max 5000 characters)" }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const { data: post, error: postError } = await supabase
    .from("blog_posts")
    .select("id")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (postError || !post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  let status = "pending";
  if (user.role === "admin" || user.role === "moderator") {
    status = "approved";
  }

  const { data, error } = await supabase
    .from("blog_comments")
    .insert({
      post_id: post.id,
      parent_id: parentId || null,
      user_id: user.id,
      content: content.trim(),
      status,
    })
    .select("id, content, status, created_at")
    .single();

  if (error) {
    console.error("Failed to create comment:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, comment: data });
}
