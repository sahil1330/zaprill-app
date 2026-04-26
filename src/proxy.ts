import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Routes that require authentication on the main app
const PROTECTED_ROUTES = ["/analyze"];
// Routes only for guests on the main app
const AUTH_ROUTES = ["/sign-in", "/sign-up"];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // getSessionCookie resolves the better-auth session cookie name automatically.
  // No extra options needed — it handles both plain and __Secure- prefixed
  // variants based on what's present in the request cookies.
  const sessionCookie = getSessionCookie(request);

  const hostname = request.headers.get("host") || "";
  const isHqSubdomain = hostname.startsWith("hq.");

  // Admin subdomain routing
  if (isHqSubdomain) {
    // Skip /api paths — they live at /api/*, not /hq/api/*
    if (pathname.startsWith("/api")) {
      return NextResponse.next();
    }

    // Strip redundant /hq prefix: hq.zaprill.com/hq/dashboard → hq.zaprill.com/dashboard
    // This happens when sidebar links have hardcoded /hq/* hrefs
    if (pathname.startsWith("/hq")) {
      const url = request.nextUrl.clone();
      url.pathname = pathname.replace(/^\/hq/, "") || "/";
      return NextResponse.redirect(url);
    }

    // Rewrite clean path to internal /hq/* route: hq.zaprill.com/dashboard → /hq/dashboard
    const url = request.nextUrl.clone();
    url.pathname = `/hq${pathname}`;
    return NextResponse.rewrite(url);
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

  // NOTE: We intentionally do NOT redirect logged-in users away from auth
  // routes here. Doing so causes Next.js Link prefetch requests to /sign-in
  // to be cached as a redirect to /, which breaks the Sign In button for users
  // who are briefly shown it during the useSession() loading window.
  // The (auth)/layout.tsx handles this redirect server-side with a real session check.

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
