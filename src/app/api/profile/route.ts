import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserFromRequest } from "@/lib/server/auth-helpers";
import { rateLimit } from "@/lib/server/rate-limiter";
import { validateString } from "@/lib/server/validation";

export const runtime = "nodejs";

const ALLOWED_THEMES = new Set(["dark", "light"]);
const ALLOWED_LANGUAGES = new Set(["en", "sw"]);

export async function GET(request: NextRequest) {
  try {
    const rl = rateLimit(request, 60);
    if (!rl.ok && rl.response) return rl.response;

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ profile: data });
  } catch {
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const rl = rateLimit(request, 30);
    if (!rl.ok && rl.response) return rl.response;

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const body = await request.json();
    const {
      full_name,
      phone,
      avatar_url,
      notification_email,
      notification_sms,
      theme,
      language,
    } = body as {
      full_name?: string | null;
      phone?: string | null;
      avatar_url?: string | null;
      notification_email?: boolean;
      notification_sms?: boolean;
      theme?: string | null;
      language?: string | null;
    };

    const errors: string[] = [];

    const nameErr = validateString(full_name, "full_name", { maxLength: 100 });
    if (nameErr) errors.push(nameErr);

    const phoneErr = validateString(phone, "phone", { maxLength: 30 });
    if (phoneErr) errors.push(phoneErr);

    if (theme !== undefined && theme !== null && !ALLOWED_THEMES.has(theme)) {
      errors.push("theme must be one of: dark, light");
    }
    if (language !== undefined && language !== null && !ALLOWED_LANGUAGES.has(language)) {
      errors.push("language must be one of: en, sw");
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (full_name !== undefined) updates.full_name = full_name;
    if (phone !== undefined) updates.phone = phone;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (notification_email !== undefined) updates.notification_email = notification_email;
    if (notification_sms !== undefined) updates.notification_sms = notification_sms;
    if (theme !== undefined) updates.theme = theme;
    if (language !== undefined) updates.language = language;

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ profile: data });
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
