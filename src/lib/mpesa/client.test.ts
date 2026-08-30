import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { StkPushParams } from "@/lib/mpesa/client";

const mockEnv = {
  MPESA_ENV: "sandbox",
  MPESA_CONSUMER_KEY: "test_key",
  MPESA_CONSUMER_SECRET: "test_secret",
  MPESA_SHORTCODE: "123456",
  MPESA_PASSKEY: "test_passkey",
  MPESA_INITIATOR_NAME: "test_initiator",
  MPESA_INITIATOR_PASSWORD: "test_initiator_pass",
  MPESA_PARTY_B: "123456",
  NEXT_PUBLIC_SITE_URL: "https://janjez.test",
  SUPABASE_SERVICE_ROLE_KEY: "test_key",
  NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
};

describe("mpesa client", () => {
  let client: typeof import("@/lib/mpesa/client");

  beforeEach(async () => {
    Object.entries(mockEnv).forEach(([k, v]) => (process.env[k] = v));
    vi.resetModules();
    client = await import("@/lib/mpesa/client");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("formatPhoneNumber", () => {
    it("converts leading 0 to 254", () => {
      expect(client.formatPhoneNumber("0712345678")).toBe("254712345678");
    });

    it("strips + prefix and converts", () => {
      expect(client.formatPhoneNumber("+254712345678")).toBe("254712345678");
    });

    it("adds 254 prefix if missing", () => {
      expect(client.formatPhoneNumber("712345678")).toBe("254712345678");
    });

    it("strips spaces", () => {
      expect(client.formatPhoneNumber("0712 345 678")).toBe("254712345678");
    });
  });

  describe("getCallbackUrl", () => {
    it("uses provided origin", () => {
      expect(client.getCallbackUrl("https://janjez.social")).toBe("https://janjez.social/api/mpesa/callback");
    });

    it("falls back to NEXT_PUBLIC_SITE_URL", () => {
      expect(client.getCallbackUrl()).toBe("https://janjez.test/api/mpesa/callback");
    });

    it("falls back to janjez.social when env missing", async () => {
      delete process.env.NEXT_PUBLIC_SITE_URL;
      vi.resetModules();
      const mod = await import("@/lib/mpesa/client");
      expect(mod.getCallbackUrl()).toBe("https://janjez.social/api/mpesa/callback");
    });
  });

  describe("getAccessToken", () => {
    it("throws when credentials missing", async () => {
      delete process.env.MPESA_CONSUMER_KEY;
      delete process.env.MPESA_CONSUMER_SECRET;
      vi.resetModules();
      const mod = await import("@/lib/mpesa/client");
      await expect(mod.getAccessToken()).rejects.toThrow("MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET are required");
    });
  });

  describe("StkPushParams interface", () => {
    it("has all required fields for STK push", () => {
      const params: StkPushParams = {
        phoneNumber: "0712345678",
        amount: 500,
        callbackUrl: "https://test.com/callback",
        accountReference: "test-ref",
        transactionDesc: "Test payment",
      };
      expect(params.phoneNumber).toBe("0712345678");
      expect(params.amount).toBe(500);
    });
  });
});
