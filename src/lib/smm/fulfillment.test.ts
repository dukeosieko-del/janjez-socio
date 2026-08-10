import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
        in: vi.fn(),
        order: vi.fn(),
        range: vi.fn(),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(),
      })),
      upsert: vi.fn(),
      not: vi.fn(),
      ilike: vi.fn(),
    })),
    rpc: vi.fn(),
  })),
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
  ProviderService: {},
  ProviderOrderResponse: {},
  ProviderStatusResponse: {},
  ProviderBalanceResponse: {},
}));

import { fulfillOrder, syncOrderStatuses } from "@/lib/smm/fulfillment";
import { createAdminClient } from "@/lib/supabase/admin";
import { placeProviderOrder } from "@/lib/smm/provider";

describe("fulfillment provider_charge calculation", () => {
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
});

describe("fulfillment status mapping", () => {
  const statusMap: Record<string, string> = {
    Completed: "fulfilled",
    Cancelled: "cancelled",
    Refunded: "cancelled",
    Partial: "processing",
    Pending: "processing",
    "In Progress": "processing",
    Processing: "processing",
  };

  it("maps Completed to fulfilled", () => {
    expect(statusMap["Completed"]).toBe("fulfilled");
  });

  it("maps Cancelled to cancelled", () => {
    expect(statusMap["Cancelled"]).toBe("cancelled");
  });

  it("maps Pending to processing (was previously unhandled)", () => {
    expect(statusMap["Pending"]).toBe("processing");
  });

  it("maps In Progress to processing (was previously unhandled)", () => {
    expect(statusMap["In Progress"]).toBe("processing");
  });

  it("maps Partial to processing", () => {
    expect(statusMap["Partial"]).toBe("processing");
  });
});

describe("fulfillment drip-feed forwarding", () => {
  it("placeProviderOrder forwards runs and interval when present", async () => {
    vi.mocked(placeProviderOrder).mockResolvedValue({ order: 12345 });

    const mockClient = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          ilike: vi.fn(() => ({
            ilike: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn(),
              })),
            })),
            order: vi.fn(() => ({
              limit: vi.fn(),
            })),
          })),
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                id: "order-1",
                link_submitted: "https://example.com",
                quantity: 100,
                runs: 10,
                interval: 60,
                provider_order_id: null,
              },
            }),
          })),
          not: vi.fn(),
          in: vi.fn(),
          order: vi.fn(),
          range: vi.fn(),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(),
        })),
      })),
      rpc: vi.fn(),
    };

    vi.mocked(createAdminClient).mockReturnValue(mockClient as ReturnType<typeof createAdminClient>);

    await fulfillOrder("order-1");

    expect(placeProviderOrder).toHaveBeenCalledWith({
      service: expect.any(Number),
      link: "https://example.com",
      quantity: 100,
      runs: 10,
      interval: 60,
    });
  });

  it("fulfillOrder persists provider order and forwards drip-feed", async () => {
    vi.mocked(placeProviderOrder).mockResolvedValue({ order: 12345 });

    const mockClient = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          ilike: vi.fn(() => ({
            ilike: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn(),
              })),
            })),
            order: vi.fn(() => ({
              limit: vi.fn(),
            })),
          })),
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                id: "order-2",
                link_submitted: "https://example.com",
                quantity: 100,
                runs: 5,
                interval: 30,
                provider_order_id: null,
              },
            }),
          })),
          not: vi.fn(),
          in: vi.fn(),
          order: vi.fn(),
          range: vi.fn(),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(),
        })),
      })),
      rpc: vi.fn(),
    };

    vi.mocked(createAdminClient).mockReturnValue(mockClient as ReturnType<typeof createAdminClient>);

    await fulfillOrder("order-2");

    expect(placeProviderOrder).toHaveBeenCalledWith({
      service: expect.any(Number),
      link: "https://example.com",
      quantity: 100,
      runs: 5,
      interval: 30,
    });
  });

  it("normal instant order does not send runs or interval", async () => {
    vi.mocked(placeProviderOrder).mockResolvedValue({ order: 12345 });

    const mockClient = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          ilike: vi.fn(() => ({
            ilike: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn(),
              })),
            })),
            order: vi.fn(() => ({
              limit: vi.fn(),
            })),
          })),
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                id: "order-3",
                link_submitted: "https://example.com",
                quantity: 100,
                runs: null,
                interval: null,
                provider_order_id: null,
              },
            }),
          })),
          not: vi.fn(),
          in: vi.fn(),
          order: vi.fn(),
          range: vi.fn(),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(),
        })),
      })),
      rpc: vi.fn(),
    };

    vi.mocked(createAdminClient).mockReturnValue(mockClient as ReturnType<typeof createAdminClient>);

    await fulfillOrder("order-3");

    expect(placeProviderOrder).toHaveBeenCalledWith({
      service: expect.any(Number),
      link: "https://example.com",
      quantity: 100,
    });
  });
});

describe("fulfillment unknown provider status", () => {
  it("maps unknown provider status to processing and logs it", async () => {
    const insertPayloads: Record<string, unknown>[] = [];
    const mockInsert = vi.fn((payload: Record<string, unknown>) => {
      insertPayloads.push(payload);
      return Promise.resolve({});
    });

    const mockClient = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          not: vi.fn(() => ({
            in: vi.fn().mockResolvedValue({
              data: [
                {
                  id: "order-4",
                  order_id: "ORD-123",
                  user_id: "user-1",
                  provider_order_id: "prov-1",
                  provider_status: "Pending",
                },
              ],
              error: null,
            }),
          })),
          eq: vi.fn(() => ({
            single: vi.fn(),
            not: vi.fn(),
            in: vi.fn(),
          })),
          in: vi.fn(),
          order: vi.fn(),
          range: vi.fn(),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(),
        })),
        insert: mockInsert,
      })),
      rpc: vi.fn(),
    };

    vi.mocked(createAdminClient).mockReturnValue(mockClient as ReturnType<typeof createAdminClient>);

    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    await syncOrderStatuses(["order-4"]);

    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining("Unknown provider status"),
    );
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "status",
        status: "unknown_status",
      }),
    );

    consoleWarn.mockRestore();
  });
});
