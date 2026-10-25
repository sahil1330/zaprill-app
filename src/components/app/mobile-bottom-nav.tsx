"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAV_PRIMARY, isNavActive } from "@/lib/app-nav";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();
  const items = APP_NAV_PRIMARY.filter((item) => item.mobilePrimary);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-border border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      aria-label="Main navigation"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around">
        {items.map((item) => {
          const active = isNavActive(pathname, item.url);
          return (
            <li key={item.url} className="flex-1">
              <Link
                href={item.url}
                prefetch={false}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-1 py-2.5 font-bold text-[10px] uppercase tracking-wide transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn("h-5 w-5", active && "stroke-[2.5px]")}
                  aria-hidden
                />
                <span className="truncate">{item.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
