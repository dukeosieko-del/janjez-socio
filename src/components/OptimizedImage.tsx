"use client";

import Image from "next/image";
import { useState } from "react";

const BLUR_DATA_URL = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
  fill?: boolean;
  style?: React.CSSProperties;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = "",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  quality = 80,
  fill = false,
  style,
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <img
        src={src || "/placeholder.png"}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={style}
        loading={priority ? "eager" : "lazy"}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      priority={priority}
      className={className}
      sizes={sizes}
      quality={quality}
      fill={fill}
      style={style}
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      onError={() => setHasError(true)}
      loading={priority ? "eager" : "lazy"}
    />
  );
}

interface OptimizedIconProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
  priority?: boolean;
}

export function OptimizedIcon({
  src,
  alt,
  size = 24,
  className = "",
  priority = false,
}: OptimizedIconProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      className={className}
      sizes={`${size}px`}
      quality={80}
    />
  );
}

interface OptimizedAvatarProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
  priority?: boolean;
}

export function OptimizedAvatar({
  src,
  alt,
  size = 40,
  className = "",
  priority = false,
}: OptimizedAvatarProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      className={`rounded-full object-cover ${className}`}
      sizes={`${size}px`}
      quality={80}
    />
  );
}
