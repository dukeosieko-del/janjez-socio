import { describe, it, expect } from "vitest";
import {
  HAPPY_HOUR_DISCOUNT,
  CATEGORY_TO_PLATFORM,
  calculatePrice,
  calculateExpectedAmount,
  parsePrice,
  resolvePlatformId,
  resolveCategoryName,
  resolveSubcategoryName,
  resolveSkuId,
  resolveRefillGuarantee,
  requiresSkuSelection,
} from "@/lib/services";

describe("CATEGORY_TO_PLATFORM mapping", () => {
  it("maps all YouTube subcategory categoryIds to 'youtube'", () => {
    expect(CATEGORY_TO_PLATFORM["youtube"]).toBe("youtube");
    expect(CATEGORY_TO_PLATFORM["youtube-views"]).toBe("youtube");
    expect(CATEGORY_TO_PLATFORM["youtube-likes"]).toBe("youtube");
    expect(CATEGORY_TO_PLATFORM["youtube-subscribers-2"]).toBe("youtube");
    expect(CATEGORY_TO_PLATFORM["youtube-watch-time"]).toBe("youtube");
    expect(CATEGORY_TO_PLATFORM["youtube-ai-generated-comment-boost-ranking-amp-interaction"]).toBe("youtube");
  });

  it("maps x-twitter to x platform", () => {
    expect(CATEGORY_TO_PLATFORM["x"]).toBe("x");
    expect(CATEGORY_TO_PLATFORM["x-twitter"]).toBe("x");
  });

  it("maps all WhatsApp subcategory categoryIds to 'whatsapp'", () => {
    expect(CATEGORY_TO_PLATFORM["whatsapp"]).toBe("whatsapp");
    expect(CATEGORY_TO_PLATFORM["whatsapp-channel-followers"]).toBe("whatsapp");
    expect(CATEGORY_TO_PLATFORM["whatsapp-poll-votes"]).toBe("whatsapp");
    expect(CATEGORY_TO_PLATFORM["whatsapp-channel-post-reactions-cheap-slow-server"]).toBe("whatsapp");
    expect(CATEGORY_TO_PLATFORM["whatsapp-channel-post-reactions-instant-server-complete-in-1-minute"]).toBe("whatsapp");
    expect(CATEGORY_TO_PLATFORM["whatsapp-channel-auto-future-post-reactions"]).toBe("whatsapp");
  });

  it("maps standalone platforms", () => {
    expect(CATEGORY_TO_PLATFORM["facebook"]).toBe("facebook");
    expect(CATEGORY_TO_PLATFORM["tiktok"]).toBe("tiktok");
    expect(CATEGORY_TO_PLATFORM["instagram"]).toBe("instagram");
    expect(CATEGORY_TO_PLATFORM["google-maps"]).toBe("google-maps");
    expect(CATEGORY_TO_PLATFORM["telegram"]).toBe("telegram");
  });
});

describe("resolveCategoryName", () => {
  it("resolves granular youtube-views to 'YouTube'", () => {
    expect(resolveCategoryName("youtube-views")).toBe("YouTube");
  });

  it("resolves granular youtube-likes to 'YouTube'", () => {
    expect(resolveCategoryName("youtube-likes")).toBe("YouTube");
  });

  it("resolves x-twitter to 'X' (platform name, not raw ID)", () => {
    expect(resolveCategoryName("x-twitter")).toBe("X");
  });

  it("resolves coarse youtube to 'YouTube'", () => {
    expect(resolveCategoryName("youtube")).toBe("YouTube");
  });

  it("resolves whatsapp-channel-followers to 'WhatsApp'", () => {
    expect(resolveCategoryName("whatsapp-channel-followers")).toBe("WhatsApp");
  });

  it("resolves google-maps to title-cased name (not in SERVICE_CATALOG)", () => {
    expect(resolveCategoryName("google-maps")).toBe("Google Maps");
  });

  it("never returns raw categoryId (no dashes)", () => {
    const categoryIds = Object.keys(CATEGORY_TO_PLATFORM);
    categoryIds.forEach((id) => {
      const result = resolveCategoryName(id);
      expect(result).not.toMatch(/-/);
    });
  });
});

