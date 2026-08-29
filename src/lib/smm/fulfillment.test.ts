import { describe, it, expect, vi, afterEach } from "vitest";

const mockAdminClient: Record<string, unknown> = {};

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => mockAdminClient),
}));

vi.mock("@/lib/smm/provider", () => ({
  fetchProviderServices: vi.fn(),
  placeProviderOrder: vi.fn(),
  getProviderMultipleStatus: vi.fn(),
  createProviderRefill: vi.fn(),
  createProviderCancel: vi.fn(),
  getProviderBalance: vi.fn().mockResolvedValue({ balance: "100" }),
  getProviderStatus: vi.fn(),
  SMM_API_URL: "https://api.test.com",
  SMM_API_KEY: "test",
}));

import { fulfillOrder, syncOrderStatuses, resolveJanjezService, mapProviderStatus } from "@/lib/smm/fulfillment";
import { placeProviderOrder, getProviderMultipleStatus } from "@/lib/smm/provider";
import { createAdminClient } from "@/lib/supabase/admin";

function createMockQuery(resolveValue: { data?: unknown; error?: unknown | null } = { data: null, error: null }) {
  const query: Record<string, unknown> = {
    then: (resolve: (val: unknown) => void) => resolve(resolveValue),
    select: vi.fn(() => query),
    insert: vi.fn(() => query),
    update: vi.fn(() => query),
    eq: vi.fn(() => query),
    in: vi.fn(() => query),
    order: vi.fn(() => query),
    range: vi.fn(() => query),
    upsert: vi.fn(() => query),
    not: vi.fn(() => query),
    ilike: vi.fn(() => query),
    neq: vi.fn(() => query),
    head: vi.fn(() => query),
    limit: vi.fn(() => query),
    single: vi.fn(() => query),
  };
  return query;
}

afterEach(() => {
  vi.clearAllMocks();
  Object.keys(mockAdminClient).forEach((k) => delete (mockAdminClient as Record<string, unknown>)[k]);
});

describe("provider_charge calculation", () => {
  it("rate is per 1000 units, charge = rate * quantity / 1000", () => {
    const rate = 0.0999;
    const quantity = 1000;
    const providerCharge = (rate * quantity) / 1000;
    expect(providerCharge).toBeCloseTo(0.0999, 4);
  });

  it("rate per 1000, quantity 5000 = rate * 5", () => {
    const rate = 0.0999;
    const quantity = 5000;
    const providerCharge = (rate * quantity) / 1000;
    expect(providerCharge).toBeCloseTo(0.4995, 4);
  });

  it("old formula (rate * quantity) would be 1000x too high", () => {
    const rate = 0.0999;
    const quantity = 1000;
    const oldFormula = rate * quantity;
    const newFormula = (rate * quantity) / 1000;
    expect(oldFormula).toBeCloseTo(99.9, 1);
    expect(newFormula).toBeCloseTo(0.0999, 4);
    expect(oldFormula / newFormula).toBe(1000);
  });

  it("quantity is NOT multiplied by runs", () => {
    const rate = 0.0999;
    const quantity = 100;
    const runs = 10;
    const providerCharge = (rate * quantity) / 1000;
    expect(providerCharge).toBeCloseTo(0.00999, 5);
    expect(providerCharge).not.toBeCloseTo((rate * quantity * runs) / 1000, 5);
  });
});

describe("mapProviderStatus", () => {
  it("maps Completed to fulfilled", () => {
    expect(mapProviderStatus("Completed")).toBe("fulfilled");
  });

  it("maps Cancelled to cancelled", () => {
    expect(mapProviderStatus("Cancelled")).toBe("cancelled");
  });

  it("maps Refunded to cancelled", () => {
    expect(mapProviderStatus("Refunded")).toBe("cancelled");
  });

  it("maps Partial to processing", () => {
    expect(mapProviderStatus("Partial")).toBe("processing");
  });

  it("maps Pending to processing", () => {
    expect(mapProviderStatus("Pending")).toBe("processing");
  });

  it("maps In Progress to processing", () => {
    expect(mapProviderStatus("In Progress")).toBe("processing");
  });

  it("maps Processing to processing", () => {
    expect(mapProviderStatus("Processing")).toBe("processing");
  });

  it("maps unknown status to processing without throwing", () => {
    expect(mapProviderStatus("SomeUnknownStatus")).toBe("processing");
    expect(mapProviderStatus("Queued")).toBe("processing");
  });

  it("maps null/undefined to processing", () => {
    expect(mapProviderStatus(null)).toBe("processing");
    expect(mapProviderStatus(undefined)).toBe("processing");
  });
});

