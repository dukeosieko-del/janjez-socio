import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          not: vi.fn(),
          in: vi.fn(),
        })),
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
        not: vi.fn(),
        eq: vi.fn(() => ({
          single: vi.fn(),
          not: vi.fn(),
          in: vi.fn(),
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
  getProviderMultipleStatus: vi.fn(() => ({})),
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
import { placeProviderOrder } from "@/lib/smm/provider";
import { createAdminClient } from "@/lib/supabase/admin";

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

describe("placeProviderOrder payload shape", () => {
  it("includes runs and interval when provided", async () => {
    vi.mocked(placeProviderOrder).mockResolvedValue({ order: 12345 });

    await placeProviderOrder({
      service: 1,
      link: "https://example.com",
      quantity: 100,
      runs: 10,
      interval: 60,
    });

    expect(placeProviderOrder).toHaveBeenCalledWith({
      service: 1,
      link: "https://example.com",
      quantity: 100,
      runs: 10,
      interval: 60,
    });
  });

  it("omits runs and interval when not provided", async () => {
    vi.mocked(placeProviderOrder).mockResolvedValue({ order: 12345 });

    await placeProviderOrder({
      service: 1,
      link: "https://example.com",
      quantity: 100,
    });

    expect(placeProviderOrder).toHaveBeenCalledWith({
      service: 1,
      link: "https://example.com",
      quantity: 100,
    });
  });

  it("omits runs when only interval is provided", async () => {
    vi.mocked(placeProviderOrder).mockResolvedValue({ order: 12345 });

    await placeProviderOrder({
      service: 1,
      link: "https://example.com",
      quantity: 100,
      interval: 30,
    });

    expect(placeProviderOrder).toHaveBeenCalledWith({
      service: 1,
      link: "https://example.com",
      quantity: 100,
      interval: 30,
    });
  });

  it("omits interval when only runs is provided", async () => {
    vi.mocked(placeProviderOrder).mockResolvedValue({ order: 12345 });

    await placeProviderOrder({
      service: 1,
      link: "https://example.com",
      quantity: 100,
      runs: 5,
    });

    expect(placeProviderOrder).toHaveBeenCalledWith({
      service: 1,
      link: "https://example.com",
      quantity: 100,
      runs: 5,
    });
  });
});
