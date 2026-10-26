"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { APP_NAV_PRIMARY, APP_NAV_SECONDARY, isNavActive } from "@/lib/app-nav";
import { cn } from "@/lib/utils";

export function UserSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/" prefetch={false} />}
            >
              <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg">
                <Image
                  src="/favicon.ico"
                  alt="Zaprill"
                  width={32}
                  height={32}
                  className="size-full object-contain"
                />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">Zaprill</span>
                <span className="text-muted-foreground text-xs">
                  Career Intelligence
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {APP_NAV_PRIMARY.map((item) => {
                const active = isNavActive(pathname, item.url);
                const isAnalyze = item.url === "/analyze";
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      render={<Link href={item.url} prefetch={false} />}
                      tooltip={item.title}
                      isActive={active}
                      className={cn(
                        active &&
                          "bg-primary/10 text-primary hover:bg-primary/15",
                        isAnalyze && !active && "font-semibold text-foreground",
                      )}
                    >
                      <item.icon className={cn(isAnalyze && "text-primary")} />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {APP_NAV_SECONDARY.map((item) => {
                const active = isNavActive(pathname, item.url);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      render={<Link href={item.url} prefetch={false} />}
                      tooltip={item.title}
                      isActive={active}
                      className={cn(
                        active &&
                          "bg-primary/10 text-primary hover:bg-primary/15",
                      )}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <p className="px-2 text-muted-foreground text-xs">
          Analyze → Jobs → Career Insights
        </p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
