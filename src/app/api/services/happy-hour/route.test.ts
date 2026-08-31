import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const mockAdminClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(function () {
        return this;
      }),
      order: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  })),
};

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => mockAdminClient),
}));

describe("happy hour API", () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 500 when supabase is misconfigured", async () => {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    (createAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(null);
    const { GET } = await import("@/app/api/services/happy-hour/route");
    const req = new NextRequest("http://localhost/api/services/happy-hour");
    const res = await GET(req);
    expect(res.status).toBe(500);
  });

  it("returns services from show_catalogue=true", async () => {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const services = [
      { id: "1", name: "Service A", category: "youtube", subcategory: "Views" },
      { id: "2", name: "Service B", category: "instagram", subcategory: "Likes" },
    ];

    const chainable = {
      select: vi.fn(function () {
        return this;
      }),
      eq: vi.fn(function () {
        return this;
      }),
      order: vi.fn(() => Promise.resolve({ data: services, error: null })),
    };

    (mockAdminClient.from as ReturnType<typeof vi.fn>).mockReturnValue(chainable);
    (createAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(mockAdminClient);

    const { GET } = await import("@/app/api/services/happy-hour/route");
    const req = new NextRequest("http://localhost/api/services/happy-hour?count=2");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.services.length).toBeGreaterThanOrEqual(1);
    expect(chainable.eq).toHaveBeenCalledWith("show_catalogue", true);
  });
});
