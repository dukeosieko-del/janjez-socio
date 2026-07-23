"use client";

import Link from "next/link";
import Image from "next/image";

export default function AnnouncementBanner() {
  return (
    <div className="w-full bg-kenya-red text-kenya-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-center gap-3">
        <Image
          src="/instagram-icon-tiny.png"
          alt="Instagram"
          width={24}
          height={24}
          className="h-5 w-5 flex-shrink-0"
        />
        <svg
          className="h-5 w-5 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-sm font-medium text-center">
          <strong>Important:</strong> Instagram &quot;Flag for Review&quot; Notice —{" "}
          <Link
            href="/instagram-setup-guide"
            className="underline hover:text-kenya-white/80 font-semibold"
          >
            Learn how to avoid account flags
          </Link>
        </p>
      </div>
    </div>
  );
}
