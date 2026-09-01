import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockAdminClient = {
  from: vi.fn(),
};

function makeChainable(result: Record<string, unknown> = {}) {
  const chainable: Record<string, unknown> = {
    select: vi.fn(() => chainable),
    insert: vi.fn(() => chainable),
    update: vi.fn(() => chainable),
    eq: vi.fn(() => chainable),
    in: vi.fn(() => chainable),
    order: vi.fn(() => chainable),
    range: vi.fn(() => chainable),
    upsert: vi.fn(() => chainable),
    not: vi.fn(() => chainable),
    ilike: vi.fn(() => chainable),
    neq: vi.fn(() => chainable),
    head: vi.fn(() => chainable),
    limit: vi.fn(() => chainable),
    single: vi.fn(() => chainable),
    is: vi.fn(() => chainable),
    lt: vi.fn(() => chainable),
  };
  Object.assign(chainable, result);
  return chainable;
}

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => mockAdminClient),
}));

vi.mock("@/lib/server/auth-helpers", () => ({
  getUserFromRequest: vi.fn(),
  requireAdmin: vi.fn(),
  requireCronSecret: vi.fn(),
}));

vi.mock("@/lib/server/rate-limiter", () => ({
  rateLimit: vi.fn(() => ({ ok: true })),
}));

const { GET, POST, PATCH } = await import("@/app/api/notifications/route");
const { getUserFromRequest } = await import("@/lib/server/auth-helpers");

function mockRequest(
  method: string,
  body: unknown = null,
  opts: { auth?: string; search?: string } = {}
) {
  const url = new URL(`http://test.local/api/notifications${opts.search ?? ""}`);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.auth !== undefined) headers["authorization"] = opts.auth;
  const obj: Record<string, unknown> = {
    method,
    url: url.toString(),
    json: async () => body,
    headers: new Headers(headers),
  };
  return obj as unknown as NextRequest;
}

