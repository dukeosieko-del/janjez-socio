import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/server/auth-helpers";
import { rateLimitAdmin } from "@/lib/server/rate-limiter";

export const runtime = "nodejs";

interface SyncPriceItem {
  id: string;
  selling_price_ksh: number;
  min_quantity: number;
  max_quantity: number;
}

export async function POST(request: NextRequest) {
  const rl = rateLimitAdmin(request);
  if (!rl.ok && rl.response) return rl.response;

  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  let body: { services?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { services } = body;

  if (!Array.isArray(services) || services.length === 0) {
    return NextResponse.json({ error: "services must be a non-empty array" }, { status: 400 });
  }

  const errors: string[] = [];
  const validServices: SyncPriceItem[] = [];

  for (let i = 0; i < services.length; i++) {
    const item = services[i];
    const prefix = `services[${i}]`;

    if (!item || typeof item !== "object") {
      errors.push(`${prefix} must be an object`);
      continue;
    }

    const { id, selling_price_ksh, min_quantity, max_quantity } = item as Record<string, unknown>;

    if (typeof id !== "string" || id.length === 0) {
      errors.push(`${prefix}.id is required`);
      continue;
    }

    if (typeof selling_price_ksh !== "number" || selling_price_ksh <= 0) {
      errors.push(`${prefix}.selling_price_ksh must be a positive number`);
      continue;
    }

    if (typeof min_quantity !== "number" || !Number.isInteger(min_quantity) || min_quantity <= 0) {
      errors.push(`${prefix}.min_quantity must be a positive integer`);
      continue;
    }

    if (typeof max_quantity !== "number" || !Number.isInteger(max_quantity) || max_quantity < min_quantity) {
      errors.push(`${prefix}.max_quantity must be >= min_quantity`);
      continue;
    }

    validServices.push({
      id,
      selling_price_ksh,
      min_quantity,
      max_quantity,
    });
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  try {
    const ids = validServices.map((s) => s.id);

    const { data: existing, error: fetchError } = await supabase
      .from("janjez_services")
      .select("id, provider_service_id")
      .in("id", ids);

    if (fetchError) {
      console.error("Sync prices fetch error:", fetchError);
      return NextResponse.json({ error: "Failed to validate services" }, { status: 500 });
    }

    const existingMap = new Map<string, { id: string; provider_service_id: string | null }>();
    (existing || []).forEach((row: { id: string; provider_service_id: string | null }) => {
      existingMap.set(row.id, row);
    });

    for (const svc of validServices) {
      const record = existingMap.get(svc.id);
      if (!record) {
        errors.push(`Service ${svc.id} not found`);
        continue;
      }
      if (!record.provider_service_id) {
        errors.push(`Service ${svc.id} has no provider_service_id mapped`);
        continue;
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    let updated = 0;
    const updateErrors: string[] = [];

    for (const svc of validServices) {
      const { error: updateError } = await supabase
        .from("janjez_services")
        .update({
          selling_price_ksh: svc.selling_price_ksh,
          min_quantity: svc.min_quantity,
          max_quantity: svc.max_quantity,
        })
        .eq("id", svc.id);

      if (updateError) {
        updateErrors.push(`Failed to update ${svc.id}: ${updateError.message}`);
        continue;
      }
      updated++;
    }

    return NextResponse.json({ updated, errors: updateErrors });
  } catch (error) {
    console.error("Admin services sync prices error:", error);
    return NextResponse.json({ error: "Failed to sync prices" }, { status: 500 });
  }
}
