import { NextResponse, NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/server/auth-helpers";
import { rateLimit } from "@/lib/server/rate-limiter";
import { sendTransactional } from "@/lib/transactional";
import { SITE_URL } from "@/lib/email/config";

export const runtime = "nodejs";

interface SecurityAlertBody {
  ip?: string;
  userAgent?: string;
  location?: string;
  time?: string;
}

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(request, 30);
    if (!rl.ok && rl.response) return rl.response;

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: SecurityAlertBody = {};
    try {
      body = (await request.json()) as SecurityAlertBody;
    } catch {
      body = {};
    }

    const ip = (body.ip || request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    const userAgent = body.userAgent || request.headers.get("user-agent") || "unknown device";
    const location = body.location || "unknown location";
    const time = body.time || new Date().toISOString();

    const result = await sendTransactional({
      name: "user.security_alert",
      userId: user.id,
      audience: "user",
      data: {
        fullName: null,
        ip,
        userAgent,
        location,
        time,
        signOutUrl: `${SITE_URL}/auth/sign-out`,
      },
    });

    return NextResponse.json({
      ok: true,
      emailOk: result.emailOk,
      notificationOk: result.notificationOk,
    });
  } catch (error) {
    console.error("Security alert error:", error);
    return NextResponse.json({ error: "Failed to process security alert" }, { status: 500 });
  }
}