describe("GET /api/notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
    (getUserFromRequest as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-123",
      email: "user@example.com",
      role: "user",
    });
  });

  it("returns notifications for the authenticated user", async () => {
    const rows = [
      {
        id: "n1",
        user_id: "user-123",
        audience: "user",
        category: "order",
        title: "Order placed",
        body: "Your order is being processed",
        link: "/orders/abc",
        severity: "info",
        read_at: null,
        created_at: "2026-09-01T10:00:00Z",
      },
      {
        id: "n2",
        user_id: "user-123",
        audience: "user",
        category: "wallet",
        title: "Top up successful",
        body: null,
        link: null,
        severity: "success",
        read_at: "2026-09-01T09:00:00Z",
        created_at: "2026-09-01T08:00:00Z",
      },
    ];
    const chainable = makeChainable();
    chainable.limit = vi.fn(() => Promise.resolve({ data: rows, error: null }));
    (mockAdminClient.from as ReturnType<typeof vi.fn>).mockReturnValue(chainable);

    const res = await GET(mockRequest("GET", null, { search: "?audience=user&limit=10" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.notifications).toHaveLength(2);
    expect(data.unreadCount).toBe(1);
    expect(mockAdminClient.from).toHaveBeenCalledWith("notifications");
  });

  it("returns 401 when unauthenticated", async () => {
    (getUserFromRequest as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await GET(mockRequest("GET"));
    const data = await res.json();
    expect(res.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });
});

describe("POST /api/notifications (admin broadcast)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
  });

  it("returns 403 when caller is not admin", async () => {
    (getUserFromRequest as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-123",
      email: "u@example.com",
      role: "user",
    });
    const res = await POST(
      mockRequest("POST", {
        audience: "admin",
        category: "system",
        title: "Test",
      })
    );
    const data = await res.json();
    expect(res.status).toBe(403);
    expect(data.error).toContain("admin");
  });

  it("admin broadcast to all admins inserts per-admin rows", async () => {
    (getUserFromRequest as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      role: "admin",
    });

    const adminChain = makeChainable({
      select: vi.fn(() => ({
        eq: vi.fn(() =>
          Promise.resolve({
            data: [{ id: "admin-1" }, { id: "admin-2" }],
            error: null,
          })
        ),
      })),
    });

    const insertChain = makeChainable({
      select: vi.fn(() =>
        Promise.resolve({
          data: [
            { id: "r1", user_id: "admin-1", audience: "admin", category: "system" },
            { id: "r2", user_id: "admin-2", audience: "admin", category: "system" },
          ],
          error: null,
        })
      ),
    });

    let callCount = 0;
    (mockAdminClient.from as ReturnType<typeof vi.fn>).mockImplementation(() => {
      callCount++;
      return callCount === 1 ? adminChain : insertChain;
    });

    const res = await POST(
      mockRequest("POST", {
        audience: "admin",
        category: "system",
        title: "Maintenance window",
        body: "Scheduled in 1 hour",
        severity: "warning",
      })
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.count).toBe(2);
  });

  it("returns 400 when title missing", async () => {
    (getUserFromRequest as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      role: "admin",
    });

    const res = await POST(
      mockRequest("POST", { audience: "admin", category: "system" })
    );
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toContain("title");
  });

  it("admin user-audience broadcast looks up target user", async () => {
    (getUserFromRequest as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      role: "admin",
    });

    const profileChain = makeChainable({
      single: vi.fn(() =>
        Promise.resolve({ data: { id: "target-uuid" }, error: null })
      ),
    });
    const notifChain = makeChainable({
      single: vi.fn(() =>
        Promise.resolve({
          data: {
            id: "n1",
            user_id: "target-uuid",
            audience: "user",
            category: "order",
            title: "Hi",
            body: null,
            link: null,
            severity: "info",
            read_at: null,
            created_at: "2026-09-01T00:00:00Z",
          },
          error: null,
        })
      ),
    });

    let callCount = 0;
    (mockAdminClient.from as ReturnType<typeof vi.fn>).mockImplementation(() => {
      callCount++;
      return callCount === 1 ? profileChain : notifChain;
    });

    const res = await POST(
      mockRequest("POST", {
        audience: "user",
        category: "order",
        title: "Order update",
        user_id: "target-uuid",
      })
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.notification.id).toBe("n1");
  });

  it("returns 404 when target user does not exist", async () => {
    (getUserFromRequest as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      role: "admin",
    });

    const profileChain = makeChainable({
      single: vi.fn(() =>
        Promise.resolve({ data: null, error: { message: "not found" } })
      ),
    });
    (mockAdminClient.from as ReturnType<typeof vi.fn>).mockReturnValue(profileChain);

    const res = await POST(
      mockRequest("POST", {
        audience: "user",
        category: "order",
        title: "Order update",
        user_id: "missing-uuid",
      })
    );
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/notifications?action=mark-all-read", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
    (getUserFromRequest as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-123",
      email: "user@example.com",
      role: "user",
    });
  });

  it("marks all unread notifications as read", async () => {
    const chainable = makeChainable();
    chainable.select = vi.fn(() =>
      Promise.resolve({
        data: [{ id: "n1" }, { id: "n2" }, { id: "n3" }],
        error: null,
      })
    );
    (mockAdminClient.from as ReturnType<typeof vi.fn>).mockReturnValue(chainable);

    const res = await PATCH(mockRequest("PATCH", null, { search: "?action=mark-all-read" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.count).toBe(3);
  });

  it("returns 400 for unsupported action", async () => {
    const res = await PATCH(mockRequest("PATCH", null, { search: "?action=bogus" }));
    expect(res.status).toBe(400);
  });

  it("returns 401 when unauthenticated", async () => {
    (getUserFromRequest as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await PATCH(mockRequest("PATCH", null, { search: "?action=mark-all-read" }));
    expect(res.status).toBe(401);
  });
});