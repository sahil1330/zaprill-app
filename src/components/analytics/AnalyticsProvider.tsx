"use client";

/**
 * AnalyticsProvider.tsx
 *
 * App-wide analytics concerns:
 *  1. Page view tracking on every client-side route change (App Router requirement)
 *  2. User identity sync from session → GA4 user_id
 *  3. Live user heartbeat — keeps the user visible in GA4 Realtime "Active Users"
 *  4. Global unhandled error capture → trackException
 *
 * Mount this ONCE in the root layout, as a sibling/wrapper of <Providers>.
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  setUserId,
  clearUserId,
  trackPageView,
  startHeartbeat,
  trackException,
} from "@/lib/analytics";

export function AnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const prevPathname = useRef<string | null>(null);

  // ── 1. Page view on route change ─────────────────────────────────────────
  useEffect(() => {
    // Skip if pathname hasn't changed (StrictMode double-invoke guard)
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;

    // Small delay so document.title has been updated by the page component
    const timer = setTimeout(() => {
      trackPageView(window.location.href, document.title);
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  // ── 2. User identity sync ─────────────────────────────────────────────────
  useEffect(() => {
    if (session?.user?.id) {
      setUserId(session.user.id);
    } else if (session === null) {
      // session is explicitly null = logged out / no session
      clearUserId();
    }
  }, [session]);

  // ── 3. Live user heartbeat ────────────────────────────────────────────────
  useEffect(() => {
    const stopHeartbeat = startHeartbeat();
    return () => stopHeartbeat();
  }, []);

  // ── 4. Global error capture ───────────────────────────────────────────────
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      trackException(
        `${event.message} (${event.filename}:${event.lineno})`,
        /* fatal */ false
      );
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message =
        event.reason instanceof Error
          ? event.reason.message
          : String(event.reason);
      trackException(`Unhandled Promise Rejection: ${message}`, false);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return <>{children}</>;
}
