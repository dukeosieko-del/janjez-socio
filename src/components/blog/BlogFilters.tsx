"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Grid, List } from "./icons";

interface BlogFiltersProps {
  currentSort?: string;
  currentView?: "grid" | "list";
  onSortChange?: (sort: string) => void;
  onViewChange?: (view: "grid" | "list") => void;
}

export default function BlogFilters({
  currentSort = "latest",
  currentView = "grid",
  onSortChange,
  onViewChange,
}: BlogFiltersProps) {
  const [internalSort, setInternalSort] = useState(currentSort);
  const [internalView, setInternalView] = useState(currentView);

  useEffect(() => {
    setInternalSort(currentSort);
  }, [currentSort]);

  useEffect(() => {
    setInternalView(currentView);
  }, [currentView]);

  const handleSortChange = (sort: string) => {
    setInternalSort(sort);
    onSortChange?.(sort);
  };

  const handleViewChange = (view: "grid" | "list") => {
    setInternalView(view);
    onViewChange?.(view);
  };

  const sortOptions = [
    { value: "latest", label: "Latest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "top-rated", label: "Top Rated" },
    { value: "most-viewed", label: "Most Viewed" },
  ];

  return (
    <div className="flex items-center justify-between bg-kenya-white/5 border border-kenya-white/10 rounded-xl px-4 py-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-kenya-white/50">Sort by:</span>
          <select
            value={internalSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="text-sm text-kenya-white bg-kenya-black border border-kenya-white/20 rounded-lg px-3 py-1 focus:outline-none focus:border-kenya-green focus:ring-1 focus:ring-kenya-green"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs text-kenya-white/50">View:</span>
          <button
            onClick={() => handleViewChange("grid")}
            className={`p-1.5 rounded-lg transition-all ${
              internalView === "grid"
                ? "bg-kenya-green text-kenya-black"
                : "text-kenya-white/50 hover:text-kenya-white hover:bg-kenya-white/10"
            }`}
            title="Grid view"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleViewChange("list")}
            className={`p-1.5 rounded-lg transition-all ${
              internalView === "list"
                ? "bg-kenya-green text-kenya-black"
                : "text-kenya-white/50 hover:text-kenya-white hover:bg-kenya-white/10"
            }`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-kenya-white/50">Filters:</span>
        <button className="flex items-center gap-1 text-xs text-kenya-white/60 hover:text-kenya-white transition-colors">
          <span>Category</span>
          <ChevronDown className="w-3 h-3" />
        </button>
        <button className="flex items-center gap-1 text-xs text-kenya-white/60 hover:text-kenya-white transition-colors">
          <span>Date</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
