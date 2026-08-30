import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/server/rate-limiter";
import { consumeResetToken, setPassword } from "@/lib/auth/reset-helpers";

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

    const consumed = await consumeResetToken(token);
    if (!consumed) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    const success = await setPassword(consumed.user_id, password);
    if (!success) {
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "Password updated successfully" });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
