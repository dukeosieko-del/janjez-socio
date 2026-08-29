import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/server/auth-helpers";
import { rateLimitAdmin } from "@/lib/server/rate-limiter";

export const runtime = "nodejs";

const ALLOWED_UPDATE_KEYS = [
  "show_sidebar",
  "show_landing",
  "show_guarded",
  "show_anonymous",
  "show_catalogue",
  "is_active",
] as const;

type UpdateKey = (typeof ALLOWED_UPDATE_KEYS)[number];

export async function PATCH(request: NextRequest) {
  const rl = rateLimitAdmin(request);
  if (!rl.ok && rl.response) return rl.response;

  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  let body: { ids?: unknown; updates?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { ids, updates } = body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "ids must be a non-empty array" }, { status: 400 });
  }

  if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
    return NextResponse.json({ error: "updates must be an object" }, { status: 400 });
  }

  const typedIds = ids.filter((id): id is string => typeof id === "string" && id.length > 0);
  if (typedIds.length !== ids.length) {
    return NextResponse.json({ error: "All ids must be non-empty strings" }, { status: 400 });
  }

  const typedUpdates: Partial<Record<UpdateKey, boolean>> = {};
  for (const key of ALLOWED_UPDATE_KEYS) {
    if (key in (updates as object) && (updates as Record<string, unknown>)[key] !== undefined) {
      const val = (updates as Record<string, unknown>)[key];
      if (typeof val !== "boolean") {
        return NextResponse.json({ error: `updates.${key} must be a boolean` }, { status: 400 });
      }
      typedUpdates[key] = val;
    }
  }

  if (Object.keys(typedUpdates).length === 0) {
    return NextResponse.json({ error: "No valid update fields provided" }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  try {
    const { data: existing, error: fetchError } = await supabase
      .from("janjez_services")
      .select("id")
      .in("id", typedIds);

    if (fetchError) {
      console.error("Bulk update fetch error:", fetchError);
      return NextResponse.json({ error: "Failed to validate services" }, { status: 500 });
    }

    const existingIds = (existing || []).map((row: { id: string }) => row.id);
    const missingIds = typedIds.filter((id) => !existingIds.includes(id));
    if (missingIds.length > 0) {
      return NextResponse.json(
        { error: "One or more services not found", missing: missingIds },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from("janjez_services")
      .update(typedUpdates)
      .in("id", typedIds);

    if (updateError) {
      console.error("Bulk update error:", updateError);
      return NextResponse.json({ error: "Failed to update services" }, { status: 500 });
    }

    return NextResponse.json({ updated: typedIds.length });
  } catch (error) {
    console.error("Admin services bulk update error:", error);
    return NextResponse.json({ error: "Failed to update services" }, { status: 500 });
  }
}
