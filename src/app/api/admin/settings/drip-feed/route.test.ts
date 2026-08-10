import { describe, it, expect, vi } from "vitest";

let getSettingsMock: ReturnType<typeof vi.fn>;
let updateSettingsMock: ReturnType<typeof vi.fn>;

const createMockSupabase = () => {
  getSettingsMock = vi.fn().mockResolvedValue({
    data: { id: "settings-1", enabled: true, min_runs: 1, max_runs: 10, min_interval: 1, max_interval: 1440 },
    error: null,
  });

  updateSettingsMock = vi.fn().mockResolvedValue({
    data: { id: "settings-1", enabled: false, min_runs: 2, max_runs: 20, min_interval: 5, max_interval: 120 },
    error: null,
  });

  return {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: getSettingsMock,
        })),
        limit: vi.fn(() => ({
          single: getSettingsMock,
        })),
        ilike: vi.fn(() => ({
          or: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn().mockResolvedValue({ data: [], count: 0 }),
            })),
          })),
        })),
        order: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue({ data: [], count: 0 }),
        })),
        range: vi.fn().mockResolvedValue({ data: [], count: 0 }),
        in: vi.fn(),
        not: vi.fn(),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: { id: "new" }, error: null }),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: updateSettingsMock,
          })),
        })),
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

describe("GET /api/admin/settings/drip-feed", () => {
  it("returns drip-feed settings", async () => {
    const { GET } = await import("@/app/api/admin/settings/drip-feed/route");
    const request = {
      headers: { get: vi.fn().mockReturnValue("Bearer token") },
    } as unknown as Request;

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.settings).toBeDefined();
    expect(data.settings.enabled).toBe(true);
    expect(data.settings.min_runs).toBe(1);
    expect(data.settings.max_runs).toBe(10);
  });
});

describe("POST /api/admin/settings/drip-feed", () => {
  it("updates drip-feed settings", async () => {
    const { POST } = await import("@/app/api/admin/settings/drip-feed/route");
    const request = {
      json: vi.fn().mockResolvedValue({
        enabled: false,
        min_runs: 2,
        max_runs: 20,
        min_interval: 5,
        max_interval: 120,
      }),
    } as unknown as Request;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.settings.enabled).toBe(false);
    expect(data.settings.min_runs).toBe(2);
  });

  it("rejects min_runs greater than max_runs", async () => {
    const { POST } = await import("@/app/api/admin/settings/drip-feed/route");
    const request = {
      json: vi.fn().mockResolvedValue({
        enabled: true,
        min_runs: 20,
        max_runs: 5,
      }),
    } as unknown as Request;

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
