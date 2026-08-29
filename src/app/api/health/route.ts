import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET() {
  const checks: Record<string, string> = {};

  const supabase = createAdminClient();
  if (!supabase) {
    checks.supabase = "misconfigured";
    return NextResponse.json({ status: "error", checks }, { status: 500 });
  }

  try {
    const { error } = await supabase.from("janjez_services").select("id").limit(1);
    checks.supabase = error ? `error: ${error.message}` : "ok";
  } catch (e) {
    checks.supabase = `exception: ${e instanceof Error ? e.message : "unknown"}`;
  }

  const allOk = Object.values(checks).every((v) => v === "ok");
  return NextResponse.json(
    { status: allOk ? "ok" : "degraded", checks },
    { status: allOk ? 200 : 503 }
  );
}
