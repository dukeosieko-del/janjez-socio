import { NextResponse, NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/server/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { blogPosts } from "@/lib/blog/data";

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { title, excerpt, content, category_id, cover_image_url, tags, status = "draft" } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const { data: post, error } = await supabase
      .from("blog_posts")
      .insert({
        title,
        excerpt: excerpt || null,
        content,
        category_id: category_id || null,
        cover_image_url: cover_image_url || null,
        author_id: user.id,
        status: status === "pending" ? "pending" : "draft",
        visibility: "public",
        slug: `post-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      })
      .select("id, slug, title, status")
      .single();

    if (error) {
        console.error("Failed to create post:", error);
        return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }

    if (tags && Array.isArray(tags) && post) {
      const tagInserts = tags.map((tagId: string) => ({
        post_id: post.id,
        tag_id: tagId,
      }));
      await supabase.from("blog_post_tags").insert(tagInserts);
    }

    return NextResponse.json({ ok: true, post }, { status: 201 });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");

    let query = supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, status, created_at, updated_at, published_at, category:blog_categories!left(id, name, slug)")
      .eq("author_id", user.id)
      .order("created_at", { ascending: false });

    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Failed to fetch posts:", error);
    }

    if (data && data.length > 0) {
      return NextResponse.json({ ok: true, posts: data });
    }
  } catch (error) {
    console.error("Blog posts API error:", error);
  }

  // Fallback to static data
  return NextResponse.json({ ok: true, posts: blogPosts, source: "static" });
}