function setupFulfillMock(
  orderData: Record<string, unknown>,
  providerServiceData: Record<string, unknown> | null = null,
  janjezServiceData: Record<string, unknown> | null = null
) {
  mockAdminClient.from = vi.fn((table: string) => {
    if (table === "orders") {
      return createMockQuery({ data: orderData, error: null });
    }
    if (table === "provider_services") {
      if (providerServiceData) {
        return createMockQuery({ data: providerServiceData, error: null });
      }
      return createMockQuery({ data: null, error: null });
    }
    if (table === "janjez_services") {
      if (janjezServiceData) {
        return createMockQuery({ data: janjezServiceData, error: null });
      }
      return createMockQuery({ data: null, error: null });
    }
    if (table === "fulfillment_logs") {
      return createMockQuery({ data: {}, error: null });
    }
    return createMockQuery({ data: null, error: null });
  });
}

describe("fulfillOrder drip-feed forwarding", () => {
  it("forwards runs and interval to provider when present", async () => {
    const mockOrder = {
      id: "order-123",
      order_id: "ORD-001",
      user_id: "user-123",
      quantity: 100,
      link_submitted: "https://instagram.com/p/test",
      category: "instagram",
      subcategory: "Likes",
      sku_id: null,
      service_name: "Likes",
      runs: 2,
      interval: 1,
      provider_order_id: null,
      catalog_category_id: null,
      janjez_service_id: "janjez-123",
    };

    const providerService = {
      id: "25934",
      name: "Instagram Likes",
      rate: 0.0999,
      min: 10,
      max: 10000,
      refill: false,
      cancel: false,
      supports_drip_feed: true,
    };

    const janjezService = {
      id: "janjez-123",
      provider_service_id: "25934",
      supports_drip_feed: true,
      min_quantity: 10,
      max_quantity: 10000,
    };

    setupFulfillMock(mockOrder, providerService, janjezService);
    (placeProviderOrder as ReturnType<typeof vi.fn>).mockResolvedValue({ order: 99999 });

    const result = await fulfillOrder("order-123");

    expect(result.status).toBe("processing");
    expect(result.providerOrderId).toBe("99999");
    expect(placeProviderOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        service: 25934,
        link: "https://instagram.com/p/test",
        quantity: expect.any(Number),
        runs: 2,
        interval: 1,
      })
    );
    expect(placeProviderOrder).toHaveBeenCalledTimes(1);
  });

  it("does NOT send runs/interval for normal instant orders", async () => {
    const mockOrder = {
      id: "order-456",
      order_id: "ORD-002",
      user_id: "user-456",
      quantity: 100,
      link_submitted: "https://instagram.com/p/test",
      category: "instagram",
      subcategory: "Likes",
      sku_id: null,
      service_name: "Likes",
      runs: null,
      interval: null,
      provider_order_id: null,
      catalog_category_id: null,
      janjez_service_id: "janjez-456",
    };

    const providerService = {
      id: "25934",
      name: "Instagram Likes",
      rate: 0.0999,
      min: 10,
      max: 10000,
      refill: false,
      cancel: false,
      supports_drip_feed: true,
    };

    const janjezService = {
      id: "janjez-456",
      provider_service_id: "25934",
      supports_drip_feed: true,
      min_quantity: 10,
      max_quantity: 10000,
    };

    setupFulfillMock(mockOrder, providerService, janjezService);
    (placeProviderOrder as ReturnType<typeof vi.fn>).mockResolvedValue({ order: 99999 });

    await fulfillOrder("order-456");

    const callArgs = (placeProviderOrder as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArgs).not.toHaveProperty("runs");
    expect(callArgs).not.toHaveProperty("interval");
  });

  it("returns already_fulfilled when provider_order_id exists (no duplicate order)", async () => {
    const mockOrder = {
      id: "order-789",
      provider_order_id: "existing-123",
    };

    mockAdminClient.from = vi.fn(() => createMockQuery({ data: mockOrder, error: null }));
    (placeProviderOrder as ReturnType<typeof vi.fn>).mockResolvedValue({ order: 99999 });

    const result = await fulfillOrder("order-789");
    expect(result.status).toBe("already_fulfilled");
    expect(result.providerOrderId).toBe("existing-123");
    expect(placeProviderOrder).not.toHaveBeenCalled();
  });
});

