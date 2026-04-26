"use client";

import {
  Ban,
  ExternalLink,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Unlock,
} from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAdminActions } from "../actions";

interface UserActionsClientProps {
  user: {
    id: string;
    role: string;
    banned?: boolean;
    name: string;
  };
}

export function UserActionsClient({ user }: UserActionsClientProps) {
  const { setRole, banUser, unbanUser, deleteUser, impersonateUser } =
    useAdminActions();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleAction = async (actionName: string, fn: () => Promise<any>) => {
    setIsLoading(actionName);
    try {
      await fn();
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <p className="text-sm font-medium">Access Management</p>
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            className="justify-start"
            disabled={!!isLoading}
            onClick={() =>
              handleAction("role", () =>
                setRole(user.id, user.role === "admin" ? "user" : "admin"),
              )
            }
          >
            {isLoading === "role" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : user.role === "admin" ? (
              <ShieldAlert className="mr-2 h-4 w-4" />
            ) : (
              <ShieldCheck className="mr-2 h-4 w-4" />
            )}
            {user.role === "admin" ? "Demote to User" : "Promote to Admin"}
          </Button>

          <Button
            variant="outline"
            className="justify-start"
            disabled={!!isLoading}
            onClick={() =>
              handleAction("ban", () =>
                user.banned ? unbanUser(user.id) : banUser(user.id),
              )
            }
          >
            {isLoading === "ban" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : user.banned ? (
              <Unlock className="mr-2 h-4 w-4 text-green-500" />
            ) : (
              <Ban className="mr-2 h-4 w-4 text-destructive" />
            )}
            {user.banned ? "Unban Account" : "Ban Account"}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Session Control</p>
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            className="justify-start"
            disabled={!!isLoading}
            onClick={() =>
              handleAction("impersonate", () => impersonateUser(user.id))
            }
          >
            {isLoading === "impersonate" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="mr-2 h-4 w-4" />
            )}
            Impersonate User
          </Button>

          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="destructive"
                  className="justify-start"
                  disabled={!!isLoading}
                >
                  {isLoading === "delete" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete User Permanent
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  account for <strong>{user.name}</strong> and remove all
                  associated data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() =>
                    handleAction("delete", () => deleteUser(user.id))
                  }
                >
                  Confirm Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
