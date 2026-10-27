import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  CreditCard,
  FileText,
  Gift,
  GraduationCap,
  Home,
  Target,
  TrendingUp,
  User,
} from "lucide-react";

export interface AppNavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  /** Shown in mobile bottom bar */
  mobilePrimary?: boolean;
}

export const APP_NAV_PRIMARY: AppNavItem[] = [
  { title: "Home", url: "/", icon: Home, mobilePrimary: true },
  {
    title: "Skill Coach",
    url: "/skill-coach",
    icon: GraduationCap,
    mobilePrimary: true,
  },
  { title: "Resumes", url: "/resumes", icon: FileText, mobilePrimary: true },
];

export const APP_NAV_SECONDARY: AppNavItem[] = [
  { title: "Profile", url: "/profile", icon: User },
  { title: "Billing", url: "/billing", icon: CreditCard },
  { title: "Referrals", url: "/referrals", icon: Gift },
];

export const APP_NAV_LINKED: AppNavItem[] = [
  { title: "Analyze", url: "/analyze", icon: Target },
  { title: "My Jobs", url: "/jobs", icon: Briefcase },
  { title: "Career Insights", url: "/history", icon: TrendingUp },
];

export const ALL_APP_NAV = [...APP_NAV_PRIMARY, ...APP_NAV_SECONDARY];

const FULLSCREEN_EXACT = new Set([
  "/onboarding",
  "/checkout",
  "/payment/status",
]);

/** Routes that use their own chrome (editor, checkout, onboarding). */
export function shouldUseAppShell(pathname: string): boolean {
  if (FULLSCREEN_EXACT.has(pathname)) return false;
  if (pathname.startsWith("/checkout")) return false;
  if (pathname.startsWith("/payment/")) return false;
  // Resume editor & export — custom layout
  if (/^\/resumes\/[^/]+/.test(pathname)) return false;
  return true;
}

export function getNavTitle(pathname: string): string {
  if (pathname === "/") return "Home";
  const match = [...ALL_APP_NAV, ...APP_NAV_LINKED].find(
    (item) =>
      pathname === item.url ||
      (item.url !== "/" && pathname.startsWith(item.url)),
  );
  return match?.title ?? "Zaprill";
}

export function isNavActive(pathname: string, url: string): boolean {
  if (url === "/") return pathname === "/";
  return pathname === url || pathname.startsWith(`${url}/`);
}
