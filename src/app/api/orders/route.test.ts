import { describe, it, expect, vi, beforeEach } from "vitest";

const mockAdminClient = {
  rpc: vi.fn(),
  from: vi.fn(),
};

function makeChainable(result: Record<string, unknown> = {}) {
  const chainable = {
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
    ...result,
  };
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

vi.mock("@/lib/smm/fulfillment", () => ({
  fulfillOrder: vi.fn(),
  syncProviderCatalog: vi.fn(),
  syncOrderStatuses: vi.fn(),
  findCheapestProviderService: vi.fn(),
  resolveJanjezService: vi.fn(),
}));

vi.mock("@/lib/smm/provider", () => ({
  fetchProviderServices: vi.fn(),
  placeProviderOrder: vi.fn(),
  getProviderMultipleStatus: vi.fn(),
  createProviderRefill: vi.fn(),
  createProviderCancel: vi.fn(),
  getProviderBalance: vi.fn(),
  getProviderStatus: vi.fn(),
  SMM_API_URL: "https://api.test.com",
  SMM_API_KEY: "test",
}));

vi.mock("@/lib/server/rate-limiter", () => ({
  rateLimit: vi.fn(() => ({ ok: true })),
  rateLimitAdmin: vi.fn(() => ({ ok: true })),
  rateLimitCron: vi.fn(() => ({ ok: true })),
}));

const { POST } = await import("@/app/api/orders/route");
const { getUserFromRequest } = await import("@/lib/server/auth-helpers");
const { fulfillOrder, resolveJanjezService } = await import("@/lib/smm/fulfillment");

function mockRequest(body: Record<string, unknown>, auth = "Bearer test-token") {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) headers["authorization"] = auth;
  const obj: Record<string, unknown> = {
    json: async () => body,
    headers: new Headers(headers),
  };
  const req = obj as unknown as Request;
  return req;
}

