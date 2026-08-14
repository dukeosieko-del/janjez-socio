import { createClient } from "@/lib/supabase/middleware";
import { NextResponse } from "next/server";

const CSP_HEADER =
  "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';";

export async function middleware(request: Request) {
  const supabase = await createClient();

  if (!supabase) {
    if (process.env.NODE_ENV === "production") {
      const res = NextResponse.json(
        { error: "Authentication service is temporarily unavailable. Please contact us at support@janjez.social or try again later." },
        { status: 500 }
      );
      applySecurityHeaders(res);
      return res;
    }
    return NextResponse.next();
  }

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = new URL(request.url).pathname;

  const isAuthPage = pathname.startsWith("/auth/");
  const isAdminPage = pathname.startsWith("/admin");
  const isProtectedPage = isAdminPage || pathname.startsWith("/dashboard") || pathname.startsWith("/services");

  if (isProtectedPage && !user) {
    const response = NextResponse.redirect(new URL("/auth/sign-in", request.url));
    applySecurityHeaders(response);
    return response;
  }

  if (isAdminPage && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      const response = NextResponse.redirect(new URL("/dashboard", request.url));
      applySecurityHeaders(response);
      return response;
    }
  }

  if (isAuthPage && user) {
    const response = NextResponse.redirect(new URL("/services", request.url));
    applySecurityHeaders(response);
    return response;
  }

  const response = NextResponse.next();
  applySecurityHeaders(response);
  return response;
}

function applySecurityHeaders(response: NextResponse) {
  response.headers.set("Content-Security-Policy", CSP_HEADER);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
}

export const config = {
  matcher: ["/dashboard/:path*", "/services/:path*", "/auth/:path*", "/admin/:path*"],
};
