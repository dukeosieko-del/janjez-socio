"use client";

import Image from "next/image";

interface ServiceIconProps {
  src: string;
  alt: string;
}

export default function ServiceIcon({ src, alt }: ServiceIconProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={56}
      height={56}
      className="w-14 h-14 object-contain"
    />
  );
}
