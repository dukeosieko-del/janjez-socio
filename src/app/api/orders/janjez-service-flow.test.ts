import { describe, it, expect, vi } from "vitest";

const mockSupabase = () => {
  const services = [
    {
      id: "js-1",
      name: "Test Service",
      slug: "test-service",
      category: "youtube",
      subcategory: "views",
      description: "Test description",
      selling_price_ksh: 100,
      min_quantity: 10,
      max_quantity: 1000,
      is_active: true,
      display_order: 1,
      supports_drip_feed: true,
      supports_refill: true,
      supports_cancel: false,
    },
    {
      id: "js-valid",
      name: "Valid Service",
      slug: "valid-service",
      category: "youtube",
      subcategory: "views",
      description: "Valid",
      selling_price_ksh: 200,
      min_quantity: 1,
      max_quantity: 5000,
      is_active: true,
      display_order: 3,
      supports_drip_feed: false,
      supports_refill: false,
      supports_cancel: false,
    },
  ];

  const buildQuery = () => {
    let filtered = [...services];
    const api: Record<string, unknown> = {
      eq: vi.fn(function (_col: string, val: unknown) {
        if (_col === "is_active") {
          filtered = filtered.filter((s) => s.is_active === val);
        }
        if (_col === "id") {
          filtered = filtered.filter((s) => s.id === val);
        }
        return api;
      }),
      ilike: vi.fn(function () {
        return api;
      }),
      or: vi.fn(function () {
        return api;
      }),
      order: vi.fn(function () {
        return api;
      }),
      range: vi.fn(function () {
        return Promise.resolve({ data: filtered, count: filtered.length });
      }),
      single: vi.fn(function () {
        const item = filtered[0] || null;
        return Promise.resolve({ data: item, error: item ? null : { message: "Not found" } });
      }),
    };
    return api;
  };

  return {
    from: vi.fn(() => ({
      select: vi.fn(function (_fields?: string) {
        const api = buildQuery();
        api.select = vi.fn(function () {
          const inner = buildQuery();
          inner.select = api.select;
          return inner;
        });
        return api;
      }),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: { id: "order-1" }, error: null }),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
      })),
    })),
    rpc: vi.fn().mockResolvedValue({ data: { success: true, new_balance: 1000 }, error: null }),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } }, error: null }),
    },
  };
};

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(mockSupabase),
}));

vi.mock("@/lib/server/auth-helpers", () => ({
  getUserFromRequest: vi.fn(() => ({ id: "user-1", email: "test@example.com" })),
}));

vi.mock("@/lib/server/rate-limiter", () => ({
  rateLimit: vi.fn(() => ({ ok: true })),
}));

vi.mock("@/lib/smm/fulfillment", () => ({
  fulfillOrder: vi.fn(),
}));

vi.mock("@/lib/data", () => ({
  ORDER_SERVICES: [],
  getServicesByCategory: vi.fn(),
}));

vi.mock("@/lib/service-catalog", () => ({
  SERVICE_CATALOG: [],
}));

describe("POST /api/orders janjez_service_id flow", () => {
  it("rejects disabled Janjez service", async () => {
    const { POST } = await import("@/app/api/orders/route");
    const request = {
      json: vi.fn().mockResolvedValue({
        category: "youtube",
        subcategory: "views",
        quantity_source: "custom",
        quantity: 100,
        link_submitted: "https://example.com",
        amount_paid: 100,
        janjez_service_id: "js-1",
      }),
    } as const;

    const response = await POST(request as unknown as Request);
    expect(response.status).toBe(400);
  });

  it("accepts valid janjez_service_id", async () => {
    const { POST } = await import("@/app/api/orders/route");
    const request = {
      json: vi.fn().mockResolvedValue({
        category: "youtube",
        subcategory: "views",
        quantity_source: "custom",
        quantity: 100,
        link_submitted: "https://example.com",
        amount_paid: 20000,
        janjez_service_id: "js-valid",
      }),
    } as const;

    const response = await POST(request as unknown as Request);
    expect(response.status).not.toBe(400);
  });
});
