import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Routes that require authentication on the main app
const PROTECTED_ROUTES = ["/analyze"];
// Routes only for guests on the main app
const AUTH_ROUTES = ["/sign-in", "/sign-up"];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  const hostname = request.headers.get("host") || "";
  const isHqSubdomain = hostname.startsWith("hq.");

  // Admin subdomain: rewrite to /hq/* — let hq/layout.tsx handle auth
  // Skip rewrite for /api paths — they live at /api/*, not /hq/api/*
  if (isHqSubdomain) {
    if (!pathname.startsWith("/hq") && !pathname.startsWith("/api")) {
      const url = request.nextUrl.clone();
      url.pathname = `/hq${pathname}`;
      return NextResponse.rewrite(url);
    }
    // /api paths and already-rewritten /hq paths pass through as-is
    return NextResponse.next();
  }

  // Regular app protection logic (main domain only)
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtected && !sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
