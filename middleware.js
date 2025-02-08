import { NextResponse } from "next/server";

export function middleware(req) {
  const hasToken = req.cookies.has("token");

  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    if (!hasToken) {
      return NextResponse.redirect(new URL("/login-register", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