describe("POST /api/orders - drip-feed validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";

    (getUserFromRequest as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-123",
      email: "test@example.com",
      role: "user",
    });
  });

  function mockOrderChain(orderData: Record<string, unknown>) {
    const orderChainable = makeChainable({});
    orderChainable.select = vi.fn(() => orderChainable);
    orderChainable.insert = vi.fn(() => orderChainable);
    orderChainable.single = vi.fn().mockResolvedValue({ data: orderData, error: null });

    const notifChainable = makeChainable({
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
    });

    mockAdminClient.from.mockImplementation((table: string) => {
      if (table === "orders") return orderChainable;
      if (table === "notifications") return notifChainable;
      if (table === "profiles") return makeChainable({ single: vi.fn().mockResolvedValue({ data: { wallet_balance: 1000 }, error: null }) });
      return makeChainable({});
    });

    mockAdminClient.rpc.mockResolvedValue({
      data: { success: true, new_balance: 1000 },
      error: null,
    });

    (fulfillOrder as ReturnType<typeof vi.fn>).mockResolvedValue({ status: "processing", providerOrderId: "12345" });
  }

  it("rejects non-integer runs with 400", async () => {
    mockOrderChain({ id: "order-1" });
    const req = mockRequest({
      category: "instagram",
      subcategory: "Likes",
      sku_id: "Quick Boost ⚡",
      catalog_category_id: "instagram",
      quantity: 100,
      link_submitted: "https://instagram.com/p/test",
      amount_paid: 45.00,
      quantity_source: "preset",
      runs: "abc",
      interval: 60,
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.details).toEqual(expect.arrayContaining(["runs must be an integer"]));
  });

  it("rejects zero runs with 400", async () => {
    mockOrderChain({ id: "order-1" });
    const req = mockRequest({
      category: "instagram",
      subcategory: "Likes",
      sku_id: "Quick Boost ⚡",
      catalog_category_id: "instagram",
      quantity: 100,
      link_submitted: "https://instagram.com/p/test",
      amount_paid: 45.00,
      quantity_source: "preset",
      runs: 0,
      interval: 60,
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.details).toEqual(expect.arrayContaining(["runs must be greater than 0"]));
  });

  it("rejects negative interval with 400", async () => {
    mockOrderChain({ id: "order-1" });
    const req = mockRequest({
      category: "instagram",
      subcategory: "Likes",
      sku_id: "Quick Boost ⚡",
      catalog_category_id: "instagram",
      quantity: 100,
      link_submitted: "https://instagram.com/p/test",
      amount_paid: 45.00,
      quantity_source: "preset",
      runs: 2,
      interval: -5,
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.details).toEqual(expect.arrayContaining(["interval must be greater than 0"]));
  });

  it("rejects float runs with 400", async () => {
    mockOrderChain({ id: "order-1" });
    const req = mockRequest({
      category: "instagram",
      subcategory: "Likes",
      sku_id: "Quick Boost ⚡",
      catalog_category_id: "instagram",
      quantity: 100,
      link_submitted: "https://instagram.com/p/test",
      amount_paid: 45.00,
      quantity_source: "preset",
      runs: 2.5,
      interval: 60,
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.details).toEqual(expect.arrayContaining(["runs must be an integer"]));
  });

  it("persists valid runs/interval on insert", async () => {
    let capturedInsert: Record<string, unknown> | null = null;
    const orderChainable = makeChainable({});
    orderChainable.select = vi.fn(() => orderChainable);
    orderChainable.insert = vi.fn(() => ({
      ...orderChainable,
      select: vi.fn(() => ({
        ...orderChainable,
        single: vi.fn().mockResolvedValue({ data: { id: "order-1", runs: 2, interval: 1 }, error: null }),
      })),
    }));
    const notifChainable = makeChainable({ insert: vi.fn().mockResolvedValue({ data: {}, error: null }) });
    const profilesChainable = makeChainable({ single: vi.fn().mockResolvedValue({ data: { wallet_balance: 1000 }, error: null }) });

    mockAdminClient.from.mockImplementation((table: string) => {
      if (table === "orders") {
        const ordersCh = makeChainable({});
        ordersCh.select = vi.fn(() => ordersCh);
        ordersCh.insert = vi.fn((payload) => {
          capturedInsert = payload;
          return {
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: { id: "order-1", ...payload }, error: null }),
            })),
          };
        });
        return ordersCh;
      }
      if (table === "notifications") return notifChainable;
      if (table === "profiles") return profilesChainable;
      return makeChainable({});
    });
    mockAdminClient.rpc.mockResolvedValue({ data: { success: true, new_balance: 1000 }, error: null });
    (fulfillOrder as ReturnType<typeof vi.fn>).mockResolvedValue({ status: "processing", providerOrderId: "12345" });

    const req = mockRequest({
      category: "instagram",
      subcategory: "Likes",
      sku_id: "Quick Boost ⚡",
      catalog_category_id: "instagram",
      quantity: 100,
      link_submitted: "https://instagram.com/p/test",
      amount_paid: 8.00,
      quantity_source: "preset",
      runs: 2,
      interval: 1,
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(capturedInsert).toMatchObject({
      runs: 2,
      interval: 1,
    });
  });

  it("persists NULL runs/interval for instant orders", async () => {
    let capturedInsert: Record<string, unknown> | null = null;
    const notifChainable = makeChainable({ insert: vi.fn().mockResolvedValue({ data: {}, error: null }) });
    const profilesChainable = makeChainable({ single: vi.fn().mockResolvedValue({ data: { wallet_balance: 1000 }, error: null }) });

    mockAdminClient.from.mockImplementation((table: string) => {
      if (table === "orders") {
        const ordersCh = makeChainable({});
        ordersCh.select = vi.fn(() => ordersCh);
        ordersCh.insert = vi.fn((payload) => {
          capturedInsert = payload;
          return {
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: { id: "order-1", ...payload }, error: null }),
            })),
          };
        });
        return ordersCh;
      }
      if (table === "notifications") return notifChainable;
      if (table === "profiles") return profilesChainable;
      return makeChainable({});
    });
    mockAdminClient.rpc.mockResolvedValue({ data: { success: true, new_balance: 1000 }, error: null });
    (fulfillOrder as ReturnType<typeof vi.fn>).mockResolvedValue({ status: "processing", providerOrderId: "12345" });

    const req = mockRequest({
      category: "instagram",
      subcategory: "Likes",
      sku_id: "Quick Boost ⚡",
      catalog_category_id: "instagram",
      quantity: 100,
      link_submitted: "https://instagram.com/p/test",
      amount_paid: 8.00,
      quantity_source: "preset",
    });
    const res = await POST(req);

    expect(res.status).toBe(201);
    expect(capturedInsert).toMatchObject({
      runs: null,
      interval: null,
    });
  });

  it("does not multiply quantity by runs in pricing", async () => {
    const orderChainable = makeChainable({});
    orderChainable.select = vi.fn(() => orderChainable);
    orderChainable.insert = vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn().mockResolvedValue({ data: { id: "order-1", runs: 2, interval: 1, quantity: 100 }, error: null }),
      })),
    }));
    const notifChainable = makeChainable({ insert: vi.fn().mockResolvedValue({ data: {}, error: null }) });
    const profilesChainable = makeChainable({ single: vi.fn().mockResolvedValue({ data: { wallet_balance: 1000 }, error: null }) });

    mockAdminClient.from.mockImplementation((table: string) => {
      if (table === "orders") return orderChainable;
      if (table === "notifications") return notifChainable;
      if (table === "profiles") return profilesChainable;
      return makeChainable({});
    });
    mockAdminClient.rpc.mockResolvedValue({ data: { success: true, new_balance: 1000 }, error: null });
    (fulfillOrder as ReturnType<typeof vi.fn>).mockResolvedValue({ status: "processing", providerOrderId: "12345" });

    const req = mockRequest({
      category: "instagram",
      subcategory: "Likes",
      sku_id: "Quick Boost ⚡",
      catalog_category_id: "instagram",
      quantity: 100,
      link_submitted: "https://instagram.com/p/test",
      amount_paid: 8.00,
      quantity_source: "preset",
      runs: 2,
      interval: 60,
    });
    const res = await POST(req);

    expect(res.status).toBe(201);
    expect(mockAdminClient.rpc).toHaveBeenCalledWith("debit_wallet", {
      p_user_id: "user-123",
      p_amount: 8.00,
    });
  });
});

