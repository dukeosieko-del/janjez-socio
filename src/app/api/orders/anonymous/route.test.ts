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
    single: vi.fn(() => chainable),
    order: vi.fn(() => chainable),
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

vi.mock("@/lib/smm/fulfillment", () => ({
  fulfillOrder: vi.fn(),
}));

vi.mock("@/lib/janzez-services", () => ({
  listJanjezServices: vi.fn(),
}));

vi.mock("@/lib/mpesa/client", () => ({
  initiateStkPush: vi.fn(),
  getCallbackUrl: vi.fn(() => "https://janjez.social/api/mpesa/callback"),
  completeStkPayment: vi.fn(),
}));

const { POST } = await import("@/app/api/orders/anonymous/route");
const { listJanjezServices } = await import("@/lib/janzez-services");
const { initiateStkPush } = await import("@/lib/mpesa/client");

function mockRequest(body: Record<string, unknown>) {
  const obj = {
    url: "http://localhost:3000/api/orders/anonymous",
    json: async () => body,
    headers: new Headers({ "Content-Type": "application/json" }),
  };
  return obj as unknown as Request;
}

describe("POST /api/orders/anonymous - validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
  });

  function mockOrderSuccess() {
    const orderChainable = makeChainable({});
    orderChainable.select = vi.fn(() => orderChainable);
    orderChainable.insert = vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn().mockResolvedValue({ data: { id: "order-1", order_id: "ORD-TEST" }, error: null }),
      })),
    }));
    const txChainable = makeChainable({});
    txChainable.insert = vi.fn().mockResolvedValue({ data: {}, error: null });
    mockAdminClient.from.mockImplementation((table: string) => {
      if (table === "orders") return orderChainable;
      if (table === "wallet_transactions") return txChainable;
      return makeChainable({});
    });
    (listJanjezServices as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: "svc-1",
        name: "YouTube Views",
        slug: "youtube-views",
        category: "youtube",
        subcategory: null,
        selling_price_ksh: 41.1,
        provider_service_id: "12345",
        min_quantity: 100,
        max_quantity: 1000000,
        supports_drip_feed: true,
        supports_refill: true,
        supports_cancel: false,
        is_active: true,
        show_anonymous: true,
        description: null,
        display_order: 0,
        supports_drip_feed: true,
        supports_refill: true,
        supports_cancel: false,
        show_sidebar: false,
        show_landing: false,
        show_guarded: false,
        show_catalogue: false,
        created_at: "",
        updated_at: "",
      },
    ]);
    (initiateStkPush as ReturnType<typeof vi.fn>).mockResolvedValue({
      CheckoutRequestID: "test-checkout-id",
      CustomerMessage: "STK push sent",
    });
  }

  it("rejects missing janjez_service_id", async () => {
    mockOrderSuccess();
    const req = mockRequest({
      link_submitted: "https://youtube.com/watch?v=test",
      quantity: 100,
      phone_number: "0712345678",
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.details).toContain("janjez_service_id is required");
  });

  it("rejects missing or invalid phone number", async () => {
    mockOrderSuccess();
    const req = mockRequest({
      janjez_service_id: "svc-1",
      link_submitted: "https://youtube.com/watch?v=test",
      quantity: 100,
      phone_number: "123",
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.details).toContain("A valid phone number is required");
  });

  it("rejects invalid link", async () => {
    mockOrderSuccess();
    const req = mockRequest({
      janjez_service_id: "svc-1",
      link_submitted: "not-a-url",
      quantity: 100,
      phone_number: "0712345678",
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.details).toContain("Link must be a valid URL or phone number");
  });

  it("rejects quantity below minimum", async () => {
    mockOrderSuccess();
    const req = mockRequest({
      janjez_service_id: "svc-1",
      link_submitted: "https://youtube.com/watch?v=test",
      quantity: 50,
      phone_number: "0712345678",
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toContain("Quantity must be between");
  });

  it("rejects quantity above maximum", async () => {
    mockOrderSuccess();
    const req = mockRequest({
      janjez_service_id: "svc-1",
      link_submitted: "https://youtube.com/watch?v=test",
      quantity: 99999999,
      phone_number: "0712345678",
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toContain("Quantity must be between");
  });

  it("rejects drip-feed on non-drip-feed service", async () => {
    const service = {
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
      show_anonymous: true,
      description: null,
      display_order: 0,
      supports_refill: false,
      supports_cancel: false,
      show_sidebar: false,
      show_landing: false,
      show_guarded: false,
      show_catalogue: false,
      created_at: "",
      updated_at: "",
    };
    (listJanjezServices as ReturnType<typeof vi.fn>).mockResolvedValue([service]);

    const req = mockRequest({
      janjez_service_id: "svc-1",
      link_submitted: "https://youtube.com/watch?v=test",
      quantity: 100,
      phone_number: "0712345678",
      runs: 5,
      interval: 60,
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toBe("This service does not support drip-feed");
  });

  it("rejects unmapped service (no provider_service_id)", async () => {
    (listJanjezServices as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: "svc-1",
        name: "Test",
        slug: "test",
        category: "test",
        selling_price_ksh: 41.1,
        provider_service_id: null,
        min_quantity: 100,
        max_quantity: 1000000,
        supports_drip_feed: true,
        is_active: true,
        show_anonymous: true,
        description: null,
        display_order: 0,
        supports_refill: false,
        supports_cancel: false,
        show_sidebar: false,
        show_landing: false,
        show_guarded: false,
        show_catalogue: false,
        created_at: "",
        updated_at: "",
      },
    ]);

    const req = mockRequest({
      janjez_service_id: "svc-1",
      link_submitted: "https://youtube.com/watch?v=test",
      quantity: 100,
      phone_number: "0712345678",
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toContain("not configured for ordering");
  });

  it("rejects inactive service (listJanjezServices returns empty)", async () => {
    (listJanjezServices as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const req = mockRequest({
      janjez_service_id: "svc-1",
      link_submitted: "https://youtube.com/watch?v=test",
      quantity: 100,
      phone_number: "0712345678",
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(404);
    expect(data.error).toBe("Service not found or not available");
  });

  it("calculates price server-side (ignores client amount_paid)", async () => {
    mockOrderSuccess();
    const req = mockRequest({
      janjez_service_id: "svc-1",
      link_submitted: "https://youtube.com/watch?v=test",
      quantity: 1000,
      phone_number: "0712345678",
      amount_paid: 999999,
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.amount).toBe(41.1);
    expect(data.amountForMpesa).toBe(50);
  });

  it("uses KSh 50 minimum for order below 50", async () => {
    mockOrderSuccess();
    const req = mockRequest({
      janjez_service_id: "svc-1",
      link_submitted: "https://youtube.com/watch?v=test",
      quantity: 100,
      phone_number: "0712345678",
    });
    const res = await POST(req);
    const data = await res.json();
    expect(data.amountForMpesa).toBe(50);
  });

  it("uses exact amount for order above 50", async () => {
    mockOrderSuccess();
    const req = mockRequest({
      janjez_service_id: "svc-1",
      link_submitted: "https://youtube.com/watch?v=test",
      quantity: 5000,
      phone_number: "0712345678",
    });
    const res = await POST(req);
    const data = await res.json();
    expect(data.amountForMpesa).toBe(205.5);
  });

  it("creates order with user_id NULL", async () => {
    let capturedInsert: Record<string, unknown> | null = null;
    const orderChainable = makeChainable({});
    orderChainable.insert = vi.fn((payload) => {
      capturedInsert = payload;
      return {
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: { id: "order-1", order_id: "ORD-TEST" }, error: null }),
        })),
      };
    });
    const txChainable = makeChainable({ insert: vi.fn().mockResolvedValue({ data: {}, error: null }) });
    mockAdminClient.from.mockImplementation((table: string) => {
      if (table === "orders") return orderChainable;
      if (table === "wallet_transactions") return txChainable;
      return makeChainable({});
    });
    const service = { id: "svc-1", name: "YT", slug: "yt", category: "youtube", selling_price_ksh: 41.1, provider_service_id: "12345", min_quantity: 100, max_quantity: 1000000, supports_drip_feed: true, is_active: true, show_anonymous: true, description: null, display_order: 0, supports_refill: false, supports_cancel: false, show_sidebar: false, show_landing: false, show_guarded: false, show_catalogue: false, created_at: "", updated_at: "" };
    (listJanjezServices as ReturnType<typeof vi.fn>).mockResolvedValue([service]);
    (initiateStkPush as ReturnType<typeof vi.fn>).mockResolvedValue({ CheckoutRequestID: "test-id", CustomerMessage: "sent" });

    const req = mockRequest({
      janjez_service_id: "svc-1",
      link_submitted: "https://youtube.com/watch?v=test",
      quantity: 1000,
      phone_number: "0712345678",
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(capturedInsert).toMatchObject({
      user_id: null,
      anonymous: true,
      phone_number: "0712345678",
      payment_status: "pending_mpesa",
    });
  });
});
