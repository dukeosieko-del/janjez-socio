import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockAdminClient = {
  auth: {
    admin: {
      updateUserById: vi.fn(),
    },
  },
  from: vi.fn(),
};

function makeChainable(result: Record<string, unknown> = {}) {
  const chainable = {
    select: vi.fn(() => chainable),
    delete: vi.fn(() => chainable),
    eq: vi.fn(() => chainable),
    single: vi.fn(() => chainable),
    ...result,
  };
  return chainable;
}

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => mockAdminClient),
}));

vi.mock("@/lib/server/rate-limiter", () => ({
  rateLimit: vi.fn(() => ({ ok: true })),
}));

const { GET } = await import("@/app/api/auth/verify-email/route");

describe("GET /api/auth/verify-email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects missing token", async () => {
    const req = new Request("http://localhost/api/auth/verify-email", {
      method: "GET",
    });
    const res = await GET(req as unknown as NextRequest);
    expect([302, 307]).toContain(res.status);
    const location = res.headers.get("location");
    expect(location).toContain("error=missing_token");
  });

  it("rejects invalid token", async () => {
    mockAdminClient.from.mockReturnValue(
      makeChainable({
        select: vi.fn(() => makeChainable({ single: vi.fn(() => ({ data: null, error: { message: "not found" } })) })),
      })
    );

    const req = new Request("http://localhost/api/auth/verify-email?token=invalid", {
      method: "GET",
    });
    const res = await GET(req as unknown as NextRequest);
    expect([302, 307]).toContain(res.status);
    const location = res.headers.get("location");
    expect(location).toContain("error=invalid_token");
  });

  it("rejects expired token", async () => {
    const expiredDate = new Date(Date.now() - 1000).toISOString();
    mockAdminClient.from.mockReturnValueOnce(
      makeChainable({
        select: vi.fn(() => makeChainable({
          single: vi.fn(() => ({ data: { id: "v1", user_id: "u1", expires_at: expiredDate }, error: null })),
        })),
      })
    ).mockReturnValueOnce(
      makeChainable({
        delete: vi.fn(() => makeChainable({ error: null })),
      })
    );

    const req = new Request("http://localhost/api/auth/verify-email?token=expired", {
      method: "GET",
    });
    const res = await GET(req as unknown as NextRequest);
    expect([302, 307]).toContain(res.status);
    const location = res.headers.get("location");
    expect(location).toContain("error=token_expired");
  });

  it("confirms valid token and marks email verified", async () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60).toISOString();
    mockAdminClient.from.mockReturnValueOnce(
      makeChainable({
        select: vi.fn(() => makeChainable({
          single: vi.fn(() => ({ data: { id: "v1", user_id: "u1", expires_at: futureDate }, error: null })),
        })),
      })
    ).mockReturnValueOnce(
      makeChainable({
        select: vi.fn(() => makeChainable({
          single: vi.fn(() => ({ data: { id: "u1", email: "test@example.com", email_verified: false }, error: null })),
        })),
      })
    ).mockReturnValueOnce(
      makeChainable({
        delete: vi.fn(() => makeChainable({ error: null })),
      })
    );

    mockAdminClient.auth.admin.updateUserById.mockResolvedValue({ error: null });

    const req = new Request("http://localhost/api/auth/verify-email?token=valid", {
      method: "GET",
    });
    const res = await GET(req as unknown as NextRequest);
    expect([302, 307]).toContain(res.status);
    const location = res.headers.get("location");
    expect(location).toContain("verified=1");
    expect(decodeURIComponent(location || "")).toContain("test@example.com");
  });

  it("handles already verified user", async () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60).toISOString();
    mockAdminClient.from.mockReturnValueOnce(
      makeChainable({
        select: vi.fn(() => makeChainable({
          single: vi.fn(() => ({ data: { id: "v1", user_id: "u1", expires_at: futureDate }, error: null })),
        })),
      })
    ).mockReturnValueOnce(
      makeChainable({
        select: vi.fn(() => makeChainable({
          single: vi.fn(() => ({ data: { id: "u1", email: "test@example.com", email_verified: true }, error: null })),
        })),
      })
    ).mockReturnValueOnce(
      makeChainable({
        delete: vi.fn(() => makeChainable({ error: null })),
      })
    );

    const req = new Request("http://localhost/api/auth/verify-email?token=valid", {
      method: "GET",
    });
    const res = await GET(req as unknown as NextRequest);
    expect([302, 307]).toContain(res.status);
    const location = res.headers.get("location");
    expect(location).toContain("verified=1");
  });
});
