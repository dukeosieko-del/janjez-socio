"use client";

import Link from "next/link";
import type { BlogCategory } from "@/lib/blog/types";

interface CategoryNavProps {
  categories: BlogCategory[];
  activeCategory?: string;
}

export default function CategoryNav({ categories, activeCategory = "" }: CategoryNavProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/blog"
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
          !activeCategory
            ? "bg-kenya-green text-kenya-black"
            : "bg-kenya-white/5 text-kenya-white/60 hover:text-kenya-white hover:bg-kenya-white/10"
        }`}
      >
        All
      </Link>
      {categories.map((category) => {
        const isActive = activeCategory === category.slug;
        return (
          <Link
            key={category.id}
            href={`/blog?category=${category.slug}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all`}
            style={{
              backgroundColor: isActive ? category.color_hex : "rgba(255,255,255,0.05)",
              color: isActive ? "#000000" : "rgba(255,255,255,0.6)",
            }}
          >
            {category.name}
          </Link>
        );
      })}
    </div>
  );
}
