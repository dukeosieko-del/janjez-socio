"use client";

import Link from "next/link";
import Image from "next/image";
import type { BlogPostListItem } from "@/lib/blog/queries";
import { CalendarDays, Clock, Eye, Star } from "./icons";

interface BlogCardProps {
  post: BlogPostListItem;
  featured?: boolean;
  showCategory?: boolean;
  walkthroughTarget?: string;
}

export default function BlogCard({ post, featured = false, showCategory = true, walkthroughTarget }: BlogCardProps) {
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-KE", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const categoryColor = post.category?.color_hex || "#00A859";

  return (
    <Link
      href={`/blog/${post.slug}`}
      data-walkthrough={walkthroughTarget}
      className={`group block bg-kenya-white/5 border border-kenya-white/10 rounded-2xl overflow-hidden hover:border-kenya-green/50 transition-all duration-300 ${
        featured ? "md:flex" : ""
      }`}
    >
      {post.cover_image_url && (
        <div className={`relative overflow-hidden ${featured ? "md:w-48 md:h-auto w-full h-40" : "w-full h-32"}`}>
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes={featured ? "192px" : "400px"}
          />
        </div>
      )}

      <div className={`p-5 ${featured ? "flex-1" : ""}`}>
        <div className="flex items-center gap-2 mb-2">
          {showCategory && post.category && (
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
            >
              {post.category.name}
            </span>
          )}
          {post.is_featured && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-kenya-green/20 text-kenya-green">
              Featured
            </span>
          )}
        </div>

        <h3 className={`font-bold text-kenya-white group-hover:text-kenya-green transition-colors mb-2 line-clamp-2 ${
          featured ? "text-xl" : "text-lg"
        }`}>
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="text-kenya-white/60 text-sm leading-relaxed mb-3 line-clamp-2">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-kenya-white/50">
          <div className="flex items-center gap-4">
            {date && (
              <span className="flex items-center gap-1">
                <CalendarDays className="w-3 h-3" />
                {date}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.reading_time_minutes} min read
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {post.view_count}
            </span>
          </div>

          {post.average_rating !== null && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-kenya-green text-kenya-green" />
              {post.average_rating.toFixed(1)} ({post.rating_count})
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
