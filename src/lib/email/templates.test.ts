import { describe, it, expect } from "vitest";
import {
  getOrderReceivedEmail,
  getOrderCompletedEmail,
  getOrderFailedEmail,
  getPaymentReceivedEmail,
  getLowWalletBalanceEmail,
} from "@/lib/email/templates";

describe("transactional order templates", () => {
  describe("getOrderReceivedEmail", () => {
    it("includes all input fields in html and text", () => {
      const result = getOrderReceivedEmail({
        customerName: "Duke",
        orderId: "ORD-1",
        service: "Instagram Likes",
        quantity: 1000,
        amount: 250,
        link: "https://instagram.com/p/test",
      });
      expect(result.subject).toContain("ORD-1");
      expect(result.html).toContain("Duke");
      expect(result.html).toContain("ORD-1");
      expect(result.html).toContain("Instagram Likes");
      expect(result.html).toContain("1000");
      expect(result.html).toContain("KES 250");
      expect(result.text).toContain("Instagram Likes");
      expect(result.text).toContain("https://instagram.com/p/test");
    });

    it("falls back to neutral greeting when name missing", () => {
      const result = getOrderReceivedEmail({
        customerName: null,
        orderId: "ORD-2",
        service: "Followers",
        quantity: 50,
        amount: 100,
        link: "https://x.com",
      });
      expect(result.html).toContain("Hi there,");
    });

    it("accepts string quantity and amount", () => {
      const result = getOrderReceivedEmail({
        customerName: null,
        orderId: "ORD-3",
        service: "Views",
        quantity: "500",
        amount: "150",
        link: "https://x.com",
      });
      expect(result.html).toContain("500");
      expect(result.html).toContain("150");
    });
  });

  describe("getOrderCompletedEmail", () => {
    it("includes orderId, service, and link", () => {
      const result = getOrderCompletedEmail({
        customerName: "Had",
        orderId: "ORD-9",
        service: "YouTube Views",
        link: "https://youtube.com/watch?v=abc",
      });
      expect(result.subject).toContain("ORD-9");
      expect(result.html).toContain("Had");
      expect(result.html).toContain("YouTube Views");
      expect(result.html).toContain("https://youtube.com/watch?v=abc");
    });
  });

  describe("getOrderFailedEmail", () => {
    it("includes refund messaging and reason", () => {
      const result = getOrderFailedEmail({
        customerName: null,
        orderId: "ORD-FAIL",
        reason: "Provider offline",
        link: "https://x.com",
      });
      expect(result.subject).toContain("ORD-FAIL");
      expect(result.html).toContain("Provider offline");
      expect(result.html.toLowerCase()).toContain("refund");
      expect(result.html).toContain("Hi there,");
    });
  });

  describe("getPaymentReceivedEmail", () => {
    it("formats numeric amounts with locale separators", () => {
      const result = getPaymentReceivedEmail({
        customerName: "Duke",
        amount: 1234,
        method: "M-Pesa",
        reference: "R-9",
        link: "https://x.com",
      });
      expect(result.subject).toContain("KES 1,234");
      expect(result.html).toContain("M-Pesa");
      expect(result.html).toContain("R-9");
      expect(result.text).toContain("R-9");
    });

    it("accepts string amounts", () => {
      const result = getPaymentReceivedEmail({
        customerName: null,
        amount: "200",
        method: "M-Pesa",
        reference: "R-10",
        link: "https://x.com",
      });
      expect(result.html).toContain("KES 200");
    });
  });

  describe("getLowWalletBalanceEmail", () => {
    it("includes balance and top-up url", () => {
      const result = getLowWalletBalanceEmail({
        fullName: "Duke",
        balance: 50,
        topUpUrl: "https://example.com/pay",
      });
      expect(result.subject).toContain("KES 50");
      expect(result.html).toContain("https://example.com/pay");
      expect(result.html).toContain("below KES 100");
    });
  });

  describe("all templates use branded colors", () => {
    it("ORDER_RECEIVED includes brand green", () => {
      const result = getOrderReceivedEmail({
        customerName: null,
        orderId: "x",
        service: "y",
        quantity: 1,
        amount: 1,
        link: "https://x.com",
      });
      expect(result.html).toContain("#00A859");
    });
  });
});