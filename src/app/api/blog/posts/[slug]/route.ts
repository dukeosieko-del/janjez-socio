import { NextResponse, NextRequest } from "next/server";
import { getPostBySlug, getCommentsForPost, getPostRatingStats, getUserRating } from "@/lib/blog/queries";
import { blogPosts, getTagsForPost as staticGetTags } from "@/lib/blog/data";
import { getUserFromRequest } from "@/lib/server/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BlogComment, BlogTag } from "@/lib/blog/types";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  try {
    const post = await getPostBySlug(slug);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Get comments
    let comments: BlogComment[] = [];
    try {
      comments = await getCommentsForPost(post.id);
    } catch (commentError) {
      console.error("Failed to fetch comments:", commentError);
    }

    // Get rating stats
    let ratingStats: { average: number | null; count: number } = { average: null, count: 0 };
    try {
      ratingStats = await getPostRatingStats(post.id);
    } catch (ratingError) {
      console.error("Failed to fetch rating stats:", ratingError);
    }

    // Check if user has rated
    const user = await getUserFromRequest(request);
    let userRating: number | null = null;
    if (user) {
      try {
        userRating = await getUserRating(post.id, user.id);
      } catch {
        // ignore
      }
    }

    // Get tags
    let tags: BlogTag[] = [];
    try {
      tags = post.tags || await staticGetTags(slug);
    } catch {
      // fallback to static
    }

    // Fallback if empty
    const tagsResult = tags.length > 0 ? tags : (post.tags || []);

    return NextResponse.json({
      ok: true,
      post: {
        ...post,
        tags: tagsResult,
        average_rating: ratingStats.average,
        rating_count: ratingStats.count,
        user_rating: userRating,
      },
      comments,
    });
  } catch (error) {
    console.error("Blog post API error:", error);

    // Fallback to static data
    const staticPost = blogPosts.find((p) => p.slug === slug);
    if (!staticPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      post: staticPost,
      comments: [],
      source: "static",
    });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const { data: existing, error: fetchError } = await supabase
      .from("blog_posts")
      .select("id, author_id, status")
      .eq("slug", slug)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const isAdmin = user.role === "admin";
    if (existing.author_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const allowedFields = ["title", "excerpt", "content", "category_id", "cover_image_url", "status", "visibility", "is_featured", "reading_time_minutes"];
    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    const { data: post, error: updateError } = await supabase
      .from("blog_posts")
      .update(updates)
      .eq("id", existing.id)
      .select("id, slug, title, status")
      .single();

    if (updateError) {
      return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, post });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const { data: existing, error: fetchError } = await supabase
      .from("blog_posts")
      .select("id, author_id, status")
      .eq("slug", slug)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (existing.author_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (existing.status !== "draft") {
      return NextResponse.json({ error: "Only drafts can be submitted for review" }, { status: 400 });
    }

    const { data: post, error: updateError } = await supabase
      .from("blog_posts")
      .update({ status: "pending" })
      .eq("id", existing.id)
      .select("id, slug, title, status")
      .single();

    if (updateError) {
      return NextResponse.json({ error: "Failed to submit post" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, post });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit post" }, { status: 500 });
  }
}
