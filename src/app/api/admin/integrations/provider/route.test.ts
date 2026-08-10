import { describe, it, expect, vi } from "vitest";

let getProviderServicesMock: ReturnType<typeof vi.fn>;

const createMockSupabase = () => {
  getProviderServicesMock = vi.fn().mockResolvedValue({
    data: [
      { id: "1", name: "Test", category: "youtube", rate: 0.1, min_quantity: 1, max_quantity: 1000, supports_refill: true, supports_cancel: true, supports_drip_feed: true, is_active: true, last_synced_at: new Date().toISOString() },
    ],
    error: null,
  });

  return {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
        ilike: vi.fn(() => ({
          ilike: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn().mockResolvedValue({ data: [], count: 0 }),
            })),
          })),
          order: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue({ data: [], count: 0 }),
          })),
        })),
        not: vi.fn(),
        eq: vi.fn(() => ({
          single: vi.fn(),
          not: vi.fn(),
          in: vi.fn(),
        })),
        in: vi.fn(),
        order: getProviderServicesMock,
        range: vi.fn().mockResolvedValue({ data: [], count: 0 }),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: { id: "new" }, error: null }),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    })),
    rpc: vi.fn().mockResolvedValue({ data: { success: true, new_balance: 1000 }, error: null }),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "admin-1" } }, error: null }),
    },
  };
};

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(createMockSupabase),
}));

vi.mock("@/lib/server/auth-helpers", () => ({
  requireAdmin: vi.fn(() => ({ id: "admin-1", email: "admin@test.com", role: "admin" })),
}));

vi.mock("@/lib/server/rate-limiter", () => ({
  rateLimitAdmin: vi.fn(() => ({ ok: true })),
}));

vi.mock("@/lib/smm/provider", () => ({
  getProviderBalance: vi.fn().mockResolvedValue({ balance: "100", currency: "USD" }),
  fetchProviderServices: vi.fn().mockResolvedValue([]),
}));

describe("GET /api/admin/integrations/provider", () => {
  it("never returns raw API key", async () => {
    process.env.SMM_API_KEY = "super-secret-key";
    process.env.SMM_API_URL = "https://dripfeedpanel.com/api/v2";

    const { GET } = await import("@/app/api/admin/integrations/provider/route");
    const request = {
      headers: { get: vi.fn().mockReturnValue("Bearer token") },
    } as unknown as Request;

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.provider.apiKey).not.toBe("super-secret-key");
    expect(data.provider.apiKey).toMatch(/configured|missing/);
    expect(data.provider.apiKey).not.toContain("super");
  });
});
