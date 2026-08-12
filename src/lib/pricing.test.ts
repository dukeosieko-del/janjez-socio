import { describe, it, expect } from "vitest";
import { calculateOrderCost, calculateProviderCharge, getJanjezSellingPrice } from "@/lib/pricing";

describe("pricing", () => {
  describe("calculateOrderCost", () => {
    it("calculates cost per 1000 units", () => {
      expect(calculateOrderCost(41.1, 1000)).toBe(41.1);
    });

    it("calculates cost for quantity less than 1000", () => {
      expect(calculateOrderCost(41.1, 100)).toBe(4.11);
    });

    it("calculates cost for quantity greater than 1000", () => {
      expect(calculateOrderCost(41.1, 100000)).toBe(4110);
    });

    it("returns 0 for zero quantity", () => {
      expect(calculateOrderCost(41.1, 0)).toBe(0);
    });

    it("rounds to 2 decimal places (KSh)", () => {
      expect(calculateOrderCost(3.3, 100)).toBe(0.33);
    });
  });

  describe("calculateProviderCharge", () => {
    it("calculates provider charge per 1000", () => {
      expect(calculateProviderCharge(3.0, 100000)).toBe(300);
    });

    it("rounds to 2 decimal places", () => {
      expect(calculateProviderCharge(3.0, 100)).toBe(0.3);
    });
  });

  describe("getJanjezSellingPrice", () => {
    it("multiplies provider rate by 13.7", () => {
      expect(getJanjezSellingPrice(3.0)).toBe(41.1);
    });

    it("rounds to 2 decimal places", () => {
      expect(getJanjezSellingPrice(2.99)).toBe(40.96);
    });

    it("uses custom multiplier when provided", () => {
      expect(getJanjezSellingPrice(10.0, 2)).toBe(20);
    });
  });

  describe("KSh 50 minimum top-up", () => {
    it("order cost below KSh 50 requires KSh 50 top-up", () => {
      const orderCost = 41.1;
      const minTopUp = 50;
      const requiredTopUp = Math.max(minTopUp, orderCost);
      expect(requiredTopUp).toBe(50);
    });

    it("removes wallet remainder correctly", () => {
      const orderCost = 41.1;
      const topUp = 50;
      const remainder = topUp - orderCost;
      expect(remainder).toBeCloseTo(8.9, 2);
    });
  });
});
