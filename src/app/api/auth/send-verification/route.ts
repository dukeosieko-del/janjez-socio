import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMail } from "@/lib/email/transport";
import { SITE_NAME, SITE_URL } from "@/lib/email/config";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, full_name, phone } = body as {
      email: string;
      password: string;
      full_name?: string;
      phone?: string;
    };

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const { data: existing } = await supabase.auth.admin.listUsers();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const alreadyExists = existing?.users?.find((u: any) => u.email === email);
    if (alreadyExists) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const { data: user, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        full_name: full_name || null,
        phone: phone || null,
      },
    });

    if (createError || !user.user) {
      return NextResponse.json({ error: createError?.message || "Failed to create user" }, { status: 400 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error: insertError } = await supabase.from("email_verifications").insert({
      user_id: user.user.id,
      token,
      expires_at: expiresAt,
    });

    if (insertError) {
      return NextResponse.json({ error: "Failed to create verification record" }, { status: 400 });
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
        to: [{ email_address: { address: email, name: "" } }],
        subject: `Verify your email — ${SITE_NAME}`,
        htmlbody: html,
        textbody: text,
        clientReference: `verify-email-${Date.now()}`,
      });
    } catch (mailError) {
      console.error("Verification email failed:", mailError);
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
