import { describe, it, expect, vi } from "vitest";

const mockSupabase = () => {
  const insertMock = vi.fn(() => ({
    select: vi.fn(() => ({
      single: vi.fn(),
    })),
  }));

  const updateMock = vi.fn(() => ({
    eq: vi.fn().mockResolvedValue({}),
  }));

  const rpcMock = vi.fn().mockResolvedValue({
    data: { success: true, new_balance: 1000 },
    error: null,
  });

  return {
    from: vi.fn((table: string) => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockImplementation(() => {
            if (table === "janjez_services") {
              const isActive = table === "janjez_services";
              return Promise.resolve({
                data: isActive ? null : {
                  id: "js-1",
                  name: "Disabled Service",
                  is_active: false,
                  selling_price_ksh: 100,
                  provider_service_id: "ps-1",
                  min_quantity: 1,
                  max_quantity: 1000,
                },
                error: null,
              });
            }
            return Promise.resolve({ data: null, error: null });
          }),
        })),
        in: vi.fn(),
        order: vi.fn(),
        range: vi.fn(),
      })),
      insert: insertMock,
      update: updateMock,
    })),
    rpc: rpcMock,
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

describe("POST /api/orders service validation", () => {
  it("rejects disabled Janjez service", async () => {
    const { POST } = await import("@/app/api/orders/route");
    const request = {
      json: vi.fn().mockResolvedValue({
        category: "youtube",
        subcategory: "likes",
        quantity_source: "custom",
        quantity: 100,
        link_submitted: "https://example.com",
        amount_paid: 100,
        janjez_service_id: "js-disabled",
      }),
    } as const;

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("rejects invalid Janjez service ID", async () => {
    const { POST } = await import("@/app/api/orders/route");
    const request = {
      json: vi.fn().mockResolvedValue({
        category: "youtube",
        subcategory: "likes",
        quantity_source: "custom",
        quantity: 100,
        link_submitted: "https://example.com",
        amount_paid: 100,
        janjez_service_id: "non-existent",
      }),
    } as const;

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
