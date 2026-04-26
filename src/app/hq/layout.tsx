import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type React from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  console.log("HQ Layout Session:", JSON.stringify(session?.user, null, 2));

  const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

  // 1. Session check — redirect to main app sign-in (absolute URL, different domain)
  if (!session?.user) {
    redirect(`${baseUrl}/sign-in`);
  }

  // 2. Role check (User manually set their role to "admin" in DB)
  if (session.user.role !== "admin") {
    // If not admin, redirect back to main app home
    redirect(baseUrl);
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AdminHeader user={session.user} />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-8 bg-muted/30 min-w-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
