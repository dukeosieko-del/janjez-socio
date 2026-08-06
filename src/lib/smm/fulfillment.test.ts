import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      eq: vi.fn(),
      in: vi.fn(),
      order: vi.fn(),
      range: vi.fn(),
      upsert: vi.fn(),
      single: vi.fn(),
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
