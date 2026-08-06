import { describe, it, expect, vi } from "vitest";
import { rateLimit, rateLimitAdmin, rateLimitCron } from "@/lib/server/rate-limiter";

function makeRequest(ip: string = "127.0.0.1"): Request {
  const headers = new Headers();
  headers.set("x-forwarded-for", ip);
  return new Request("https://test.com", { headers });
}

describe("rateLimit", () => {
  it("allows requests within limit", () => {
    const req = makeRequest("1.1.1.1");
    const result = rateLimit(req, 5);
    expect(result.ok).toBe(true);
    expect(result.response).toBeUndefined();
  });

  it("blocks after exceeding limit", () => {
    const req = makeRequest("2.2.2.2");
    rateLimit(req, 3);
    rateLimit(req, 3);
    rateLimit(req, 3);
    const result = rateLimit(req, 3);
    expect(result.ok).toBe(false);
    expect(result.response).toBeDefined();
  });

  it("returns 429 response when rate limited", () => {
    const req = makeRequest("3.3.3.3");
    rateLimit(req, 1);
    const result = rateLimit(req, 1);
    if (!result.ok && result.response) {
      expect(result.response.status).toBe(429);
      expect(result.response.headers.get("Retry-After")).toBeTruthy();
    } else {
      expect.fail("Expected rate limit response");
    }
  });

  it("treats unknown IP as separate bucket", () => {
    const req1 = makeRequest("10.0.0.1");
    const req2 = makeRequest("10.0.0.2");
    const r1 = rateLimit(req1, 1);
    const r2 = rateLimit(req2, 1);
    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
  });

  it("uses default max of 120", () => {
    const req = makeRequest("4.4.4.4");
    for (let i = 0; i < 120; i++) {
      const result = rateLimit(req);
      expect(result.ok).toBe(true);
    }
    const result = rateLimit(req);
    expect(result.ok).toBe(false);
  });

  it("resets window after expiry", () => {
    vi.useFakeTimers();
    const req = makeRequest("5.5.5.5");
    rateLimit(req, 1);
    expect(rateLimit(req, 1).ok).toBe(false);

    vi.advanceTimersByTime(61_000);
    expect(rateLimit(req, 1).ok).toBe(true);
    vi.useRealTimers();
  });
});

describe("rateLimitAdmin", () => {
  it("uses max of 60", () => {
    const req = makeRequest("6.6.6.6");
    for (let i = 0; i < 60; i++) {
      expect(rateLimitAdmin(req).ok).toBe(true);
    }
    expect(rateLimitAdmin(req).ok).toBe(false);
  });
});

describe("rateLimitCron", () => {
  it("uses max of 60", () => {
    const req = makeRequest("7.7.7.7");
    for (let i = 0; i < 60; i++) {
      expect(rateLimitCron(req).ok).toBe(true);
    }
    expect(rateLimitCron(req).ok).toBe(false);
  });
});
