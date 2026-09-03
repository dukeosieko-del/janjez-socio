import { describe, it, expect } from "vitest";
import {
  getServiceTier,
  getTierInfo,
  filterServicesByTier,
  TIERS,
} from "@/lib/janjez-services";
import type { JanjezService } from "@/lib/janjez-services";

describe("service tier functions", () => {
  describe("getServiceTier", () => {
    it("returns 'champion' for prices <= 2000", () => {
      expect(getServiceTier(500)).toBe("champion");
      expect(getServiceTier(2000)).toBe("champion");
      expect(getServiceTier(1)).toBe("champion");
    });

    it("returns 'premium' for prices > 2000 and <= 6000", () => {
      expect(getServiceTier(2001)).toBe("premium");
      expect(getServiceTier(5000)).toBe("premium");
      expect(getServiceTier(6000)).toBe("premium");
    });

    it("returns 'enterprise' for prices > 6000", () => {
      expect(getServiceTier(6001)).toBe("enterprise");
      expect(getServiceTier(10000)).toBe("enterprise");
      expect(getServiceTier(50000)).toBe("enterprise");
    });

    it("handles boundary values exactly", () => {
      expect(getServiceTier(0)).toBe("champion");
      expect(getServiceTier(2000)).toBe("champion");
      expect(getServiceTier(2001)).toBe("premium");
      expect(getServiceTier(6000)).toBe("premium");
      expect(getServiceTier(6001)).toBe("enterprise");
    });
  });

  describe("getTierInfo", () => {
    it("returns correct info for champion", () => {
      const info = getTierInfo("champion");
      expect(info).toBeDefined();
      expect(info?.tier).toBe("champion");
      expect(info?.label).toBe("Champion");
      expect(info?.maxPrice).toBe(2000);
      expect(info?.href).toBe("/services/champion");
    });

    it("returns correct info for premium", () => {
      const info = getTierInfo("premium");
      expect(info).toBeDefined();
      expect(info?.tier).toBe("premium");
      expect(info?.label).toBe("Premium");
      expect(info?.maxPrice).toBe(6000);
      expect(info?.href).toBe("/services/premium");
    });

    it("returns correct info for enterprise", () => {
      const info = getTierInfo("enterprise");
      expect(info).toBeDefined();
      expect(info?.tier).toBe("enterprise");
      expect(info?.label).toBe("Enterprise");
      expect(info?.maxPrice).toBe(Infinity);
      expect(info?.href).toBe("/services/enterprise");
    });

    it("returns undefined for invalid tier", () => {
      expect(getTierInfo("invalid" as never)).toBeUndefined();
    });
  });

  describe("filterServicesByTier", () => {
    const services: JanjezService[] = [
      { id: "1", name: "Cheap Service", slug: "cheap", category: "social", subcategory: null, description: null, selling_price_ksh: 500, provider_service_id: null, min_quantity: 10, max_quantity: 1000, is_active: true, display_order: 1, supports_drip_feed: false, supports_refill: true, supports_cancel: false, show_sidebar: false, show_landing: false, show_guarded: true, show_anonymous: true, show_catalogue: true, created_at: "", updated_at: "" },
      { id: "2", name: "Mid Service", slug: "mid", category: "social", subcategory: null, description: null, selling_price_ksh: 4500, provider_service_id: null, min_quantity: 10, max_quantity: 1000, is_active: true, display_order: 2, supports_drip_feed: false, supports_refill: true, supports_cancel: false, show_sidebar: false, show_landing: false, show_guarded: true, show_anonymous: true, show_catalogue: true, created_at: "", updated_at: "" },
      { id: "3", name: "Expensive Service", slug: "expensive", category: "social", subcategory: null, description: null, selling_price_ksh: 10000, provider_service_id: null, min_quantity: 10, max_quantity: 1000, is_active: true, display_order: 3, supports_drip_feed: false, supports_refill: true, supports_cancel: false, show_sidebar: false, show_landing: false, show_guarded: true, show_anonymous: true, show_catalogue: true, created_at: "", updated_at: "" },
    ];

    it("filters champion tier (price <= 2000)", () => {
      const result = filterServicesByTier(services, "champion");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Cheap Service");
    });

    it("filters premium tier (price > 2000 and <= 6000)", () => {
      const result = filterServicesByTier(services, "premium");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Mid Service");
    });

    it("filters enterprise tier (price > 6000)", () => {
      const result = filterServicesByTier(services, "enterprise");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Expensive Service");
    });

    it("returns empty array for empty input", () => {
      expect(filterServicesByTier([], "champion")).toHaveLength(0);
      expect(filterServicesByTier([], "premium")).toHaveLength(0);
      expect(filterServicesByTier([], "enterprise")).toHaveLength(0);
    });
  });

  describe("TIERS constant", () => {
    it("has all three tiers defined", () => {
      expect(TIERS).toHaveLength(3);
      expect(TIERS.map((t) => t.tier)).toEqual(["champion", "premium", "enterprise"]);
    });

    it("tier hrefs are correct", () => {
      expect(TIERS.find((t) => t.tier === "champion")?.href).toBe("/services/champion");
      expect(TIERS.find((t) => t.tier === "premium")?.href).toBe("/services/premium");
      expect(TIERS.find((t) => t.tier === "enterprise")?.href).toBe("/services/enterprise");
    });
  });
});
