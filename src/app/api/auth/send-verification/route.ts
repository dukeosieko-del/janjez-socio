import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMail } from "@/lib/email/transport";
import { SITE_NAME, SITE_URL } from "@/lib/email/config";
import { rateLimit } from "@/lib/server/rate-limiter";
import { sanitizeString } from "@/lib/server/validation";
import crypto from "crypto";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_RATE_LIMIT = 5;
const SIGNUP_RATE_LIMIT = 10;

export const runtime = "nodejs";

async function sendVerificationEmail(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  email: string,
  fullName: string | null
): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) {
    return { ok: false, error: "Server misconfigured" };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { error: deleteError } = await supabase
    .from("email_verifications")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    console.error("Failed to invalidate previous verification tokens:", deleteError);
  }

  const { error: insertError } = await supabase.from("email_verifications").insert({
    user_id: userId,
    token,
    expires_at: expiresAt,
  });

  if (insertError) {
    return { ok: false, error: "Failed to create verification record" };
  }

  const verifyUrl = `${SITE_URL}/api/auth/verify-email?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #0D0D0D;">
      <div style="text-align: center; padding: 20px 0;">
        <h1 style="color: #00A859; margin: 0; font-size: 28px;">JANJEZ SOCIO</h1>
        <p style="color: #666; margin-top: 8px;">Pata Clout Chapchap</p>
      </div>
      <div style="background: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; padding: 30px; margin-top: 20px;">
        <h2 style="color: #0D0D0D; margin-top: 0;">Verify Your Email</h2>
        <p style="color: #333; line-height: 1.6;">Thanks for signing up! Click the button below to verify your email address and activate your account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background: #00A859; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email</a>
        </div>
        <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #00A859; font-size: 14px;">${verifyUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">This link will expire in 24 hours.</p>
      </div>
      <div style="text-align: center; padding: 20px 0; color: #999; font-size: 12px;">
        &copy; ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.
      </div>
    </div>
  `;

  const text = `Verify your email for ${SITE_NAME}\n\nClick this link: ${verifyUrl}\n\nThis link expires in 24 hours.`;

  try {
    await sendMail({
      from: {
        address: process.env.ZEPTOMAIL_FROM_EMAIL || `noreply@${SITE_URL.replace(/https?:\/\//, "")}`,
        name: "JANJEZ SOCIO",
      },
      to: [{ email_address: { address: email, name: fullName || "" } }],
      subject: `Verify your email — ${SITE_NAME}`,
      htmlbody: html,
      textbody: text,
      clientReference: `verify-email-${Date.now()}`,
    });
    return { ok: true };
  } catch (mailError) {
    console.error("Verification email failed:", mailError);
    return { ok: false, error: "Failed to send verification email" };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, full_name, phone, resend } = body as {
      email: string;
      password?: string;
      full_name?: string;
      phone?: string;
      resend?: boolean;
    };

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
    }

    const sanitizedEmail = sanitizeString(email, 254) || email;
    const sanitizedFullName = sanitizeString(full_name, 100);
    const sanitizedPhone = sanitizeString(phone, 30);

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const { data: existing } = await supabase.auth.admin.listUsers();
    const user = existing?.users?.find((u: { email?: string }) => u.email === sanitizedEmail);

    if (resend) {
      const rl = rateLimit(request, RESEND_RATE_LIMIT);
      if (!rl.ok && rl.response) return rl.response;

      if (!user) {
        return NextResponse.json({ ok: true, message: "If an account exists for this email, a verification link has been sent." });
      }

      if (user.email_confirmed_at) {
        return NextResponse.json({ error: "Email is already verified. You can sign in." }, { status: 400 });
      }

      const emailResult = await sendVerificationEmail(supabase, user.id, sanitizedEmail, user.user_metadata?.full_name || null);
      if (!emailResult.ok) {
        return NextResponse.json({ error: emailResult.error || "Failed to send verification email" }, { status: 500 });
      }

      return NextResponse.json({ ok: true, message: "Verification email sent. Check your inbox." });
    }

    if (!password) {
      return NextResponse.json({ error: "Password is required for signup" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const rl = rateLimit(request, SIGNUP_RATE_LIMIT);
    if (!rl.ok && rl.response) return rl.response;

    if (user) {
      if (user.email_confirmed_at) {
        return NextResponse.json({ error: "Email is already registered and verified." }, { status: 409 });
      }

      const emailResult = await sendVerificationEmail(supabase, user.id, sanitizedEmail, user.user_metadata?.full_name || null);
      if (!emailResult.ok) {
        return NextResponse.json({ error: emailResult.error || "Failed to send verification email" }, { status: 500 });
      }

      return NextResponse.json({ ok: true, message: "Account already exists but is not verified. A new verification email has been sent." });
    }

    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: sanitizedEmail,
      password,
      email_confirm: false,
      user_metadata: {
        full_name: sanitizedFullName || null,
        phone: sanitizedPhone || null,
      },
    });

    if (createError || !newUser.user) {
      return NextResponse.json({ error: createError?.message || "Failed to create user" }, { status: 400 });
    }

    const emailResult = await sendVerificationEmail(supabase, newUser.user.id, sanitizedEmail, sanitizedFullName || null);
    if (!emailResult.ok) {
      await supabase.auth.admin.deleteUser(newUser.user.id);
      return NextResponse.json({ error: emailResult.error || "Failed to send verification email" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: "Account created. Check your email to verify.",
    });
  } catch (error) {
    console.error("Signup API error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
