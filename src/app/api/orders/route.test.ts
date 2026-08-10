import { describe, it, expect, vi } from "vitest";

const mockSupabase = () => {
  const insertMock = vi.fn(() => ({
    select: vi.fn(() => ({
      single: vi.fn().mockResolvedValue({
        data: {
          id: "order-1",
          order_id: "ORD-123",
          user_id: "user-1",
          category: "youtube",
          subcategory: "likes",
          service_name: "likes",
          sku_id: null,
          quantity: 100,
          link_submitted: "https://example.com",
          amount: 95,
          amount_paid: 95,
          payment_reference: null,
          refill_guarantee: null,
          quantity_source: "custom",
          catalog_category_id: "youtube",
          status: "pending",
          payment_status: "paid",
          fulfillment_status: "pending",
          created_at: new Date().toISOString(),
        },
      }),
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
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
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
  fulfillOrder: vi.fn().mockResolvedValue({ status: "processing", providerOrderId: "12345" }),
}));

vi.mock("@/lib/data", () => ({
  ORDER_SERVICES: [
    {
      categoryId: "youtube",
      serviceId: "likes",
      id: "likes",
      rate: 0.295,
      min: 10,
      max: 10000,
    },
  ],
  getServicesByCategory: vi.fn(),
}));

vi.mock("@/lib/service-catalog", () => ({
  SERVICE_CATALOG: [
    {
      id: "youtube",
      name: "YouTube",
      subcategories: [
        {
          name: "likes",
          deliverables: [
            { name: "likes", price: "0.295 Ksh" },
          ],
        },
      ],
    },
  ],
}));

describe("POST /api/orders drip-feed validation", () => {
  it("accepts valid runs and interval", async () => {
    const { POST } = await import("@/app/api/orders/route");
    const request = {
      json: vi.fn().mockResolvedValue({
        category: "youtube",
        subcategory: "likes",
        quantity_source: "custom",
        quantity: 100,
        link_submitted: "https://example.com",
        amount_paid: 28.025,
        catalog_category_id: "youtube",
        runs: 10,
        interval: 60,
      }),
    } as const;

    const response = await POST(request);
    expect(response.status).not.toBe(400);
  });

  it("rejects non-integer runs", async () => {
    const { POST } = await import("@/app/api/orders/route");
    const request = {
      json: vi.fn().mockResolvedValue({
        category: "youtube",
        subcategory: "likes",
        quantity_source: "custom",
        quantity: 100,
        link_submitted: "https://example.com",
        amount_paid: 28.12,
        catalog_category_id: "youtube",
        runs: 10.5,
        interval: 60,
      }),
    } as const;

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("rejects zero runs", async () => {
    const { POST } = await import("@/app/api/orders/route");
    const request = {
      json: vi.fn().mockResolvedValue({
        category: "youtube",
        subcategory: "likes",
        quantity_source: "custom",
        quantity: 100,
        link_submitted: "https://example.com",
        amount_paid: 28.12,
        catalog_category_id: "youtube",
        runs: 0,
        interval: 60,
      }),
    } as const;

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("rejects non-integer interval", async () => {
    const { POST } = await import("@/app/api/orders/route");
    const request = {
      json: vi.fn().mockResolvedValue({
        category: "youtube",
        subcategory: "likes",
        quantity_source: "custom",
        quantity: 100,
        link_submitted: "https://example.com",
        amount_paid: 28.12,
        catalog_category_id: "youtube",
        runs: 10,
        interval: 30.5,
      }),
    } as const;

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("accepts order without drip-feed fields", async () => {
    const { POST } = await import("@/app/api/orders/route");
    const request = {
      json: vi.fn().mockResolvedValue({
        category: "youtube",
        subcategory: "likes",
        quantity_source: "custom",
        quantity: 100,
        link_submitted: "https://example.com",
        amount_paid: 28.025,
        catalog_category_id: "youtube",
      }),
    } as const;

    const response = await POST(request);
    expect(response.status).not.toBe(400);
  });
});
