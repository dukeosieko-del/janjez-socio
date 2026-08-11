import { describe, it, expect, vi, afterEach } from "vitest";
import { placeProviderOrder, smmPost } from "@/lib/smm/provider";

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetAllMocks();
});

describe("placeProviderOrder payload", () => {
  it("includes runs and interval when provided", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ order: 12345 }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await placeProviderOrder({
      service: 25934,
      link: "https://instagram.com/p/test",
      quantity: 100,
      runs: 10,
      interval: 60,
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const body = mockFetch.mock.calls[0][1].body as string;
    const params = new URLSearchParams(body);

    expect(params.get("service")).toBe("25934");
    expect(params.get("link")).toBe("https://instagram.com/p/test");
    expect(params.get("quantity")).toBe("100");
    expect(params.get("runs")).toBe("10");
    expect(params.get("interval")).toBe("60");
    expect(params.get("action")).toBe("add");
  });

  it("omits runs and interval when not provided (instant order)", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ order: 999 }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await placeProviderOrder({
      service: 25934,
      link: "https://instagram.com/p/test",
      quantity: 100,
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const params = new URLSearchParams(mockFetch.mock.calls[0][1].body as string);

    expect(params.has("runs")).toBe(false);
    expect(params.has("interval")).toBe(false);
    expect(params.get("service")).toBe("25934");
    expect(params.get("quantity")).toBe("100");
    expect(params.get("action")).toBe("add");
  });

  it("includes runs but omits interval when only runs is set", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ order: 111 }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await placeProviderOrder({
      service: 100,
      link: "https://example.com",
      quantity: 50,
      runs: 5,
    });

    const params = new URLSearchParams(mockFetch.mock.calls[0][1].body as string);
    expect(params.get("runs")).toBe("5");
    expect(params.has("interval")).toBe(false);
  });
});

describe("smmPost error handling", () => {
  it("throws on provider error field", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ error: "Invalid API key" }),
    }));

    await expect(smmPost({ action: "add" })).rejects.toThrow("Invalid API key");
  });

  it("throws on HTTP error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    }));

    await expect(smmPost({ action: "services" })).rejects.toThrow("Provider HTTP 500");
  });
});
