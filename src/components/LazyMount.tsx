"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

interface LazyMountProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function LazyMount({
  children,
  fallback = null,
  rootMargin = "200px",
  triggerOnce = true,
}: LazyMountProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce && node) {
            observer.unobserve(node);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        rootMargin,
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, triggerOnce]);

  return (
    <div ref={ref}>
      {isVisible ? children : fallback}
    </div>
  );
}
