import { NextRequest } from "next/server";
import { businessError } from "./response";

const WINDOW_MS = 60 * 1000;
const DEFAULT_LIMIT = 120;
const requests = new Map<string, number[]>();

export function businessRateLimit(request: NextRequest, limit = DEFAULT_LIMIT) {
  const now = Date.now();
  const apiKey = request.headers.get("x-business-side-api-key") || request.ip || "unknown";
  const key = `${request.ip || "unknown"}:${apiKey}`;
  const recent = (requests.get(key) || []).filter((timestamp) => now - timestamp < WINDOW_MS);
  if (recent.length >= limit) {
    requests.set(key, recent);
    return {
      ok: false as const,
      response: businessError("RATE_LIMITED", "Business Side API rate limit exceeded.", 429),
    };
  }
  recent.push(now);
  requests.set(key, recent);
  return { ok: true as const };
}

export function clearBusinessRateLimitForTests() {
  requests.clear();
}
