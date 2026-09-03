export type BlogPostStatus = "draft" | "pending" | "published" | "rejected" | "archived";
export type BlogPostVisibility = "public" | "private" | "members";
export type BlogCommentStatus = "pending" | "approved" | "rejected" | "reported" | "removed";

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color_hex: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  author_id: string | null;
  category_id: string | null;
  status: BlogPostStatus;
  visibility: BlogPostVisibility;
  is_featured: boolean;
  reading_time_minutes: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  approved_at: string | null;
  approved_by: string | null;
  rejection_reason: string | null;
  author?: {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
  category?: BlogCategory | null;
  tags?: BlogTag[];
   average_rating?: number | null;
   rating_count?: number;
   user_rating?: number | null;
 }

export interface BlogComment {
  id: string;
  post_id: string;
  parent_id: string | null;
  user_id: string | null;
  author_name: string | null;
  content: string;
  status: BlogCommentStatus;
  is_reported: boolean;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
  replies?: BlogComment[];
}

export interface BlogRating {
  id: string;
  user_id: string;
  post_id: string;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface BlogPostView {
  id: string;
  post_id: string;
  user_id: string | null;
  ip_hash: string | null;
  created_at: string;
}