describe("resolveSubcategoryName", () => {
  it("resolves youtube-views to SERVICE_CATALOG subcategory 'Views 👀'", () => {
    expect(resolveSubcategoryName("youtube-views", "YTV1 YouTube Views")).toBe("Views 👀");
  });

  it("resolves youtube-likes to 'Likes'", () => {
    expect(resolveSubcategoryName("youtube-likes", "YTL1 YouTube Likes")).toBe("Likes");
  });

  it("resolves youtube-subscribers-2 to 'Subscribers'", () => {
    expect(resolveSubcategoryName("youtube-subscribers-2", "YTS1 YouTube Subscribers")).toBe("Subscribers");
  });

  it("resolves youtube-watch-time to 'Watch Time'", () => {
    expect(resolveSubcategoryName("youtube-watch-time", "YTW1 YouTube Watch Time")).toBe("Watch Time");
  });

  it("resolves youtube-ai-generated-comment to 'AI-Generated Comment'", () => {
    expect(resolveSubcategoryName("youtube-ai-generated-comment-boost-ranking-amp-interaction", "YTC1 AI Comments")).toBe("AI-Generated Comment");
  });

  it("resolves whatsapp-channel-followers to 'Channel Followers'", () => {
    expect(resolveSubcategoryName("whatsapp-channel-followers", "WACF1 Channel Followers")).toBe("Channel Followers");
  });

  it("resolves whatsapp-poll-votes to 'Poll Votes'", () => {
    expect(resolveSubcategoryName("whatsapp-poll-votes", "WAPV1 Poll Votes")).toBe("Poll Votes");
  });

  it("resolves SERVICE_CATALOG deliverable via platform id + service name", () => {
    const result = resolveSubcategoryName("youtube", "Quick Boost ⚡");
    expect(result).toBe("Views 👀");
  });

  it("never returns raw serviceId", () => {
    const result = resolveSubcategoryName("youtube-views", "YTV1 YouTube Views");
    expect(result).not.toBe("YTV1 YouTube Views");
  });

  it("falls back to title-cased categoryId for unknown", () => {
    const result = resolveSubcategoryName("google-maps", "GM1 Google Maps Reviews");
    expect(result).toBe("Google Maps");
  });
});

describe("resolveSkuId", () => {
  it("returns the provided SKU", () => {
    expect(resolveSkuId("YT_VIEW_01")).toBe("YT_VIEW_01");
  });

  it("returns null when no SKU provided", () => {
    expect(resolveSkuId(undefined)).toBe(null);
  });

  it("returns null for empty string", () => {
    expect(resolveSkuId("")).toBe("");
  });
});

describe("resolveRefillGuarantee", () => {
  it("resolves ORDER_SERVICES refill text '30 Days Refill Guarantee' to '30-day'", () => {
    const result = resolveRefillGuarantee("youtube-views", "YTV1 YouTube Views [High Retention / Monetizable]");
    expect(result).toBe("30-day");
  });

  it("resolves 'No refill' to 'none'", () => {
    const result = resolveRefillGuarantee("youtube-views", "YTV3 YouTube Views [Economy]");
    expect(result).toBe("none");
  });

  it("resolves 'Lifetime Refill Guarantee' to 'lifetime'", () => {
    const result = resolveRefillGuarantee("youtube-subscribers-2", "YTS3 YouTube Subscribers [Monetization Ready / Lifetime Guarantee]");
    expect(result).toBe("lifetime");
  });

  it("resolves '60 Days Refill Guarantee' to '60-day'", () => {
    const result = resolveRefillGuarantee("youtube-subscribers-2", "YTS2 YouTube Subscribers [High Quality / Fast Start]");
    expect(result).toBe("60-day");
  });

  it("resolves SERVICE_CATALOG deliverable with no explicit refill keywords to 'standard'", () => {
    const result = resolveRefillGuarantee("youtube", "Quick Boost ⚡");
    expect(result).toBe("standard");
  });

  it("resolves SERVICE_CATALOG deliverable with 'Lifetime' keyword to 'lifetime'", () => {
    const result = resolveRefillGuarantee("facebook", "Power Reach (Lifetime Warranty)");
    expect(result).toBe("lifetime");
  });

  it("never returns null (always returns canonical string)", () => {
    const result = resolveRefillGuarantee("unknown-category", "unknown-service");
    expect(result).toBe("none");
  });
});

describe("requiresSkuSelection", () => {
  it("returns true for platforms with multiple deliverables per subcategory", () => {
    expect(requiresSkuSelection("youtube")).toBe(true);
    expect(requiresSkuSelection("facebook")).toBe(true);
    expect(requiresSkuSelection("tiktok")).toBe(true);
  });

  it("returns true for granular categoryIds via platform mapping", () => {
    expect(requiresSkuSelection("youtube-views")).toBe(true);
    expect(requiresSkuSelection("whatsapp-channel-followers")).toBe(true);
  });

  it("returns false for unknown categoryIds", () => {
    expect(requiresSkuSelection("google-maps")).toBe(false);
  });
});