describe("POST /api/orders - Janjez service pricing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";

    (getUserFromRequest as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-123",
      email: "test@example.com",
      role: "user",
    });
  });

  function mockOrderChainWithJanjez(janjezService: Record<string, unknown>) {
    const orderChainable = makeChainable({});
    orderChainable.select = vi.fn(() => orderChainable);
    orderChainable.insert = vi.fn(() => ({
      ...orderChainable,
      select: vi.fn(() => ({
        ...orderChainable,
        single: vi.fn().mockResolvedValue({ data: { id: "order-1", ...janjezService }, error: null }),
      })),
    }));
    orderChainable.eq = vi.fn(() => orderChainable);
    orderChainable.single = vi.fn().mockResolvedValue({ data: janjezService, error: null });

    const notifChainable = makeChainable({ insert: vi.fn().mockResolvedValue({ data: {}, error: null }) });
    const profilesChainable = makeChainable({ single: vi.fn().mockResolvedValue({ data: { wallet_balance: 100000 }, error: null }) });

    mockAdminClient.from.mockImplementation((table: string) => {
      if (table === "orders") {
        const ordersCh = makeChainable({});
        ordersCh.select = vi.fn(() => ordersCh);
        ordersCh.insert = vi.fn((payload) => {
          return {
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: { id: "order-1", ...payload }, error: null }),
            })),
          };
        });
        return ordersCh;
      }
      if (table === "notifications") return notifChainable;
      if (table === "profiles") return profilesChainable;
      return makeChainable({
        single: vi.fn().mockResolvedValue({ data: janjezService, error: null }),
      });
    });
    mockAdminClient.rpc.mockResolvedValue({ data: { success: true, new_balance: 100000 }, error: null });
    (fulfillOrder as ReturnType<typeof vi.fn>).mockResolvedValue({ status: "processing", providerOrderId: "12345" });
  }

  it("calculates Janjez service price per 1000 units correctly", async () => {
    const janjezService = {
      id: "svc-1",
      name: "YouTube Views",
      slug: "youtube-views",
      category: "youtube",
      subcategory: null,
      selling_price_ksh: 41.1,
      provider_service_id: "12345",
      min_quantity: 100,
      max_quantity: 1000000,
      supports_drip_feed: false,
      supports_refill: true,
      supports_cancel: false,
      is_active: true,
    };

    mockOrderChainWithJanjez(janjezService);
    (resolveJanjezService as ReturnType<typeof vi.fn>).mockResolvedValue(janjezService);

    const req = mockRequest({
      janjez_service_id: "svc-1",
      quantity: 100000,
      link_submitted: "https://youtube.com/watch?v=test",
      amount_paid: 4110,
      quantity_source: "preset",
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it("rejects forged client price (amount_paid does not match server calculation)", async () => {
    const janjezService = {
      id: "svc-1",
      name: "YouTube Views",
      slug: "youtube-views",
      category: "youtube",
      selling_price_ksh: 41.1,
      provider_service_id: "12345",
      min_quantity: 100,
      max_quantity: 1000000,
      supports_drip_feed: false,
      is_active: true,
    };

    mockOrderChainWithJanjez(janjezService);
    (resolveJanjezService as ReturnType<typeof vi.fn>).mockResolvedValue(janjezService);

    const req = mockRequest({
      janjez_service_id: "svc-1",
      quantity: 100000,
      link_submitted: "https://youtube.com/watch?v=test",
      amount_paid: 99999,
      quantity_source: "preset",
    });

    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toContain("Price verification failed");
  });

  it("rejects order for inactive Janjez service", async () => {
    (resolveJanjezService as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const req = mockRequest({
      janjez_service_id: "svc-1",
      quantity: 100000,
      link_submitted: "https://youtube.com/watch?v=test",
      amount_paid: 4110,
      quantity_source: "preset",
    });

    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(404);
    expect(data.error).toBe("Service not found or not available");
  });
});
