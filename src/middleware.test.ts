import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/middleware", () => ({
  createClient: vi.fn(),
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((body, init) => ({ _type: "json", body, init, headers: { set: vi.fn() } })),
    redirect: vi.fn((url) => ({ _type: "redirect", url, headers: { set: vi.fn() } })),
    next: vi.fn(() => ({ _type: "next", headers: { set: vi.fn() } })),
  },
}));

function mockSupabaseClient(user: { id: string; role?: string } | null) {
  const profileChain = {
    select: vi.fn(() => profileChain),
    eq: vi.fn(() => profileChain),
    single: vi.fn().mockResolvedValue({ data: user ? { role: user.role || "user" } : null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: user ? { role: user.role || "user" } : null, error: null }),
  };
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user } }),
    },
    from: vi.fn(() => profileChain),
  };
}

describe("middleware route protection", () => {
  let middleware: typeof import("@/middleware");

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    process.env.NODE_ENV = "test";

    await vi.doMock("@/lib/supabase/middleware", () => ({
      createClient: vi.fn(() => Promise.resolve(mockSupabaseClient((globalThis as Record<string, unknown>).__mockUser as { id: string; role?: string } | null))),
    }));

    middleware = await import("@/middleware");
  });

  function makeRequest(pathname: string): Request {
    return new Request(`http://localhost${pathname}`) as unknown as Request;
  }

  it("allows anonymous access to /services", async () => {
    (globalThis as Record<string, unknown>).__mockUser = null;
    const res: { _type?: string } = await middleware.middleware(makeRequest("/services"));
    expect(res?._type).toBe("next");
  });

  it("allows anonymous access to /services/youtube", async () => {
    (globalThis as Record<string, unknown>).__mockUser = null;
    const res: { _type?: string } = await middleware.middleware(makeRequest("/services/youtube"));
    expect(res?._type).toBe("next");
  });

  it("redirects anonymous user to /auth/sign-in for /dashboard", async () => {
    (globalThis as Record<string, unknown>).__mockUser = null;
    const res: { _type?: string; url?: string } = await middleware.middleware(makeRequest("/dashboard"));
    expect(res?._type).toBe("redirect");
    expect(String(res?.url)).toContain("/auth/sign-in");
  });

  it("redirects anonymous user to /auth/sign-in for /wallet", async () => {
    (globalThis as Record<string, unknown>).__mockUser = null;
    const res: { _type?: string; url?: string } = await middleware.middleware(makeRequest("/wallet"));
    expect(res?._type).toBe("redirect");
  });

  it("redirects anonymous user to /auth/sign-in for /orders", async () => {
    (globalThis as Record<string, unknown>).__mockUser = null;
    const res: { _type?: string; url?: string } = await middleware.middleware(makeRequest("/orders"));
    expect(res?._type).toBe("redirect");
  });

  it("allows anonymous access to /orders/track (public tracking)", async () => {
    (globalThis as Record<string, unknown>).__mockUser = null;
    const res: { _type?: string } = await middleware.middleware(makeRequest("/orders/track?ref=abc"));
    expect(res?._type).toBe("next");
  });

  it("allows authenticated normal user to access /dashboard", async () => {
    (globalThis as Record<string, unknown>).__mockUser = { id: "user-123", role: "user" };
    const res: { _type?: string } = await middleware.middleware(makeRequest("/dashboard"));
    expect(res?._type).toBe("next");
  });

  it("allows authenticated normal user to reach /admin (client handles non-admin redirect)", async () => {
    (globalThis as Record<string, unknown>).__mockUser = { id: "user-123", role: "user" };
    const res: { _type?: string } = await middleware.middleware(makeRequest("/admin"));
    expect(res?._type).toBe("next");
  });

  it("allows authenticated admin to access /admin", async () => {
    (globalThis as Record<string, unknown>).__mockUser = { id: "admin-123", role: "admin" };
    const res: { _type?: string } = await middleware.middleware(makeRequest("/admin"));
    expect(res?._type).toBe("next");
  });
});
