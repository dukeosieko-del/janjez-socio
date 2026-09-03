"use client";

import { Star } from "./icons";

interface RatingStarsProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
  showCount?: boolean;
  count?: number;
  onRate?: (rating: number) => void;
}

const sizeClasses = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

export default function RatingStars({
  rating,
  size = "md",
  readOnly = true,
  showCount = false,
  count = 0,
  onRate,
}: RatingStarsProps) {
  const starSize = sizeClasses[size];

  const handleRate = (index: number) => {
    if (!readOnly && onRate) {
      onRate(index + 1);
    }
  };

  const getStarFill = (index: number) => {
    const filled = index + 1 <= rating;
    const halfFilled = index + 1 - 0.5 === rating;
    if (filled) return "fill-kenya-green text-kenya-green";
    if (halfFilled) return "fill-kenya-green/50 text-kenya-green";
    return "fill-transparent text-kenya-white/20";
  };

  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className={`${starSize} ${getStarFill(i)} ${!readOnly ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
          onClick={() => handleRate(i)}
        />
      ))}
      {showCount && count > 0 && (
        <span className="text-xs text-kenya-white/50 ml-1">
          ({count})
        </span>
      )}
    </div>
  );
}
