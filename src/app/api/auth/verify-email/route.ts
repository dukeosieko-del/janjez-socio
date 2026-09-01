import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/mailer";
import { getWelcomeEmail } from "@/lib/email/templates";
import { SITE_URL } from "@/lib/email/config";
import { rateLimit } from "@/lib/server/rate-limiter";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const rl = rateLimit(request, 60);
    if (!rl.ok && rl.response) return rl.response;

    const requestUrl = new URL(request.url);
    const token = requestUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/auth/sign-in?error=missing_token", requestUrl.origin));
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.redirect(new URL("/auth/sign-in?error=server_misconfigured", requestUrl.origin));
    }

    const { data: verification, error: fetchError } = await supabase
      .from("email_verifications")
      .select("*")
      .eq("token", token)
      .single();

    if (fetchError || !verification) {
      return NextResponse.redirect(new URL("/auth/sign-in?error=invalid_token", requestUrl.origin));
    }

    if (new Date(verification.expires_at) < new Date()) {
      await supabase.from("email_verifications").delete().eq("id", verification.id);
      return NextResponse.redirect(new URL("/auth/sign-in?error=token_expired", requestUrl.origin));
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, email_verified")
      .eq("id", verification.user_id)
      .single();

    if (profileError || !profile) {
      return NextResponse.redirect(new URL("/auth/sign-in?error=profile_not_found", requestUrl.origin));
    }

    if (profile.email_verified) {
      await supabase.from("email_verifications").delete().eq("id", verification.id);
      return NextResponse.redirect(new URL(`/auth/sign-in?verified=1&email=${encodeURIComponent(profile.email)}`, requestUrl.origin));
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(verification.user_id, {
      email_confirm: true,
    });

    if (updateError) {
      console.error("Failed to confirm email:", updateError);
      return NextResponse.redirect(new URL("/auth/sign-in?error=verification_failed", requestUrl.origin));
    }

    const { data: authUser } = await supabase.auth.admin.getUserById(verification.user_id);
    const fullName = (authUser?.user?.user_metadata?.full_name as string | undefined) || null;
    const { subject, html, text } = getWelcomeEmail({
      fullName,
      signInUrl: `${SITE_URL}/auth/sign-in`,
    });
    const welcomeResult = await sendEmail({
      to: { address: profile.email, name: fullName || "" },
      subject,
      html,
      text,
    });
    if (!welcomeResult.ok) {
      console.error("Welcome email send failed:", welcomeResult.error);
    }

    await supabase.from("email_verifications").delete().eq("id", verification.id);

    return NextResponse.redirect(new URL(`/auth/sign-in?verified=1&email=${encodeURIComponent(profile.email)}`, requestUrl.origin));
  } catch {
    const requestUrl = new URL("http://localhost");
    return NextResponse.redirect(new URL("/auth/sign-in?error=unexpected", requestUrl.origin));
  }
}