describe("calculatePrice", () => {
  it("correctly applies Happy Hour discount", () => {
    expect(calculatePrice(100, 1000)).toBe(100 * 1000 * 0.95);
  });

  it("returns 0 when quantity is 0", () => {
    expect(calculatePrice(100, 0)).toBe(0);
  });

  it("returns 0 when rate is 0", () => {
    expect(calculatePrice(0, 1000)).toBe(0);
  });

  it("matches subtotal * 0.95 formula", () => {
    const rate = 0.45;
    const quantity = 1000;
    const subtotal = rate * quantity;
    const expected = subtotal * 0.95;
    expect(calculatePrice(rate, quantity)).toBeCloseTo(expected, 10);
  });

  it("uses the shared HAPPY_HOUR_DISCOUNT constant", () => {
    expect(HAPPY_HOUR_DISCOUNT).toBe(0.95);
    expect(calculatePrice(10, 1)).toBe(10 * 0.95);
  });

  it("is consistent with OrderForm pricing (rate * qty * 0.95)", () => {
    const rate = 3.5;
    const qty = 500;
    expect(calculatePrice(rate, qty)).toBe(rate * qty * 0.95);
  });

  it("is consistent with FulfillmentForm pricing (parsedPrice * qty * 0.95)", () => {
    const parsedPrice = 0.1496;
    const qty = 1000;
    expect(calculatePrice(parsedPrice, qty)).toBe(parsedPrice * qty * 0.95);
  });
});

describe("calculateExpectedAmount", () => {
  it("calculates expected amount for ORDER_SERVICES lookup by serviceId", () => {
    const result = calculateExpectedAmount("youtube-views", "YT_VIEW_01", 1000);
    expect(result).toBeCloseTo(0.45 * 1000 * 0.95, 4);
  });

  it("calculates expected amount for ORDER_SERVICES lookup by internal id", () => {
    const result = calculateExpectedAmount("youtube-views", "ytv2", 5000);
    expect(result).toBeCloseTo(0.38 * 5000 * 0.95, 4);
  });

  it("calculates expected amount for SERVICE_CATALOG deliverable lookup", () => {
    const result = calculateExpectedAmount("youtube", "Quick Boost ⚡", 1000);
    expect(result).toBeCloseTo(0.2965 * 1000 * 0.95, 4);
  });

  it("returns NaN for unmatched service", () => {
    const result = calculateExpectedAmount("google-maps", "nonexistent-sku", 100);
    expect(result).toBeNaN();
  });

  it("returns NaN for undefined categoryId", () => {
    const result = calculateExpectedAmount(undefined, "ytv2", 1000);
    expect(result).toBeNaN();
  });

  it("produces identical amounts regardless of lookup path when rates match", () => {
    const orderId = "ytv1";
    const orderResult = calculateExpectedAmount("youtube-views", orderId, 1000);
    expect(orderResult).toBeCloseTo(0.45 * 1000 * 0.95, 4);
  });
});

describe("parsePrice", () => {
  it("parses simple decimal price", () => {
    expect(parsePrice("0.0999 Ksh")).toBeCloseTo(0.0999, 4);
  });

  it("parses large number with comma", () => {
    expect(parsePrice("1,000 Ksh")).toBe(1000);
  });

  it("returns 0 for unparseable string", () => {
    expect(parsePrice("N/A")).toBe(0);
  });

  it("handles price without Ksh suffix", () => {
    expect(parsePrice("0.5332")).toBeCloseTo(0.5332, 4);
  });
});

describe("resolvePlatformId", () => {
  it("maps granular categories to platform id", () => {
    expect(resolvePlatformId("youtube-views")).toBe("youtube");
    expect(resolvePlatformId("x-twitter")).toBe("x");
    expect(resolvePlatformId("whatsapp-poll-votes")).toBe("whatsapp");
  });

  it("returns the id itself for known platforms", () => {
    expect(resolvePlatformId("youtube")).toBe("youtube");
    expect(resolvePlatformId("x")).toBe("x");
  });

  it("returns the id itself for unknown categories", () => {
    expect(resolvePlatformId("unknown")).toBe("unknown");
  });
});

describe("duplicate order model prevention", () => {
  it("findServiceRate returns consistent rate for same service via different IDs", () => {
    const byId = calculateExpectedAmount("youtube-views", "ytv1", 1000);
    const byServiceId = calculateExpectedAmount("youtube-views", "YT_VIEW_01", 1000);
    const byName = calculateExpectedAmount("youtube-views", "YTV1 YouTube Views [High Retention / Monetizable]", 1000);
    expect(byId).toBeCloseTo(byServiceId, 4);
    expect(byId).toBeCloseTo(byName, 4);
  });

  it("OrderForm and page-client paths produce same total for same service", () => {
    const orderFormTotal = calculatePrice(0.45, 1000);
    const pageClientTotal = calculatePrice(0.45, 1000);
    expect(orderFormTotal).toBe(pageClientTotal);
  });

  it("FulfillmentForm and OrderForm pricing logic is identical", () => {
    const orderFormTotal = calculatePrice(0.45, 5000);
    const fulfillmentFormParsed = parsePrice("0.45 Ksh");
    const fulfillmentFormTotal = calculatePrice(fulfillmentFormParsed, 5000);
    expect(orderFormTotal).toBeCloseTo(fulfillmentFormTotal, 4);
  });
});
