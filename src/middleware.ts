import { createClient } from "@/lib/supabase/middleware";
import { NextResponse } from "next/server";

export async function middleware(request: Request) {
  const supabase = await createClient();

  if (!supabase) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Authentication service is temporarily unavailable. Please contact us at support@janjez.social or try again later." },
        { status: 500 }
      );
    }
    return NextResponse.next();
  }

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = new URL(request.url).pathname;

  const isAuthPage = pathname.startsWith("/auth/");
  const isProtectedPage = pathname.startsWith("/dashboard") || pathname.startsWith("/services");

  if (isProtectedPage && !user) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL("/services", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/services/:path*", "/auth/:path*"],
};
