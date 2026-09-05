import { createClient } from "@/lib/supabase/middleware";
import { NextResponse } from "next/server";

const CSP_HEADER =
  "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https: wss:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';";

export async function middleware(request: Request) {
  const supabase = await createClient();

  if (!supabase) {
    if (process.env.NODE_ENV === "production") {
      const res = NextResponse.json(
        { error: "Authentication service is temporarily unavailable. Please contact us at support@janjez.social or try again later." },
        { status: 500 }
      );
      applySecurityHeaders(res, request.url);
      return res;
    }
    return NextResponse.next();
  }

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = new URL(request.url).pathname;

  const isAuthPage = pathname.startsWith("/auth/");
  const isAdminPage = pathname.startsWith("/admin");
  const isPublicTracking = pathname.startsWith("/orders/track");
  const isProtectedPage =
    isAdminPage ||
    pathname.startsWith("/dashboard") ||
    (pathname.startsWith("/orders") && !isPublicTracking) ||
    pathname.startsWith("/pay") ||
    pathname.startsWith("/wallet") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/blog/write") ||
    pathname.startsWith("/blog/drafts") ||
    pathname.startsWith("/blog/my-articles") ||
    (pathname.startsWith("/blog/") && pathname.includes("/edit"));

  const redirectTo = `/auth/sign-in?next=${encodeURIComponent(pathname)}`;

  if (isProtectedPage && !user) {
    const response = NextResponse.redirect(new URL(redirectTo, request.url));
    applySecurityHeaders(response, request.url);
    return response;
  }

  if (isAdminPage && user) {
    const metaRole = (user.user_metadata as { role?: string } | undefined)?.role;
    if (metaRole !== "admin") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile || profile.role !== "admin") {
        const response = NextResponse.next();
        applySecurityHeaders(response, request.url);
        return response;
      }
    }
  }

  const returnTo = (() => {
    try {
      return new URL(request.url).searchParams.get("next") || "/services";
    } catch {
      return "/services";
    }
  })();

  if (isAuthPage && user) {
    const response = NextResponse.redirect(new URL(returnTo, request.url));
    applySecurityHeaders(response, request.url);
    return response;
  }

  const response = NextResponse.next();
  applySecurityHeaders(response, request.url);
  return response;
}

function applySecurityHeaders(response: NextResponse, requestUrl?: string) {
  const pathname = requestUrl ? new URL(requestUrl).pathname : "";

  response.headers.set("Content-Security-Policy", CSP_HEADER);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");

  if (!pathname.startsWith("/_next/static/")) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0, private");
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/:path*",
    "/admin",
    "/admin/:path*",
    "/orders/:path*",
    "/pay",
    "/wallet/:path*",
    "/settings/:path*",
  ],
};
