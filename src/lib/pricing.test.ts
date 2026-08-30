import { describe, it, expect } from "vitest";
import { calculateOrderCost, calculateProviderCharge, calculateJanjezRevenue, getJanjezSellingPrice, getDripFeedPrice, calculateMpesaAmount, SERVICE_CHARGE_KES } from "@/lib/pricing";

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

    it("handles provider rate 3, quantity 1", () => {
      expect(calculateOrderCost(41.1, 1)).toBe(0.04);
    });

    it("handles provider rate 3, quantity 100", () => {
      expect(calculateOrderCost(41.1, 100)).toBe(4.11);
    });

    it("handles provider rate 3, quantity 1000", () => {
      expect(calculateOrderCost(41.1, 1000)).toBe(41.1);
    });

    it("handles provider rate 3, quantity 5000", () => {
      expect(calculateOrderCost(41.1, 5000)).toBe(205.5);
    });

    it("handles decimal provider rate", () => {
      expect(calculateOrderCost(29.95, 1000)).toBe(29.95);
    });

    it("handles drip-feed orders (same formula as instant)", () => {
      expect(calculateOrderCost(41.1, 5000)).toBe(205.5);
    });

    it("handles instant order (same formula as drip-feed)", () => {
      expect(calculateOrderCost(41.1, 1000)).toBe(41.1);
    });

    it("accepts minimum quantity 1", () => {
      expect(calculateOrderCost(41.1, 1)).toBe(0.04);
    });

    it("accepts maximum quantity", () => {
      const result = calculateOrderCost(41.1, 1000000);
      expect(result).toBe(41100);
    });

    it("rejects invalid quantity (zero returns zero cost)", () => {
      expect(calculateOrderCost(41.1, 0)).toBe(0);
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

  describe("calculateJanjezRevenue", () => {
    it("calculates revenue as selling price minus provider cost", () => {
      expect(calculateJanjezRevenue(41.1, 3.0, 1000)).toBe(38.1);
    });

    it("calculates revenue for fractional quantity", () => {
      expect(calculateJanjezRevenue(41.1, 3.0, 100)).toBe(3.81);
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

  describe("getDripFeedPrice", () => {
    it("returns formatted KSh string", () => {
      expect(getDripFeedPrice(41.1, 1000)).toBe("KSh 41.10");
    });
  });

  describe("M-Pesa amount calculation", () => {
    it("adds KES 7 service charge and rounds up to whole shillings", () => {
      expect(calculateMpesaAmount(41.1)).toBe(49);
      expect(calculateMpesaAmount(50)).toBe(57);
      expect(calculateMpesaAmount(205.5)).toBe(213);
      expect(calculateMpesaAmount(0)).toBe(7);
    });
  });
});
