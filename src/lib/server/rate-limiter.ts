import { NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store with periodic cleanup to prevent unbounded growth.
// WARNING: Not suitable for multi-instance/cluster deployments.
// For production with multiple workers, replace this with a Redis-backed store
// (e.g., @upstash/rate-limiter or rate-limiter-redis).
const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60_000;
const DEFAULT_MAX = 120;

// Evict expired entries every 5 minutes to prevent memory leaks.
let cleanupTimer: ReturnType<typeof setInterval> | null = null;
function ensureCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt < now) store.delete(key);
    }
  }, 5 * 60 * 1000);
  if (typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
    cleanupTimer.unref();
  }
}
ensureCleanup();

function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export function rateLimit(request: Request, max: number = DEFAULT_MAX) {
  const ip = getClientIp(request);
  const now = Date.now();
  const key = `rl:${ip}`;
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }

  if (entry.count >= max) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": String(max),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(entry.resetAt / 1000)),
          },
        }
      ),
    };
  }

  entry.count += 1;
  return {
    ok: true,
    remaining: max - entry.count,
    resetAt: entry.resetAt,
  };
}

export function rateLimitAdmin(request: Request) {
  return rateLimit(request, 60);
}

export function rateLimitCron(request: Request) {
  return rateLimit(request, 60);
}

export function rateLimitAuth(request: Request) {
  return rateLimit(request, 10);
}