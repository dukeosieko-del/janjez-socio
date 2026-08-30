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
    update: vi.fn(() => chainable),
    eq: vi.fn(() => chainable),
    gt: vi.fn(() => chainable),
    select: vi.fn(() => ({
      single: vi.fn(() => ({ data: result.data ?? null, error: result.error ?? null })),
    })),
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

const { POST } = await import("@/app/api/auth/set-password/route");

describe("POST /api/auth/set-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects missing token", async () => {
    const req = new Request("http://localhost/api/auth/set-password", {
      method: "POST",
      body: JSON.stringify({ password: "newpassword123" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req as unknown as NextRequest);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toBe("Reset token is required");
  });

  it("rejects short password", async () => {
    const req = new Request("http://localhost/api/auth/set-password", {
      method: "POST",
      body: JSON.stringify({ token: "token123", password: "123" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req as unknown as NextRequest);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toBe("Password must be at least 6 characters");
  });

  it("rejects invalid token", async () => {
    mockAdminClient.from.mockReturnValue(
      makeChainable({ data: null, error: { message: "not found" } })
    );

    const req = new Request("http://localhost/api/auth/set-password", {
      method: "POST",
      body: JSON.stringify({ token: "invalid", password: "newpassword123" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req as unknown as NextRequest);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toBe("Invalid or expired reset token");
  });

  it("consumes token atomically and updates password", async () => {
    mockAdminClient.from.mockReturnValue(
      makeChainable({ data: { user_id: "user-123" } })
    );

    mockAdminClient.auth.admin.updateUserById.mockResolvedValue({ error: null });

    const req = new Request("http://localhost/api/auth/set-password", {
      method: "POST",
      body: JSON.stringify({ token: "valid-token", password: "newpassword123" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req as unknown as NextRequest);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.message).toBe("Password updated successfully");
  });

  it("fails if password update fails", async () => {
    mockAdminClient.from.mockReturnValue(
      makeChainable({ data: { user_id: "user-123" } })
    );

    mockAdminClient.auth.admin.updateUserById.mockResolvedValue({
      error: { message: "Auth error" },
    });

    const req = new Request("http://localhost/api/auth/set-password", {
      method: "POST",
      body: JSON.stringify({ token: "valid-token", password: "newpassword123" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req as unknown as NextRequest);
    const data = await res.json();
    expect(res.status).toBe(500);
    expect(data.error).toBe("Failed to update password");
  });
});
