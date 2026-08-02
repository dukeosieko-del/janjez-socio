import { createClient } from "@/lib/supabase/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SECURITY_HEADERS = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
  "Content-Security-Policy":
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://va.vercel-scripts.org; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://*.supabase.co https://api.zeptomail.com https://*.safaricom.co.ke https://api.dripfeedpanel.com https://*.zeptomail.com; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'",
};

export async function middleware(request: NextRequest) {
  const supabase = await createClient();

  if (!supabase) {
    if (process.env.NODE_ENV === "production") {
      const url = new URL(request.url);
      if (url.pathname.startsWith("/dashboard") || url.pathname.startsWith("/services")) {
        return NextResponse.next();
      }
      return NextResponse.json(
        { error: "Authentication service is temporarily unavailable. Please contact us at support@janjez.social or try again later." },
        { status: 500 }
      );
    }
    return NextResponse.next();
  }

  const response = NextResponse.next();

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = new URL(request.url).pathname;

  const isAuthPage = pathname.startsWith("/auth/");
  const isProtectedPage = pathname.startsWith("/dashboard") || pathname.startsWith("/services");

  if (isProtectedPage && !user) {
    const redirect = NextResponse.redirect(new URL("/auth/sign-in", request.url));
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      redirect.headers.set(key, value);
    }
    return redirect;
  }

  if (isAuthPage && user) {
    const redirect = NextResponse.redirect(new URL("/services", request.url));
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      redirect.headers.set(key, value);
    }
    return redirect;
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/services/:path*", "/auth/:path*"],
};
