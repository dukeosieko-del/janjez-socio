import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const admin = createAdminClient();
    let profile: Record<string, unknown> | null = null;
    if (admin) {
      const { data } = await admin.from("profiles").select("*").eq("id", user.id).single();
      profile = data;
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
        app_metadata: user.app_metadata,
      },
      profile: profile
        ? {
            id: profile.id,
            email: profile.email,
            role: profile.role,
            email_verified: profile.email_verified,
            wallet_balance: profile.wallet_balance,
          }
        : null,
      diagnosis: {
        hasUser: true,
        hasProfile: !!profile,
        profileRole: profile?.role ?? null,
        userMetadataRole: (user.user_metadata as { role?: string } | undefined)?.role ?? null,
        isAdminByProfile: profile?.role === "admin",
        isAdminByMetadata:
          (user.user_metadata as { role?: string } | undefined)?.role === "admin",
      },
      fix: {
        sql: `UPDATE public.profiles SET role = 'admin' WHERE id = '${user.id}';`,
        description:
          "Run this in Supabase SQL Editor to grant admin access. After running, sign out and sign back in (or hard-refresh) to see the change.",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
