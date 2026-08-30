export interface PricingBreakdown {
  sellingPricePer1000: number;
  quantity: number;
  subtotal: number;
  providerCharge: number;
  janjezRevenue: number;
}

export const SERVICE_CHARGE_KES = 7;

export function calculateOrderCost(sellingPricePer1000: number, quantity: number): number {
  return Math.round((sellingPricePer1000 * quantity) / 1000 * 100) / 100;
}

export function calculateProviderCharge(providerRatePer1000: number, quantity: number): number {
  return Math.round((providerRatePer1000 * quantity) / 1000 * 100) / 100;
}

export function calculateJanjezRevenue(sellingPricePer1000: number, providerRatePer1000: number, quantity: number): number {
  const revenue = (sellingPricePer1000 - providerRatePer1000) * quantity / 1000;
  return Math.round(revenue * 100) / 100;
}

export function getDripFeedPrice(sellingPricePer1000: number, quantity: number): string {
  const cost = calculateOrderCost(sellingPricePer1000, quantity);
  return `KSh ${cost.toFixed(2)}`;
}

export function getJanjezSellingPrice(providerRatePer1000: number, multiplier = 13.7): number {
  return Math.round(providerRatePer1000 * multiplier * 100) / 100;
}

export function calculateMpesaAmount(orderAmount: number): number {
  return Math.ceil(orderAmount + SERVICE_CHARGE_KES);
}
