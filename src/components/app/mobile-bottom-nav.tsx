"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAV_PRIMARY, isNavActive } from "@/lib/app-nav";
import { cn } from "@/lib/utils";

/**
 * Each item is at least 44×44px (`min-h-14` / `min-w-11`).
 * Labels are 12px on a 320px screen and 14px from 360px up.
 */
export function mobileNavLinkClass(active: boolean) {
  return cn(
    "flex min-h-14 w-full min-w-11 flex-col items-center justify-center gap-1 rounded-lg px-1 py-1.5 font-medium text-xs leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-[360px]:text-sm",
    active
      ? "bg-primary/10 text-primary"
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const items = APP_NAV_PRIMARY.filter((item) => item.mobilePrimary);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-border border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      aria-label="Main navigation"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1">
        {items.map((item) => {
          const active = isNavActive(pathname, item.url);
          return (
            <li key={item.url} className="flex min-w-11 flex-1">
              <Link
                href={item.url}
                prefetch={false}
                aria-current={active ? "page" : undefined}
                className={mobileNavLinkClass(active)}
              >
                <item.icon
                  className={cn("size-5 shrink-0", active && "stroke-[2.5px]")}
                  aria-hidden
                />
                <span className="w-full text-center leading-tight">
                  {item.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
