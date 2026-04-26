"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import {
  banUserAction,
  deleteUserAction,
  setRoleAction,
  unbanUserAction,
} from "./server-actions";

export const useAdminActions = () => {
  const router = useRouter();

  const setRole = async (userId: string, role: "user" | "admin") => {
    try {
      await setRoleAction(userId, role);
      toast.success(`User promoted to ${role}`);
      return { data: true };
    } catch (error: any) {
      toast.error(error.message || "Failed to set role");
      return { error };
    }
  };

  const banUser = async (userId: string, reason?: string) => {
    try {
      await banUserAction(userId, reason);
      toast.success("User has been banned");
      return { data: true };
    } catch (error: any) {
      toast.error(error.message || "Failed to ban user");
      return { error };
    }
  };

  const unbanUser = async (userId: string) => {
    try {
      await unbanUserAction(userId);
      toast.success("User has been unbanned");
      return { data: true };
    } catch (error: any) {
      toast.error(error.message || "Failed to unban user");
      return { error };
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await deleteUserAction(userId);
      toast.success("User has been deleted");
      // Full navigation needed after delete
      router.push("/hq/users");
      return { data: true };
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
      return { error };
    }
  };

  const impersonateUser = async (userId: string) => {
    const { data, error } = await authClient.admin.impersonateUser({
      userId,
    });

    if (error) {
      toast.error(error.message || "Failed to impersonate user");
      return { error };
    }

    toast.success("Impersonation started");
    window.location.href = "https://app.zaprill.com";
    return { data };
  };

  return {
    setRole,
    banUser,
    unbanUser,
    deleteUser,
    impersonateUser,
  };
};
