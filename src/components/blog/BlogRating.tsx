"use client";

import { useState } from "react";
import RatingStars from "./RatingStars";
import RatingInput from "./RatingInput";
import type { BlogPost } from "@/lib/blog/types";

interface BlogRatingProps {
  post: BlogPost;
  initialUserRating: number | null;
  initialAverage: number | null;
  initialCount: number;
}

export default function BlogRating({
  post,
  initialUserRating,
  initialAverage,
  initialCount,
}: BlogRatingProps) {
  const [userRating, setUserRating] = useState<number | null>(initialUserRating);
  const [average, setAverage] = useState<number | null>(initialAverage);
  const [count, setCount] = useState(initialCount);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitRating = async (rating: number) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/blog/posts/${post.slug}/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit rating");
        return;
      }
      setUserRating(rating);
      if (data.average !== undefined) setAverage(data.average);
      if (data.count !== undefined) setCount(data.count);
    } catch {
      setError("Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center gap-4">
        <RatingStars rating={average ?? 0} showCount count={count} />
        {average !== null && (
          <span className="text-sm text-kenya-white/60">
            {average.toFixed(1)} / 5 ({count} ratings)
          </span>
        )}
      </div>

      {userRating ? (
        <div className="mt-4">
          <RatingStars rating={userRating} size="lg" readOnly={false} onRate={handleSubmitRating} />
          <span className="text-xs text-kenya-white/40 ml-2">Your rating: {userRating.toFixed(1)}</span>
        </div>
      ) : (
        <div className="mt-4">
          <RatingInput
            onSubmit={handleSubmitRating}
            onCancel={() => {}}
          />
          {submitting && <span className="text-xs text-kenya-white/40">Saving...</span>}
        </div>
      )}

      {error && <p className="text-xs text-kenya-red mt-2">{error}</p>}
    </div>
  );
}
