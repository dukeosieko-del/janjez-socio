import { createClient } from "@/lib/supabase/middleware";
import { NextResponse } from "next/server";

export async function middleware(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.next();
  }
  const { data: { session } } = await supabase.auth.getSession();

  const isAuthPage = request.url.includes("/auth/sign-in") || request.url.includes("/auth/sign-up") || request.url.includes("/auth/reset-password");
  const isProtectedPage = request.url.includes("/dashboard");

  if (isProtectedPage && !session) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|og-image.png).*)"],
};
