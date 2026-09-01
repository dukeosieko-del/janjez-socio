interface SkeletonProps {
  variant?: "text" | "circle" | "rectangle" | "card";
  size?: "sm" | "md" | "lg" | "full";
  className?: string;
}

export function Skeleton({ variant = "rectangle", size = "md", className = "" }: SkeletonProps) {
  const base = "animate-pulse bg-kenya-white/10";

  const variantClasses = {
    text: "h-4 rounded",
    circle: "rounded-full",
    rectangle: "rounded-md",
    card: "rounded-lg",
  };

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    full: "h-full w-full",
  };

  const sizeOverrides: Record<string, string> = {
    "text-sm": "h-4 w-3/4",
    "text-full": "h-4 w-full",
    "circle-sm": "h-4 w-4",
    "circle-md": "h-8 w-8",
    "circle-lg": "h-12 w-12",
  };

  const overrideKey = `${variant}-${size}`;
  const overrideClass = sizeOverrides[overrideKey] || "";

  return (
    <div
      className={`${base} ${variantClasses[variant]} ${overrideClass || sizeClasses[size]} ${className}`}
    />
  );
}
