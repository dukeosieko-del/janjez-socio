import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockAdminClient = {
  auth: {
    admin: {
      listUsers: vi.fn(),
      updateUserById: vi.fn(),
    },
  },
  from: vi.fn(),
};

function makeChainable(result: Record<string, unknown> = {}) {
  const chainable = {
    select: vi.fn(() => chainable),
    insert: vi.fn(() => chainable),
    update: vi.fn(() => chainable),
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

vi.mock("@/lib/email/mailer", () => ({
  sendEmail: vi.fn(() => Promise.resolve({ ok: true })),
}));

vi.mock("@/lib/email/config", () => ({
  SITE_NAME: "JANJEZ SOCIO",
  SITE_URL: "https://janjez.social",
}));

const { POST: resetPasswordPost } = await import("@/app/api/auth/reset-password/route");

describe("POST /api/auth/reset-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid email", async () => {
    const req = new Request("http://localhost/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email: "invalid" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await resetPasswordPost(req as unknown as NextRequest);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toBe("A valid email address is required");
  });

  it("returns generic message for non-existent email", async () => {
    mockAdminClient.auth.admin.listUsers.mockResolvedValue({
      data: { users: [] },
    });

    const req = new Request("http://localhost/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email: "nonexistent@example.com" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await resetPasswordPost(req as unknown as NextRequest);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.message).toContain("If an account exists");
  });

  it("creates token and sends email for existing user", async () => {
    mockAdminClient.auth.admin.listUsers.mockResolvedValue({
      data: {
        users: [
          {
            id: "user-123",
            email: "test@example.com",
            user_metadata: { full_name: "Test User" },
          },
        ],
      },
    });
    mockAdminClient.from.mockReturnValue(
      makeChainable({
        insert: vi.fn(() => makeChainable({ error: null })),
      })
    );

    const req = new Request("http://localhost/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await resetPasswordPost(req as unknown as NextRequest);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.message).toContain("If an account exists");
  });

  it("returns 500 if email send fails", async () => {
    mockAdminClient.auth.admin.listUsers.mockResolvedValue({
      data: {
        users: [
          {
            id: "user-123",
            email: "test@example.com",
            user_metadata: { full_name: "Test User" },
          },
        ],
      },
    });
    mockAdminClient.from.mockReturnValue(
      makeChainable({
        insert: vi.fn(() => makeChainable({ error: null })),
      })
    );

    const { sendEmail } = await import("@/lib/email/mailer");
    vi.mocked(sendEmail).mockResolvedValueOnce({ ok: false, error: "SMTP error" });

    const req = new Request("http://localhost/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await resetPasswordPost(req as unknown as NextRequest);
    const data = await res.json();
    expect(res.status).toBe(500);
    expect(data.error).toBe("Failed to send reset email. Please try again later.");
  });
});
