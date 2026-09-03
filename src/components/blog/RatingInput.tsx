"use client";

import { useState } from "react";
import { Star } from "./icons";

interface RatingInputProps {
  initialValue?: number;
  onSubmit: (rating: number) => Promise<void>;
  onCancel?: () => void;
}

export default function RatingInput({ initialValue, onSubmit, onCancel }: RatingInputProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(initialValue || 0);
  const [submitting, setSubmitting] = useState(false);

  const handleRate = (rating: number) => {
    setSelectedRating(rating);
  };

  const handleSubmit = async () => {
    if (selectedRating === 0 || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(selectedRating);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-4 bg-kenya-white/5 border border-kenya-white/10 rounded-xl p-4">
      <span className="text-sm text-kenya-white/70">Your rating:</span>
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => setHoverRating(0)}
      >
        {[0, 1, 2, 3, 4].map((i) => {
          const filled = i + 1 <= (hoverRating || selectedRating);
          return (
            <Star
              key={i}
              className="w-5 h-5 cursor-pointer transition-all"
              style={{
                fill: filled ? "#00A859" : "transparent",
                color: filled ? "#00A859" : "#404040",
              }}
              onMouseEnter={() => setHoverRating(i + 1)}
              onClick={() => handleRate(i + 1)}
            />
          );
        })}
      </div>
      <button
        onClick={handleSubmit}
        disabled={selectedRating === 0 || submitting}
        className="px-4 py-2 bg-kenya-green text-kenya-black font-bold text-sm rounded-lg hover:bg-kenya-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? "Saving..." : "Submit"}
      </button>
      {onCancel && (
        <button
          onClick={onCancel}
          className="px-4 py-2 text-kenya-white/60 text-sm hover:text-kenya-white transition-colors"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
