import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const uploadMock = vi.fn();
const getPublicUrlMock = vi.fn();

const mockAdminClient = {
  from: vi.fn(),
  storage: {
    from: vi.fn(() => ({
      upload: uploadMock,
      getPublicUrl: getPublicUrlMock,
    })),
  },
};

function makeChainable(result: Record<string, unknown> = {}) {
  const chainable = {
    select: vi.fn(() => chainable),
    insert: vi.fn(() => chainable),
    update: vi.fn(() => chainable),
    eq: vi.fn(() => chainable),
    in: vi.fn(() => chainable),
    order: vi.fn(() => chainable),
    range: vi.fn(() => chainable),
    upsert: vi.fn(() => chainable),
    not: vi.fn(() => chainable),
    ilike: vi.fn(() => chainable),
    neq: vi.fn(() => chainable),
    head: vi.fn(() => chainable),
    limit: vi.fn(() => chainable),
    single: vi.fn(() => chainable),
    ...result,
  };
  return chainable;
}

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => mockAdminClient),
}));

vi.mock("@/lib/server/auth-helpers", () => ({
  getUserFromRequest: vi.fn(),
  requireAdmin: vi.fn(),
  requireCronSecret: vi.fn(),
}));

vi.mock("@/lib/server/rate-limiter", () => ({
  rateLimit: vi.fn(() => ({ ok: true })),
}));

const { GET, PATCH } = await import("@/app/api/profile/route");
const { POST: POST_AVATAR } = await import("@/app/api/profile/avatar/route");
const { getUserFromRequest } = await import("@/lib/server/auth-helpers");

function mockRequest(
  method: string,
  body: unknown = null,
  auth = "Bearer test-token"
) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) headers["authorization"] = auth;
  const obj: Record<string, unknown> = {
    method,
    json: async () => body,
    headers: new Headers(headers),
  };
  return obj as unknown as NextRequest;
}

const PNG_SIGNATURE = "iVBORw0KGgo";
const BASE64_PNG = `data:image/png;base64,${PNG_SIGNATURE}`;

describe("GET /api/profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
  });

  it("returns the authenticated user's profile", async () => {
    (getUserFromRequest as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-123",
      email: "test@example.com",
      role: "user",
    });

    const profileChainable = makeChainable({
      single: vi.fn().mockResolvedValue({
        data: { id: "user-123", email: "test@example.com", full_name: "Test" },
        error: null,
      }),
    });
    (mockAdminClient.from as ReturnType<typeof vi.fn>).mockReturnValue(profileChainable);

    const res = await GET(mockRequest("GET"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.profile).toMatchObject({ id: "user-123", full_name: "Test" });
    expect(mockAdminClient.from).toHaveBeenCalledWith("profiles");
  });

  it("returns 401 when unauthenticated", async () => {
    (getUserFromRequest as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const res = await GET(mockRequest("GET", null, ""));
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
    expect(mockAdminClient.from).not.toHaveBeenCalled();
  });
});

describe("PATCH /api/profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";

    (getUserFromRequest as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-123",
      email: "test@example.com",
      role: "user",
    });
  });

  it("updates profile fields and returns the updated profile", async () => {
    let captured: Record<string, unknown> | null = null;

    const updateChainable = makeChainable({});
    updateChainable.update = vi.fn((payload: Record<string, unknown>) => {
      captured = payload;
      return {
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                id: "user-123",
                full_name: "Jane Doe",
                phone: "+254700000000",
                avatar_url: "https://img.example/avatar.png",
                notification_email: true,
                notification_sms: false,
                theme: "dark",
                language: "sw",
              },
              error: null,
            }),
          })),
        })),
      };
    });
    (mockAdminClient.from as ReturnType<typeof vi.fn>).mockReturnValue(updateChainable);

    const res = await PATCH(
      mockRequest("PATCH", {
        full_name: "Jane Doe",
        phone: "+254700000000",
        avatar_url: "https://img.example/avatar.png",
        notification_email: true,
        notification_sms: false,
        theme: "dark",
        language: "sw",
      })
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(captured).toMatchObject({
      full_name: "Jane Doe",
      phone: "+254700000000",
      theme: "dark",
      language: "sw",
    });
    expect(data.profile).toMatchObject({ full_name: "Jane Doe", theme: "dark", language: "sw" });
  });

  it("returns 400 on validation errors", async () => {
    const res = await PATCH(
      mockRequest("PATCH", {
        full_name: "x".repeat(101),
        phone: "x".repeat(31),
        theme: "purple",
        language: "fr",
      })
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Validation failed");
    expect(data.details).toEqual(
      expect.arrayContaining([
        expect.stringContaining("full_name"),
        expect.stringContaining("phone"),
        expect.stringContaining("theme"),
        expect.stringContaining("language"),
      ])
    );
  });
});

describe("POST /api/profile/avatar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (uploadMock as ReturnType<typeof vi.fn>).mockReset();
    (getPublicUrlMock as ReturnType<typeof vi.fn>).mockReset();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";

    (getUserFromRequest as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-123",
      email: "test@example.com",
      role: "user",
    });
  });

  it("uploads the base64 avatar and returns the public URL", async () => {
    (uploadMock as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { path: "user-123/avatar.png" },
      error: null,
    });
    (getPublicUrlMock as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { publicUrl: "https://test.supabase.co/storage/v1/object/public/avatars/user-123/avatar.png" },
      error: null,
    });

    const profileUpdate = makeChainable({});
    (mockAdminClient.from as ReturnType<typeof vi.fn>).mockReturnValue(profileUpdate);

    const res = await POST_AVATAR(
      mockRequest("POST", { avatar: BASE64_PNG })
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.avatar_url).toContain("/avatars/user-123/avatar.png");
    expect(mockAdminClient.storage.from).toHaveBeenCalledWith("avatars");
    const uploadArgs = (uploadMock as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(uploadArgs[0]).toBe("user-123/avatar.png");
    expect(uploadArgs[1]).toBeInstanceOf(Buffer);
    expect(uploadArgs[2].contentType).toBe("image/png");
  });

  it("returns 400 when the upload fails", async () => {
    (uploadMock as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: { message: "Upload failed - storage error" },
    });

    const res = await POST_AVATAR(
      mockRequest("POST", { avatar: BASE64_PNG })
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Upload failed - storage error");
    expect(getPublicUrlMock).not.toHaveBeenCalled();
  });
});
