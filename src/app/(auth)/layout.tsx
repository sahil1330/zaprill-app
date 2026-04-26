import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type React from "react";
import { auth } from "@/lib/auth";

/**
 * Layout for auth routes (/sign-in, /sign-up, /forgot-password, /reset-password).
 *
 * Performs a real server-side session check (DB-backed) and redirects
 * already-authenticated users to the home page.
 *
 * We do NOT handle this in proxy.ts because the proxy only checks cookie
 * presence — not actual session validity — and it breaks Next.js Link
 * prefetch caching (prefetch of /sign-in gets cached as a redirect to /,
 * so clicking the Sign In button navigates to / instead of /sign-in).
 */
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    redirect("/");
  }

  return <>{children}</>;
}
