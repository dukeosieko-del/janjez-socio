import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/server/rate-limiter";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const rl = rateLimit(request, 10);
  if (!rl.ok && rl.response) return rl.response;

  try {
    const body = await request.json();
    const { token, password } = body as { token?: string; password?: string };

    if (!token) {
      return NextResponse.json({ error: "Reset token is required" }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const now = new Date().toISOString();

    const { data: tokenData, error: tokenError } = await supabase
      .from("password_reset_tokens")
      .select("user_id, used, expires_at")
      .eq("token", token)
      .eq("used", false)
      .gt("expires_at", now)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(tokenData.user_id, {
      password,
    });

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    await supabase
      .from("password_reset_tokens")
      .update({ used: true })
      .eq("token", token);

    return NextResponse.json({ ok: true, message: "Password updated successfully" });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
