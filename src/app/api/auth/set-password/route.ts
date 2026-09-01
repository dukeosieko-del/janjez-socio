import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/email/config";
import { rateLimit } from "@/lib/server/rate-limiter";
import { consumeResetToken, setPassword } from "@/lib/auth/reset-helpers";
import { sendTransactional } from "@/lib/transactional";

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

    try {
      const { data: authUser } = await supabase.auth.admin.getUserById(consumed.user_id);
      const email = authUser?.user?.email;
      const fullName = (authUser?.user?.user_metadata?.full_name as string | undefined) || null;
      if (email) {
        const result = await sendTransactional({
          name: "user.password_reset_confirmation",
          userId: consumed.user_id,
          email,
          fullName,
          data: {
            fullName,
            signInUrl: `${SITE_URL}/auth/sign-in`,
          },
        });
        if (!result.emailOk) {
          console.error("Reset confirmation email send failed");
        }
      }
    } catch (notifyError) {
      console.error("Reset confirmation notify error:", notifyError);
    }

    return NextResponse.json({ ok: true, message: "Password updated successfully" });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}