import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMail } from "@/lib/email/transport";
import { SITE_NAME, SITE_URL } from "@/lib/email/config";
import { rateLimit } from "@/lib/server/rate-limiter";
import { sanitizeString } from "@/lib/server/validation";
import crypto from "crypto";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
      return NextResponse.json({
        ok: true,
        message: "If an account exists for this email, a password reset link has been sent.",
      });
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

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #0D0D0D;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #00A859; margin: 0; font-size: 28px;">JANJEZ SOCIO</h1>
          <p style="color: #666; margin-top: 8px;">Pata Clout Chapchap</p>
        </div>
        <div style="background: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; padding: 30px; margin-top: 20px;">
          <h2 style="color: #0D0D0D; margin-top: 0;">Reset Your Password</h2>
          <p style="color: #333; line-height: 1.6;">You requested a password reset. Click the button below to create a new password. This link will expire in 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #00A859; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #00A859; font-size: 14px;">${resetUrl}</p>
        </div>
        <div style="text-align: center; padding: 20px 0; color: #999; font-size: 12px;">
          &copy; ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.
        </div>
      </div>
    `;

    const text = `Reset your password for ${SITE_NAME}\n\nClick this link: ${resetUrl}\n\nThis link expires in 1 hour.`;

    let emailSent = false;
    try {
      await sendMail({
        from: {
          address: process.env.ZEPTOMAIL_FROM_EMAIL || `noreply@${SITE_URL.replace(/https?:\/\//, "")}`,
          name: "JANJEZ SOCIO",
        },
        to: [{ email_address: { address: sanitizedEmail, name: user.user_metadata?.full_name || "" } }],
        subject: `Reset your password — ${SITE_NAME}`,
        htmlbody: html,
        textbody: text,
        clientReference: `reset-password-${Date.now()}`,
      });
      emailSent = true;
    } catch (mailError) {
      console.error("Password reset email failed:", mailError);
    }

    if (!emailSent) {
      return NextResponse.json({ error: "Failed to send reset email. Please try again later." }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: "If an account exists for this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Password reset API error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
