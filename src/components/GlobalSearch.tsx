"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { PLATFORMS } from "@/lib/data";
import { getServiceCatalogue } from "@/lib/service-queries";

interface SearchResult {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: string;
  type: "platform" | "service";
}

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [services, setServices] = useState<SearchResult[]>([]);

  useEffect(() => {
    getServiceCatalogue().then((data) => {
      const serviceResults: SearchResult[] = data.map((s) => ({
        id: s.id,
        name: s.name,
        description: `KES ${s.rate.toFixed(2)}/1k • Min: ${s.min} • Max: ${s.max.toLocaleString()}`,
        href: `/order?service=${s.id}`,
        icon: "📦",
        type: "service" as const,
      }));
      setServices(serviceResults);
    }).catch(() => setServices([]));
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.trim().length === 0) {
      setResults([]);
      return;
    }
    const q = value.toLowerCase();
    const platformResults: SearchResult[] = PLATFORMS.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      href: p.href,
      icon: p.icon,
      type: "platform" as const,
    }));

    const all = [...platformResults, ...services];
    const filtered = all.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
    setResults(filtered.slice(0, 10));
  };

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative">
        <input
          type="text"
          placeholder="Search platforms & services..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full bg-kenya-black border border-kenya-white/20 rounded-lg pl-10 pr-4 py-2.5 text-kenya-white placeholder-kenya-white/40 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green transition-all"
        />
        <svg
          className="absolute left-3 top-3 h-5 w-5 text-kenya-white/40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      {results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-kenya-black border border-kenya-white/20 rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {results.map((result) => (
            <Link
              key={result.id}
              href={result.href}
              className="flex items-center gap-3 px-4 py-3 hover:bg-kenya-white/5 transition-colors border-b border-kenya-white/5 last:border-0"
            >
              {(result.icon.startsWith("/") || result.icon.startsWith("http")) ? (
                <Image src={result.icon} alt={result.name} width={24} height={24} className="w-6 h-6 object-contain" />
              ) : (
                <span className="text-2xl leading-none">{result.icon}</span>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-kenya-white truncate">{result.name}</span>
                  <span className="text-[10px] uppercase tracking-wider bg-kenya-white/10 text-kenya-white/50 px-1.5 py-0.5 rounded">
                    {result.type}
                  </span>
                </div>
                <div className="text-xs text-kenya-white/50 line-clamp-1">
                  {result.description}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
