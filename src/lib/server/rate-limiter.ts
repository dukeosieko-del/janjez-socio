import { NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60_000;
const DEFAULT_MAX = 120;

function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
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
        { error: "Rate limit exceeded" },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      ),
    };
  }

  entry.count++;
  return { ok: true };
}

export function rateLimitAdmin(request: Request) {
  return rateLimit(request, 60);
}

export function rateLimitCron(request: Request) {
  return rateLimit(request, 60);
}