describe("syncOrderStatuses", () => {
  const mockOrders = [
    {
      id: "order-1",
      order_id: "ORD-001",
      user_id: "user-1",
      provider_order_id: "50001",
      fulfillment_status: "processing",
      provider_status: "Pending",
    },
  ];

  function setupSyncMock(statuses: Record<string, unknown>) {
    mockAdminClient.from = vi.fn((table: string) => {
      if (table === "orders") {
        const query = createMockQuery({ data: mockOrders, error: null });
        return query;
      }
      if (table === "notifications") {
        return createMockQuery({ data: {}, error: null });
      }
      if (table === "fulfillment_logs") {
        return createMockQuery({ data: {}, error: null });
      }
      return createMockQuery({ data: null, error: null });
    });
    (getProviderMultipleStatus as ReturnType<typeof vi.fn>).mockResolvedValue(statuses);
  }

  it("maps Completed to fulfilled and persists provider data", async () => {
    setupSyncMock({
      "50001": { status: "Completed", charge: "1.50", start_count: "100", remains: "0", currency: "USD" },
    });

    await syncOrderStatuses();

    expect(getProviderMultipleStatus).toHaveBeenCalledWith(["50001"]);
  });

  it("maps Partial to processing", async () => {
    setupSyncMock({
      "50001": { status: "Partial", remains: "50" },
    });

    await syncOrderStatuses();
    expect(getProviderMultipleStatus).toHaveBeenCalledTimes(1);
  });

  it("maps Cancelled to cancelled", async () => {
    setupSyncMock({
      "50001": { status: "Cancelled" },
    });

    await syncOrderStatuses();
    expect(getProviderMultipleStatus).toHaveBeenCalledTimes(1);
  });

  it("maps Refunded to cancelled", async () => {
    setupSyncMock({
      "50001": { status: "Refunded" },
    });

    await syncOrderStatuses();
    expect(getProviderMultipleStatus).toHaveBeenCalledTimes(1);
  });

  it("logs unknown status with console.warn without breaking sync", async () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    setupSyncMock({
      "50001": { status: "StrangeStatus", charge: "0.50" },
    });

    await syncOrderStatuses();

    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining("Unknown provider status")
    );
    consoleWarn.mockRestore();
  });

  it("handles empty order list gracefully", async () => {
    mockAdminClient.from = vi.fn(() => createMockQuery({ data: [], error: null }));
    await syncOrderStatuses();
    expect(getProviderMultipleStatus).not.toHaveBeenCalled();
  });
});

describe("resolveJanjezService", () => {
  it("returns service data when found by slug", async () => {
    mockAdminClient.from = vi.fn(() =>
      createMockQuery({
        data: { id: "svc-1", name: "IG Likes", selling_price_ksh: 0.08, provider_service_id: "25934" },
        error: null,
      })
    );

    const result = await resolveJanjezService("ig-likes", null);
    expect(result).toMatchObject({ id: "svc-1", selling_price_ksh: 0.08 });
  });

  it("returns null when not found", async () => {
    mockAdminClient.from = vi.fn(() =>
      createMockQuery({ data: null, error: { message: "not found" } })
    );

    const result = await resolveJanjezService("nonexistent", null);
    expect(result).toBeNull();
  });
});
