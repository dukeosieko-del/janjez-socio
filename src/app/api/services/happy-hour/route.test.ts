import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => null,
}));

describe("happy hour API", () => {
  beforeEach(async () => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 500 when supabase is misconfigured", async () => {
    const { GET } = await import("@/app/api/services/happy-hour/route");
    const req = new NextRequest("http://localhost/api/services/happy-hour");
    const res = await GET(req);
    expect(res.status).toBe(500);
  });
});
