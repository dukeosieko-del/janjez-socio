import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockAuthedUser: { id: string; email: string; role: string } | null = { id: "u1", email: "u1@example.com", role: "user" };
const mockRateLimit = vi.fn(() => ({ ok: true }));
const mockSendTransactional = vi.fn();

vi.mock("@/lib/server/auth-helpers", () => ({
  getUserFromRequest: vi.fn(async () => mockAuthedUser),
}));

vi.mock("@/lib/server/rate-limiter", () => ({
  rateLimit: mockRateLimit,
}));

vi.mock("@/lib/transactional", () => ({
  sendTransactional: mockSendTransactional,
}));

const { POST } = await import("@/app/api/auth/security-alert/route");

function makeRequest(body: Record<string, unknown>, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/auth/security-alert", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/security-alert", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthedUser.id = "u1";
    mockAuthedUser.email = "u1@example.com";
    mockAuthedUser.role = "user";
    mockRateLimit.mockReturnValue({ ok: true });
    mockSendTransactional.mockResolvedValue({ emailOk: true, notificationOk: true });
  });

  it("rejects unauthenticated requests", async () => {
    const { getUserFromRequest } = await import("@/lib/server/auth-helpers");
    (getUserFromRequest as unknown as { mockResolvedValueOnce: (v: unknown) => void }).mockResolvedValueOnce(null);
    const req = makeRequest({});
    const res = await POST(req as unknown as NextRequest);
    expect(res.status).toBe(401);
    expect(mockSendTransactional).not.toHaveBeenCalled();
  });

  it("triggers user.security_alert with full body", async () => {
    const req = makeRequest({
      ip: "1.2.3.4",
      userAgent: "Mozilla/5.0",
      location: "Nairobi, KE",
      time: "2026-09-01T12:00:00.000Z",
    });
    const res = await POST(req as unknown as NextRequest);
    expect(res.status).toBe(200);
    expect(mockSendTransactional).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "user.security_alert",
        userId: "u1",
        audience: "user",
        data: expect.objectContaining({
          ip: "1.2.3.4",
          userAgent: "Mozilla/5.0",
          location: "Nairobi, KE",
          time: "2026-09-01T12:00:00.000Z",
        }),
      })
    );
  });

  it("handles missing body gracefully", async () => {
    const req = new Request("http://localhost/api/auth/security-alert", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "not-json",
    });
    const res = await POST(req as unknown as NextRequest);
    expect(res.status).toBe(200);
    expect(mockSendTransactional).toHaveBeenCalled();
  });

  it("returns emailOk and notificationOk flags", async () => {
    mockSendTransactional.mockResolvedValueOnce({ emailOk: false, notificationOk: true });
    const req = makeRequest({ ip: "5.6.7.8" });
    const res = await POST(req as unknown as NextRequest);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.emailOk).toBe(false);
    expect(json.notificationOk).toBe(true);
  });
});