import { NextResponse, NextRequest } from "next/server";
import { getJanjezService, updateJanjezService, deleteJanjezService } from "@/lib/janjez-services";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/server/auth-helpers";
import { rateLimitAdmin } from "@/lib/server/rate-limiter";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const rl = rateLimitAdmin(request);
  if (!rl.ok && rl.response) return rl.response;

  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const id = request.nextUrl.pathname.split("/").pop();
  if (!id) {
    return NextResponse.json({ error: "Service id is required" }, { status: 400 });
  }

  try {
    const service = await getJanjezService(id);
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }
    return NextResponse.json({ service });
  } catch (error) {
    console.error("Admin service get error:", error);
    return NextResponse.json({ error: "Failed to load service" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const rl = rateLimitAdmin(request);
  if (!rl.ok && rl.response) return rl.response;

  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const id = request.nextUrl.pathname.split("/").pop();
  if (!id) {
    return NextResponse.json({ error: "Service id is required" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const supabase = createAdminClient();

    if (body.provider_service_id) {
      if (supabase) {
        const { data: providerExists } = await supabase
          .from("provider_services")
          .select("id")
          .eq("id", String(body.provider_service_id))
          .single();
        if (!providerExists) {
          return NextResponse.json({ error: "Referenced provider service not found" }, { status: 400 });
        }
      }
    }

    const updates: Record<string, unknown> = {};
    for (const key of ["name", "slug", "category", "subcategory", "description", "selling_price_ksh", "min_quantity", "max_quantity", "is_active", "display_order", "supports_drip_feed", "supports_refill", "supports_cancel"]) {
      if (key in body && body[key] !== undefined) {
        if (key === "selling_price_ksh" || key === "min_quantity" || key === "max_quantity" || key === "display_order") {
          updates[key] = Number(body[key]);
        } else if (key === "is_active" || key === "supports_drip_feed" || key === "supports_refill" || key === "supports_cancel") {
          updates[key] = Boolean(body[key]);
        } else {
          updates[key] = body[key];
        }
      }
    }

    if (updates.is_active === true && body.provider_service_id === undefined) {
      if (supabase) {
        const { data: existing } = await supabase
          .from("janjez_services")
          .select("provider_service_id")
          .eq("id", id)
          .single();
        if (!existing || !existing.provider_service_id) {
          return NextResponse.json({
            error: "Cannot publish an unmapped service. Select a provider service first.",
          }, { status: 400 });
        }
      }
    }

    if ("provider_service_id" in body) {
      updates.provider_service_id = body.provider_service_id;
    }

    const result = await updateJanjezService(id, updates);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ service: result });
  } catch (error) {
    console.error("Admin service update error:", error);
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const rl = rateLimitAdmin(request);
  if (!rl.ok && rl.response) return rl.response;

  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const id = request.nextUrl.pathname.split("/").pop();
  if (!id) {
    return NextResponse.json({ error: "Service id is required" }, { status: 400 });
  }

  try {
    const result = await deleteJanjezService(id);
    if (result && "error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin service delete error:", error);
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}
