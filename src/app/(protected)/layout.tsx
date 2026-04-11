import { auth } from "@/lib/auth";
import ClientProvider from "@/providers/ClientProvider";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import React from "react";

export async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/sign-in");
  }

  return <ClientProvider user={session.user}>{children}</ClientProvider>;
}

export default AuthLayout;
