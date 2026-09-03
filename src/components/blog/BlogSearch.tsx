"use client";

import { Search } from "./icons";

interface BlogSearchProps {
  initialValue?: string;
  placeholder?: string;
}

export default function BlogSearch({ initialValue = "", placeholder = "Search articles..." }: BlogSearchProps) {
  return (
    <form
      action="/blog"
      method="GET"
      className="relative max-w-md"
    >
      <input
        type="search"
        name="q"
        defaultValue={initialValue}
        placeholder={placeholder}
        className="w-full bg-kenya-white/5 border border-kenya-white/20 rounded-xl px-4 py-2.5 text-kenya-white placeholder-kenya-white/40 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all"
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-kenya-white/40 hover:text-kenya-white transition-colors"
      >
        <Search className="w-4 h-4" />
      </button>
    </form>
  );
}
