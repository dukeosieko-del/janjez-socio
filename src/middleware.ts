import { createClient } from "@/lib/supabase/middleware";
import { NextResponse } from "next/server";

export async function middleware(request: Request) {
  const supabase = await createClient();

  if (!supabase) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Authentication service is temporarily unavailable. Please contact support." },
        { status: 500 }
      );
    }
    return NextResponse.next();
  }

  const { data: { session } } = await supabase.auth.getSession();
  const pathname = new URL(request.url).pathname;

  const isAuthPage = pathname.startsWith("/auth/");
  const isProtectedPage = pathname.startsWith("/dashboard");

  if (isProtectedPage && !session) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
