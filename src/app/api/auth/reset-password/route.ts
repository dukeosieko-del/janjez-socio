import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/email/config";
import { rateLimit } from "@/lib/server/rate-limiter";
import { sanitizeString } from "@/lib/server/validation";
import { sendTransactional } from "@/lib/transactional";
import crypto from "crypto";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENERIC_RESPONSE = "If an account exists for this email, a password reset link has been sent.";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(request, 5);
    if (!rl.ok && rl.response) return rl.response;

    const body = await request.json();
    const { email } = body as { email: string };

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
    }

    const sanitizedEmail = sanitizeString(email, 254) || email;

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const { data: existing } = await supabase.auth.admin.listUsers();
    const user = existing?.users?.find((u: { email?: string }) => u.email === sanitizedEmail);

    if (!user) {
      return NextResponse.json({ ok: true, message: GENERIC_RESPONSE });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const { error: insertError } = await supabase.from("password_reset_tokens").insert({
      user_id: user.id,
      token,
      expires_at: expiresAt,
    });

    if (insertError) {
      console.error("Failed to create password reset token:", insertError);
      return NextResponse.json({ error: "Failed to create reset token" }, { status: 500 });
    }

    const resetUrl = `${SITE_URL}/auth/reset-password?token=${token}`;
    const fullName = (user.user_metadata?.full_name as string | undefined) || null;

    const { emailOk } = await sendTransactional({
      name: "user.password_reset",
      userId: user.id,
      email: sanitizedEmail,
      fullName,
      data: { fullName, resetUrl, expiresInMinutes: 60 },
    });

    if (!emailOk) {
      return NextResponse.json({ error: "Failed to send reset email. Please try again later." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: GENERIC_RESPONSE });
  } catch (error) {
    console.error("Password reset API error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}