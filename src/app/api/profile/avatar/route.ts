import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserFromRequest } from "@/lib/server/auth-helpers";
import { rateLimit } from "@/lib/server/rate-limiter";

export const runtime = "nodejs";

const PNG_SIGNATURE = "iVBORw0KGgo";
const DATA_URL_RE = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/;

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(request, 5);
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
    const { avatar } = body as { avatar?: string };

    if (!avatar || typeof avatar !== "string") {
      return NextResponse.json({ error: "avatar (base64 data URL) is required" }, { status: 400 });
    }

    const match = avatar.match(DATA_URL_RE);
    if (!match) {
      return NextResponse.json({ error: "Invalid data URL format" }, { status: 400 });
    }

    const mimeType = match[1];
    const base64Data = match[2];

    let buffer: Buffer;
    try {
      buffer = Buffer.from(base64Data, "base64");
    } catch {
      return NextResponse.json({ error: "Invalid base64 data" }, { status: 400 });
    }

    const filePath = `${user.id}/avatar.png`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 400 });
    }

    const { data: publicData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const publicUrl = publicData?.publicUrl;

    if (!publicUrl) {
      return NextResponse.json({ error: "Failed to resolve public URL" }, { status: 500 });
    }

    await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    return NextResponse.json({ avatar_url: publicUrl, path: uploadData?.path });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json({ error: "Failed to upload avatar" }, { status: 500 });
  }
}
