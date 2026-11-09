import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/server/rate-limiter";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;

  try {
    const rl = rateLimit(request, 60);
    if (!rl.ok && rl.response) return rl.response;

    const token = requestUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/auth/sign-in?error=missing_token", origin));
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.redirect(new URL("/auth/sign-in?error=server_misconfigured", origin));
    }

    const { data: verification, error: fetchError } = await supabase
      .from("email_verifications")
      .select("*")
      .eq("token", token)
      .single();

    if (fetchError || !verification) {
      return NextResponse.redirect(new URL("/auth/sign-in?error=invalid_token", origin));
    }

    if (new Date(verification.expires_at) < new Date()) {
      await supabase.from("email_verifications").delete().eq("id", verification.id);
      return NextResponse.redirect(new URL("/auth/sign-in?error=token_expired", origin));
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("id", verification.user_id)
      .single();

    if (profileError || !profile) {
      return NextResponse.redirect(new URL("/auth/sign-in?error=profile_not_found", origin));
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(verification.user_id, {
      email_confirm: true,
    });

    if (updateError) {
      return NextResponse.redirect(new URL("/auth/sign-in?error=verification_failed", origin));
    }

    await supabase.from("email_verifications").delete().eq("id", verification.id);

    return NextResponse.redirect(new URL(`/auth/sign-in?verified=1&email=${encodeURIComponent(profile.email)}`, origin));
  } catch {
    return NextResponse.redirect(new URL("/auth/sign-in?error=unexpected", origin));
  }
}