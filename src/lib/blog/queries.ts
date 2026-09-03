import { createAdminClient } from "@/lib/supabase/admin";
import type { BlogPost, BlogCategory, BlogTag, BlogComment } from "./types";

const DEFAULT_LIMIT = 12;

export interface BlogPostListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  category: { id: string; name: string; slug: string; color_hex: string } | null;
  tags: BlogTag[];
  author: { id: string; full_name: string | null; avatar_url: string | null } | null;
  reading_time_minutes: number;
  view_count: number;
  published_at: string | null;
  is_featured: boolean;
  average_rating: number | null;
  rating_count: number;
}

export async function getCategories(): Promise<BlogCategory[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("blog_categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error || !data) return [];
  return data as BlogCategory[];
}

export async function getTags(): Promise<BlogTag[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("blog_tags")
    .select("*")
    .order("name", { ascending: true });

  if (error || !data) return [];
  return data as BlogTag[];
}

export async function getTagsForPost(postId: string): Promise<BlogTag[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("blog_post_tags")
    .select("blog_tags!inner(*)")
    .eq("post_id", postId);

  if (error || !data) return [];
  return (data as unknown as Array<{ blog_tags: BlogTag }>).map((row) => row.blog_tags);
}

export async function getFeaturedPosts(limit = 3): Promise<BlogPostListItem[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("blog_posts")
    .select(`
      id, slug, title, excerpt, cover_image_url, reading_time_minutes,
      view_count, published_at, is_featured,
      category:blog_categories!left(id, name, slug, color_hex),
      author:profiles!left(id, full_name, avatar_url),
      blog_post_tags!left(tag_id)
    `)
    .eq("status", "published")
    .eq("is_featured", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return transformPosts(data);
}

export async function getLatestPosts(
  limit = DEFAULT_LIMIT,
  offset = 0
): Promise<BlogPostListItem[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("blog_posts")
    .select(`
      id, slug, title, excerpt, cover_image_url, reading_time_minutes,
      view_count, published_at, is_featured,
      category:blog_categories!left(id, name, slug, color_hex),
      author:profiles!left(id, full_name, avatar_url),
      blog_post_tags!left(tag_id)
    `)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !data) return [];
  return transformPosts(data);
}

export async function getPostsByCategory(
  categorySlug: string,
  limit = DEFAULT_LIMIT,
  offset = 0
): Promise<BlogPostListItem[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("blog_posts")
    .select(`
      id, slug, title, excerpt, cover_image_url, reading_time_minutes,
      view_count, published_at, is_featured,
      category:blog_categories!left(id, name, slug, color_hex),
      author:profiles!left(id, full_name, avatar_url),
      blog_post_tags!left(tag_id)
    `)
    .eq("status", "published")
    .eq("category.slug", categorySlug)
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !data) return [];
  return transformPosts(data);
}

export async function searchPosts(query: string, limit = DEFAULT_LIMIT): Promise<BlogPostListItem[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("blog_posts")
    .select(`
      id, slug, title, excerpt, cover_image_url, reading_time_minutes,
      view_count, published_at, is_featured,
      category:blog_categories!left(id, name, slug, color_hex),
      author:profiles!left(id, full_name, avatar_url),
      blog_post_tags!left(tag_id)
    `)
    .eq("status", "published")
    .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return transformPosts(data);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;

  const { data: post, error: postError } = await supabase
    .from("blog_posts")
    .select(`
      *,
      author:profiles!left(id, email, full_name, avatar_url),
      category:blog_categories!left(*)
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (postError || !post) return null;

  const tags = await getTagsForPost(post.id);
  const ratingStats = await getPostRatingStats(post.id);

  return {
    ...post,
    tags,
    average_rating: ratingStats.average,
    rating_count: ratingStats.count,
  } as BlogPost;
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;

  const { data: post, error: postError } = await supabase
    .from("blog_posts")
    .select(`
      *,
      author:profiles!left(id, email, full_name, avatar_url),
      category:blog_categories!left(*)
    `)
    .eq("id", id)
    .single();

  if (postError || !post) return null;

  const tags = await getTagsForPost(post.id);

  return {
    ...post,
    tags,
  } as BlogPost;
}

export async function getPostRatingStats(postId: string): Promise<{ average: number | null; count: number }> {
  const supabase = createAdminClient();
  if (!supabase) return { average: null, count: 0 };

  const { data: ratings, error } = await supabase
    .from("blog_ratings")
    .select("rating")
    .eq("post_id", postId);

  if (error || !ratings || ratings.length === 0) return { average: null, count: 0 };

  const sum = ratings.reduce((acc: number, r: { rating: number }) => acc + Number(r.rating), 0);
  return {
    average: Math.round((sum / ratings.length) * 10) / 10,
    count: ratings.length,
  };
}

export async function getCommentsForPost(postId: string): Promise<BlogComment[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("blog_comments")
    .select(`
      *,
      author:profiles!left(id, full_name, avatar_url)
    `)
    .eq("post_id", postId)
    .eq("status", "approved")
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  const comments = data as BlogComment[];
  return nestComments(comments);
}

function nestComments(comments: BlogComment[]): BlogComment[] {
  const commentMap = new Map<string, BlogComment>();
  const rootComments: BlogComment[] = [];

  comments.forEach((c) => {
    commentMap.set(c.id, { ...c, replies: [] });
  });

  comments.forEach((c) => {
    const comment = commentMap.get(c.id)!;
    if (c.parent_id && commentMap.has(c.parent_id)) {
      commentMap.get(c.parent_id)!.replies!.push(comment);
    } else {
      rootComments.push(comment);
    }
  });

  return rootComments;
}

export async function incrementViewCount(postId: string): Promise<void> {
  const supabase = createAdminClient();
  if (!supabase) return;

  await supabase.rpc("increment_blog_view", { p_post_id: postId });
}

export async function getUserRating(postId: string, userId: string): Promise<number | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("blog_ratings")
    .select("rating")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;
  return Number(data.rating);
}

function transformPosts(data: Record<string, unknown>[]): BlogPostListItem[] {
  return data.map((post) => {
    const tags = [];
    if (post.blog_post_tags) {
      const tagRows = post.blog_post_tags as Array<{ tag_id: { id: string; name: string; slug: string } }>;
      tags.push(...tagRows.filter((t) => t.tag_id).map((t) => t.tag_id));
    }

    const category = post.category as { id: string; name: string; slug: string; color_hex: string } | null;
    const author = post.author as { id: string; full_name: string | null; avatar_url: string | null } | null;

    return {
      id: post.id as string,
      slug: post.slug as string,
      title: post.title as string,
      excerpt: post.excerpt as string | null,
      cover_image_url: post.cover_image_url as string | null,
      category: category ? { id: category.id, name: category.name, slug: category.slug, color_hex: category.color_hex } : null,
      tags,
      author: author ? { id: author.id, full_name: author.full_name, avatar_url: author.avatar_url } : null,
      reading_time_minutes: post.reading_time_minutes as number,
      view_count: post.view_count as number,
      published_at: post.published_at as string | null,
      is_featured: post.is_featured as boolean,
      average_rating: null,
      rating_count: 0,
    };
  });
}
