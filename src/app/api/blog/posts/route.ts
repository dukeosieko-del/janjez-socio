import { NextResponse } from "next/server";
import { getLatestPosts, getFeaturedPosts, getPostsByCategory, searchPosts } from "@/lib/blog/queries";
import { blogPosts } from "@/lib/blog/data";
import type { BlogPostListItem } from "@/lib/blog/queries";

function toListItem(post: typeof blogPosts[0]): BlogPostListItem {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    cover_image_url: post.cover_image_url,
    category: post.category ? {
      id: post.category.id,
      name: post.category.name,
      slug: post.category.slug,
      color_hex: post.category.color_hex,
    } : null,
    tags: post.tags || [],
    author: post.author ? {
      id: post.author.id,
      full_name: post.author.full_name,
      avatar_url: post.author.avatar_url,
    } : null,
    reading_time_minutes: post.reading_time_minutes,
    view_count: post.view_count,
    published_at: post.published_at,
    is_featured: post.is_featured,
    average_rating: post.average_rating ?? null,
    rating_count: post.rating_count ?? 0,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const featured = searchParams.get("featured") === "true";
  const category = searchParams.get("category");
  const search = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") || "12");
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    if (featured) {
      const posts = await getFeaturedPosts(limit);
      return NextResponse.json({ ok: true, posts });
    }

    if (category) {
      const posts = await getPostsByCategory(category, limit, offset);
      return NextResponse.json({ ok: true, posts });
    }

    if (search) {
      const posts = await searchPosts(search, limit);
      return NextResponse.json({ ok: true, posts });
    }

    const posts = await getLatestPosts(limit, offset);
    return NextResponse.json({ ok: true, posts });
  } catch (error) {
    console.error("Blog API error:", error);

    // Fallback to static data
    let staticPosts;
    if (featured) {
      staticPosts = blogPosts.filter((p) => p.is_featured);
    } else if (category) {
      staticPosts = blogPosts.filter((p) => p.category?.slug === category);
    } else if (search) {
      const q = search.toLowerCase();
      staticPosts = blogPosts.filter((p) => 
        p.title.toLowerCase().includes(q) || 
        (p.excerpt?.toLowerCase().includes(q) ?? false)
      );
    } else {
      staticPosts = blogPosts;
    }

    const items = staticPosts.map(toListItem);
    return NextResponse.json({ ok: true, posts: items, source: "static" });
  }
}
