import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockAdminClient = {
  auth: {
    admin: {
      listUsers: vi.fn(),
      createUser: vi.fn(),
    },
  },
  from: vi.fn(),
};

function makeChainable(result: Record<string, unknown> = {}) {
  const chainable = {
    select: vi.fn(() => chainable),
    insert: vi.fn(() => chainable),
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

vi.mock("@/lib/email/mailer", () => ({
  sendEmail: vi.fn(() => Promise.resolve({ ok: true })),
}));

vi.mock("@/lib/email/config", () => ({
  SITE_NAME: "JANJEZ SOCIO",
  SITE_URL: "https://janjez.social",
}));

const { POST } = await import("@/app/api/auth/send-verification/route");

function mockRequest(body: Record<string, unknown>) {
  const headers = new Headers({ "Content-Type": "application/json" });
  const obj: Record<string, unknown> = {
    json: async () => body,
    headers,
  };
  return obj as unknown as NextRequest;
}

describe("POST /api/auth/send-verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminClient.auth.admin.listUsers.mockResolvedValue({ data: { users: [] } });
    mockAdminClient.from.mockReturnValue(
      makeChainable({
        insert: vi.fn(() => makeChainable({ error: null })),
      })
    );
  });

  it("rejects missing email", async () => {
    const req = mockRequest({});
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toBe("A valid email address is required");
  });

  it("rejects invalid email", async () => {
    const req = mockRequest({ email: "invalid" });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toBe("A valid email address is required");
  });

  it("rejects signup without password", async () => {
    mockAdminClient.auth.admin.listUsers.mockResolvedValue({ data: { users: [] } });
    const req = mockRequest({ email: "test@example.com" });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toBe("Password is required for signup");
  });

  it("rejects short password", async () => {
    const req = mockRequest({ email: "test@example.com", password: "123" });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toBe("Password must be at least 6 characters");
  });

  it("rejects invalid username", async () => {
    const req = mockRequest({ email: "test@example.com", password: "password123", username: "A!" });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toContain("Username must be");
  });

  it("rejects username that is too short", async () => {
    const req = mockRequest({ email: "test@example.com", password: "password123", username: "ab" });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toContain("Username must be");
  });

  it("creates new user with username and updates profile", async () => {
    mockAdminClient.auth.admin.listUsers.mockResolvedValue({ data: { users: [] } });
    mockAdminClient.auth.admin.createUser.mockResolvedValue({
      data: { user: { id: "user-123", email: "test@example.com" } },
      error: null,
    });
    mockAdminClient.from.mockReturnValue(
      makeChainable({
        update: vi.fn(() => makeChainable({ eq: vi.fn(() => makeChainable({ error: null })) })),
      })
    );

    const req = mockRequest({ email: "test@example.com", password: "password123", username: "john_doe" });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(mockAdminClient.auth.admin.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        user_metadata: expect.objectContaining({ username: "john_doe" }),
      })
    );
  });

  it("creates new user without username", async () => {
    mockAdminClient.auth.admin.listUsers.mockResolvedValue({ data: { users: [] } });
    mockAdminClient.auth.admin.createUser.mockResolvedValue({
      data: { user: { id: "user-123", email: "test@example.com" } },
      error: null,
    });

    const req = mockRequest({ email: "test@example.com", password: "password123" });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
  });

  it("creates new user and sends verification", async () => {
    mockAdminClient.auth.admin.listUsers.mockResolvedValue({ data: { users: [] } });
    mockAdminClient.auth.admin.createUser.mockResolvedValue({
      data: { user: { id: "user-123", email: "test@example.com" } },
      error: null,
    });

    const req = mockRequest({ email: "test@example.com", password: "password123" });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.message).toBe("Account created. Check your email to verify.");
  });

  it("allows resend for existing unverified user", async () => {
    mockAdminClient.auth.admin.listUsers.mockResolvedValue({
      data: {
        users: [
          {
            id: "user-123",
            email: "test@example.com",
            email_confirmed_at: null,
            user_metadata: { full_name: "Test User" },
          },
        ],
      },
    });
    mockAdminClient.from.mockReturnValue(
      makeChainable({
        delete: vi.fn(() => makeChainable({ error: null })),
        insert: vi.fn(() => makeChainable({ error: null })),
      })
    );

    const req = mockRequest({ email: "test@example.com", resend: true });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.message).toBe("Verification email sent. Check your inbox.");
  });

  it("rejects resend for already verified user", async () => {
    mockAdminClient.auth.admin.listUsers.mockResolvedValue({
      data: {
        users: [
          {
            id: "user-123",
            email: "test@example.com",
            email_confirmed_at: "2024-01-01T00:00:00Z",
          },
        ],
      },
    });

    const req = mockRequest({ email: "test@example.com", resend: true });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toBe("Email is already verified. You can sign in.");
  });

  it("returns generic message for non-existent email on resend", async () => {
    mockAdminClient.auth.admin.listUsers.mockResolvedValue({ data: { users: [] } });

    const req = mockRequest({ email: "nonexistent@example.com", resend: true });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.message).toContain("If an account exists");
  });

  it("sends new verification for existing unverified user on signup attempt", async () => {
    mockAdminClient.auth.admin.listUsers.mockResolvedValue({
      data: {
        users: [
          {
            id: "user-123",
            email: "test@example.com",
            email_confirmed_at: null,
            user_metadata: { full_name: "Test User" },
          },
        ],
      },
    });
    mockAdminClient.from.mockReturnValue(
      makeChainable({
        delete: vi.fn(() => makeChainable({ error: null })),
        insert: vi.fn(() => makeChainable({ error: null })),
      })
    );

    const req = mockRequest({ email: "test@example.com", password: "password123" });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.message).toContain("verification email has been sent");
  });
});
