"use client";

import { usePathname } from "next/navigation";
import type React from "react";
import type { NavUser } from "@/components/Navbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { shouldUseAppShell } from "@/lib/app-nav";
import { AppHeader } from "./app-header";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { UserSidebar } from "./user-sidebar";

/** Paper gutter for the content column, plus room to clear the mobile bar. */
export const APP_SHELL_CONTENT_CLASS =
  "flex flex-1 flex-col px-4 pt-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:px-6 md:py-6";

interface AppShellProps {
  user: NavUser;
  children: React.ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  const pathname = usePathname();

  if (!shouldUseAppShell(pathname)) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <UserSidebar />
      <SidebarInset className="min-h-svh">
        <AppHeader user={user} />
        <div data-slot="app-shell-content" className={APP_SHELL_CONTENT_CLASS}>
          {children}
        </div>
        <MobileBottomNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
