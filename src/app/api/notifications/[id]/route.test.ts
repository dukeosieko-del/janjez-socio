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

const { PATCH, DELETE } = await import("@/app/api/notifications/[id]/route");
const { getUserFromRequest } = await import("@/lib/server/auth-helpers");

function mockRequest(method: string, body: unknown = null, opts: { auth?: string } = {}) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.auth !== undefined) headers["authorization"] = opts.auth;
  const obj: Record<string, unknown> = {
    method,
    json: async () => body,
    headers: new Headers(headers),
  };
  return obj as unknown as NextRequest;
}

describe("PATCH /api/notifications/[id]", () => {
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

  it("marks a single notification as read", async () => {
    const fetchChain = makeChainable({
      single: vi.fn(() =>
        Promise.resolve({
          data: { id: "n1", user_id: "user-123", audience: "user" },
          error: null,
        })
      ),
    });

    const updateChain = makeChainable();
    updateChain.update = vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null })),
    }));

    const ownerChain = makeChainable({
      single: vi.fn(() =>
        Promise.resolve({ data: { user_id: "user-123" }, error: null })
      ),
    });

    let callCount = 0;
    (mockAdminClient.from as ReturnType<typeof vi.fn>).mockImplementation(() => {
      callCount++;
      if (callCount === 1) return fetchChain;
      if (callCount === 2) return updateChain;
      return ownerChain;
    });

    const res = await PATCH(mockRequest("PATCH", { read: true }), {
      params: Promise.resolve({ id: "n1" }),
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.read).toBe(true);
  });

  it("returns 403 when notification belongs to another user", async () => {
    const fetchChain = makeChainable({
      single: vi.fn(() =>
        Promise.resolve({
          data: { id: "n1", user_id: "someone-else", audience: "user" },
          error: null,
        })
      ),
    });
    (mockAdminClient.from as ReturnType<typeof vi.fn>).mockReturnValue(fetchChain);

    const res = await PATCH(mockRequest("PATCH", { read: true }), {
      params: Promise.resolve({ id: "n1" }),
    });
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toBe("Forbidden");
  });

  it("returns 404 when notification missing", async () => {
    const fetchChain = makeChainable({
      single: vi.fn(() =>
        Promise.resolve({ data: null, error: { message: "not found" } })
      ),
    });
    (mockAdminClient.from as ReturnType<typeof vi.fn>).mockReturnValue(fetchChain);

    const res = await PATCH(mockRequest("PATCH", { read: true }), {
      params: Promise.resolve({ id: "n1" }),
    });
    expect(res.status).toBe(404);
  });

  it("admin can update another user's notification", async () => {
    (getUserFromRequest as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      role: "admin",
    });
    const fetchChain = makeChainable({
      single: vi.fn(() =>
        Promise.resolve({
          data: { id: "n1", user_id: "someone-else", audience: "user" },
          error: null,
        })
      ),
    });
    const updateChain = makeChainable();
    updateChain.update = vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null })),
    }));
    const ownerChain = makeChainable({
      single: vi.fn(() =>
        Promise.resolve({ data: { user_id: "someone-else" }, error: null })
      ),
    });
    let callCount = 0;
    (mockAdminClient.from as ReturnType<typeof vi.fn>).mockImplementation(() => {
      callCount++;
      if (callCount === 1) return fetchChain;
      if (callCount === 2) return updateChain;
      return ownerChain;
    });

    const res = await PATCH(mockRequest("PATCH", { read: true }), {
      params: Promise.resolve({ id: "n1" }),
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
  });
});

describe("DELETE /api/notifications/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (mockAdminClient.from as ReturnType<typeof vi.fn>).mockReset();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
    (getUserFromRequest as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-123",
      email: "user@example.com",
      role: "user",
    });
  });

  it("deletes a notification owned by the user", async () => {
    const fetchChain = makeChainable({
      single: vi.fn(() =>
        Promise.resolve({
          data: { id: "n1", user_id: "user-123" },
          error: null,
        })
      ),
    });
    const ownerChain = makeChainable({
      single: vi.fn(() =>
        Promise.resolve({ data: { user_id: "user-123" }, error: null })
      ),
    });
    const delChain = makeChainable();
    delChain.delete = vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null })),
    }));
    let callCount = 0;
    (mockAdminClient.from as ReturnType<typeof vi.fn>).mockImplementation(() => {
      callCount++;
      if (callCount === 1) return fetchChain;
      if (callCount === 2) return ownerChain;
      return delChain;
    });

    const res = await DELETE(mockRequest("DELETE"), {
      params: Promise.resolve({ id: "n1" }),
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
  });

  it("returns 401 when unauthenticated", async () => {
    (getUserFromRequest as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await DELETE(mockRequest("DELETE"), {
      params: Promise.resolve({ id: "n1" }),
    });
    expect(res.status).toBe(401);
  });

  it("returns 404 when notification missing", async () => {
    const fetchChain = makeChainable({
      single: vi.fn(() =>
        Promise.resolve({ data: null, error: { message: "missing" } })
      ),
    });
    (mockAdminClient.from as ReturnType<typeof vi.fn>).mockReturnValue(fetchChain);

    const res = await DELETE(mockRequest("DELETE"), {
      params: Promise.resolve({ id: "n1" }),
    });
    expect(res.status).toBe(404);
  });
});