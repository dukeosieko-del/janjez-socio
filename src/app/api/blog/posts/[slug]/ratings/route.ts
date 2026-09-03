import { NextResponse, NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/server/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

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
  const rating = body?.rating;

  if (typeof rating !== "number" || rating < 1.0 || rating > 5.0) {
    return NextResponse.json({ error: "Rating must be a number between 1 and 5" }, { status: 400 });
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

  const { error } = await supabase
    .from("blog_ratings")
    .upsert({
      user_id: user.id,
      post_id: post.id,
      rating: Math.round(rating * 10) / 10,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,post_id" });

  if (error) {
    console.error("Failed to submit rating:", error);
    return NextResponse.json({ error: "Failed to submit rating" }, { status: 500 });
  }

  const stats = await supabase
    .from("blog_ratings")
    .select("rating")
    .eq("post_id", post.id);

  if (stats.data && stats.data.length > 0) {
    const sum = stats.data.reduce((acc: number, r: { rating: number }) => acc + Number(r.rating), 0);
    return NextResponse.json({
      ok: true,
      average: Math.round((sum / stats.data.length) * 10) / 10,
      count: stats.data.length,
    });
  }

  return NextResponse.json({ ok: true });
}
