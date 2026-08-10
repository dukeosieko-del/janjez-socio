import { describe, it, expect, vi } from "vitest";

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
    id: "js-2",
    name: "Disabled Service",
    slug: "disabled-service",
    category: "youtube",
    subcategory: "likes",
    description: "Disabled",
    selling_price_ksh: 50,
    min_quantity: 1,
    max_quantity: 100,
    is_active: false,
    display_order: 2,
    supports_drip_feed: false,
    supports_refill: false,
    supports_cancel: false,
  },
];

function createQueryBuilder(initialFiltered = services) {
  let filtered = [...initialFiltered];

  const builder: Record<string, unknown> = {
    select: vi.fn(function () {
      return createQueryBuilder(filtered);
    }),
    eq: vi.fn(function (_col: string, val: unknown) {
      if (_col === "is_active") {
        filtered = filtered.filter((s) => s.is_active === val);
      }
      if (_col === "id") {
        filtered = filtered.filter((s) => s.id === val);
      }
      return builder;
    }),
    ilike: vi.fn(function () {
      return builder;
    }),
    or: vi.fn(function () {
      return builder;
    }),
    order: vi.fn(function () {
      return builder;
    }),
    range: vi.fn(function () {
      return Promise.resolve({ data: filtered, count: filtered.length, error: null });
    }),
    single: vi.fn(function () {
      const item = filtered[0] || null;
      return Promise.resolve({ data: item, error: item ? null : { message: "Not found" } });
    }),
    then: (onFulfilled: (value: { data: unknown; error: null }) => void) =>
      Promise.resolve({ data: filtered, error: null }).then(onFulfilled),
  };

  return builder;
}

const mockSupabase = () => ({
  from: vi.fn(() => ({
    select: vi.fn(() => createQueryBuilder()),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn().mockResolvedValue({ data: { id: "new" }, error: null }),
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
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: "admin-1" } }, error: null }),
  },
});

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(mockSupabase),
}));

describe("GET /api/services", () => {
  it("returns only active Janjez services", async () => {
    const { GET } = await import("@/app/api/services/route");
    const request = new Request("http://localhost/api/services");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.services).toBeDefined();
    expect(data.services.length).toBeGreaterThan(0);
    expect(data.services.every((s: { is_active: boolean }) => s.is_active === true)).toBe(true);
  });

  it("does not expose provider credentials", async () => {
    const { GET } = await import("@/app/api/services/route");
    const request = new Request("http://localhost/api/services");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    const firstService = data.services[0];
    expect(firstService).not.toHaveProperty("provider_service");
    expect(firstService).not.toHaveProperty("provider_services");
  });

  it("returns Janjez selling price, not provider rate", async () => {
    const { GET } = await import("@/app/api/services/route");
    const request = new Request("http://localhost/api/services");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    const firstService = data.services[0];
    expect(firstService).toHaveProperty("selling_price_ksh");
    expect(firstService.selling_price_ksh).toBe(100);
  });
});

describe("GET /api/services/[id]", () => {
  it("returns a single service by ID", async () => {
    const { GET } = await import("@/app/api/services/[id]/route");
    const request = new Request("http://localhost/api/services/js-1");
    const params = { id: "js-1" };

    const response = await GET(request, { params: Promise.resolve(params) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.service).toBeDefined();
    expect(data.service.id).toBe("js-1");
    expect(data.service.name).toBe("Test Service");
  });

  it("returns 404 for non-existent service", async () => {
    const { GET } = await import("@/app/api/services/[id]/route");
    const request = new Request("http://localhost/api/services/non-existent");
    const params = { id: "non-existent" };

    const response = await GET(request, { params: Promise.resolve(params) });
    expect(response.status).toBe(404);
  });
});
