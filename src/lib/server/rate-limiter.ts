import { NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitOk {
  ok: true;
  response?: undefined;
}

interface RateLimitExceeded {
  ok: false;
  response: NextResponse;
}

type RateLimitResult = RateLimitOk | RateLimitExceeded;

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60_000;
const DEFAULT_MAX = 120;

function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
}

export function rateLimit(request: Request, max: number = DEFAULT_MAX): RateLimitResult {
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

export function rateLimitAdmin(request: Request): RateLimitResult {
  return rateLimit(request, 60);
}

export function rateLimitCron(request: Request): RateLimitResult {
  return rateLimit(request, 60);
}

/**
 * A7c — Per-key rate limiting.
 *
 * Keys on the API key's public identifier (kid) rather than the client IP,
 * so each consumer gets their own quota independent of shared IPs. Falls
 * back to IP-based limiting when no key is present.
 */
export function rateLimitByKey(keyId: string, max: number = DEFAULT_MAX): RateLimitResult {
  const now = Date.now();
  const key = `rl:key:${keyId}`;
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
        { error: 'RATE_LIMITED', message: 'Rate limit exceeded for this API key.', code: 'RATE_LIMITED' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } },
      ),
    };
  }

  entry.count++;
  return { ok: true };
}
