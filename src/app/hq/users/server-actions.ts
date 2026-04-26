"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { logAuditAction } from "@/lib/admin/audit";
import { auth } from "@/lib/auth";

async function ensureAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function setRoleAction(userId: string, role: string) {
  await ensureAdmin();

  const { data, error } = await auth.api.setRole({
    headers: await headers(),
    body: { userId, role },
  });

  if (error) throw new Error(error.message);

  await logAuditAction({
    action: "SET_ROLE",
    entityType: "user",
    entityId: userId,
    details: { role },
  });

  revalidatePath("/users");
  return data;
}

export async function banUserAction(userId: string, reason?: string) {
  await ensureAdmin();

  const { data, error } = await auth.api.banUser({
    headers: await headers(),
    body: { userId, reason },
  });

  if (error) throw new Error(error.message);

  await logAuditAction({
    action: "BAN_USER",
    entityType: "user",
    entityId: userId,
    details: { reason },
  });

  revalidatePath("/users");
  return data;
}

export async function unbanUserAction(userId: string) {
  await ensureAdmin();

  const { data, error } = await auth.api.unbanUser({
    headers: await headers(),
    body: { userId },
  });

  if (error) throw new Error(error.message);

  await logAuditAction({
    action: "UNBAN_USER",
    entityType: "user",
    entityId: userId,
  });

  revalidatePath("/users");
  return data;
}

export async function deleteUserAction(userId: string) {
  await ensureAdmin();

  const { data, error } = await auth.api.removeUser({
    headers: await headers(),
    body: { userId },
  });

  if (error) throw new Error(error.message);

  await logAuditAction({
    action: "DELETE_USER",
    entityType: "user",
    entityId: userId,
  });

  revalidatePath("/users");
  return data;
}
