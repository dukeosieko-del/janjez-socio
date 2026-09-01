import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSendEmail = vi.fn();
const mockCreateNotification = vi.fn();
const mockNotifyUser = vi.fn();
const mockNotifyAdmins = vi.fn();

const mockProfileSingle = vi.fn();
const mockProfilesEq = vi.fn();
const mockProfilesSelect = vi.fn();

const mockAdminClient = {
  from: vi.fn((table: string) => {
    if (table === "profiles") {
      return {
        select: mockProfilesSelect,
        eq: mockProfilesEq,
      };
    }
    return {};
  }),
};

vi.mock("@/lib/email/mailer", () => ({
  sendEmail: mockSendEmail,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => mockAdminClient),
}));

vi.mock("@/lib/notifications", () => ({
  createNotification: mockCreateNotification,
  notifyUser: mockNotifyUser,
  notifyAdmins: mockNotifyAdmins,
}));

const { sendTransactional, listRegisteredEvents, registry } = await import("@/lib/transactional");

describe("transactional composer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProfilesSelect.mockReturnValue({ eq: mockProfilesEq });
    mockProfilesEq.mockReturnValue({ single: mockProfileSingle });
    mockProfileSingle.mockResolvedValue({
      data: { email: "user@example.com", full_name: "Test User" },
      error: null,
    });
    mockSendEmail.mockResolvedValue({ ok: true });
    mockCreateNotification.mockResolvedValue({ id: "n1" });
    mockNotifyUser.mockResolvedValue({ id: "n1" });
    mockNotifyAdmins.mockResolvedValue([{ id: "n2" }]);
  });

  it("returns false/false without throwing for unknown event", async () => {
    const res = await sendTransactional({
      name: "totally.unknown.event",
      userId: "u1",
      data: {},
    });
    expect(res).toEqual({ emailOk: false, notificationOk: false });
    expect(mockSendEmail).not.toHaveBeenCalled();
    expect(mockNotifyUser).not.toHaveBeenCalled();
  });

  it("fans out email + notification on success (user audience)", async () => {
    const res = await sendTransactional({
      name: "user.welcome",
      userId: "u1",
      data: { fullName: "Duke", signInUrl: "https://example.com" },
    });
    expect(res).toEqual({ emailOk: true, notificationOk: true });
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockSendEmail.mock.calls[0][0].subject).toContain("Welcome");
    expect(mockNotifyUser).toHaveBeenCalledWith(
      "u1",
      "system",
      expect.objectContaining({
        title: expect.stringContaining("Welcome"),
        severity: "success",
      })
    );
  });

  it("still creates notification when email send fails", async () => {
    mockSendEmail.mockResolvedValueOnce({ ok: false, error: "smtp down" });
    const res = await sendTransactional({
      name: "user.verify_email",
      userId: "u1",
      data: { fullName: "Duke", verifyUrl: "https://example.com/v", expiresInHours: 24 },
    });
    expect(res).toEqual({ emailOk: false, notificationOk: true });
    expect(mockNotifyUser).toHaveBeenCalled();
  });

  it("still attempts email when notification fails (user audience)", async () => {
    mockNotifyUser.mockResolvedValueOnce(null);
    mockCreateNotification.mockResolvedValueOnce(null);
    const res = await sendTransactional({
      name: "order.received",
      userId: "u1",
      data: { fullName: "Duke", orderId: "ORD-1", service: "Followers", quantity: 100, amount: 500, link: "https://x.com" },
    });
    expect(res.emailOk).toBe(true);
    expect(res.notificationOk).toBe(false);
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockCreateNotification).toHaveBeenCalled();
  });

  it("returns {false, false} without throwing when both fail", async () => {
    mockSendEmail.mockResolvedValueOnce({ ok: false, error: "boom" });
    mockNotifyUser.mockResolvedValueOnce(null);
    mockCreateNotification.mockResolvedValueOnce(null);
    const res = await sendTransactional({
      name: "wallet.low_balance",
      userId: "u1",
      data: { fullName: "Duke", balance: 50, topUpUrl: "https://example.com/wallet" },
    });
    expect(res).toEqual({ emailOk: false, notificationOk: false });
  });

  it("passes event data through to template renderers", async () => {
    await sendTransactional({
      name: "payment.received",
      userId: "u1",
      data: { fullName: "Duke", amount: 1234, method: "M-Pesa", reference: "R-1", link: "https://x.com" },
    });
    const call = mockSendEmail.mock.calls[0][0];
    expect(call.subject).toContain("KES 1,234");
    expect(call.html).toContain("M-Pesa");
    expect(call.text).toContain("R-1");
    expect(mockNotifyUser).toHaveBeenCalledWith(
      "u1",
      "wallet",
      expect.objectContaining({
        body: expect.stringContaining("M-Pesa"),
      })
    );
  });

  it("fans out to admins when audience is admin", async () => {
    mockProfilesSelect.mockReturnValueOnce({ eq: vi.fn(() => ({ single: vi.fn().mockResolvedValue({ data: { email: "admin@example.com" }, error: null }) })) });
    const res = await sendTransactional({
      name: "admin.new_order",
      userId: "u1",
      audience: "admin",
      data: { adminName: "Boss", orderId: "ORD-7", customerEmail: "buyer@example.com", amount: 2000, adminUrl: "https://example.com/admin" },
    });
    expect(res).toEqual({ emailOk: true, notificationOk: true });
    expect(mockNotifyAdmins).toHaveBeenCalledWith(
      "admin_alert",
      expect.objectContaining({
        title: expect.stringContaining("ORD-7"),
        severity: "info",
      })
    );
  });

  it("exposes a registry with the expected event names", () => {
    const expected = [
      "user.welcome",
      "user.verify_email",
      "user.password_reset",
      "user.password_reset_confirmation",
      "user.security_alert",
      "order.received",
      "order.completed",
      "order.failed",
      "payment.received",
      "wallet.low_balance",
      "admin.new_order",
      "admin.high_value_order",
      "admin.fulfillment_failure",
      "system.maintenance",
    ];
    for (const name of expected) {
      expect(listRegisteredEvents()).toContain(name);
      expect(registry[name]).toBeDefined();
      expect(typeof registry[name].subject).toBe("function");
      expect(typeof registry[name].notificationTitle).toBe("function");
    }
  });
});