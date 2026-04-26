"use client";

import {
  Ban,
  ExternalLink,
  Loader2,
  MoreHorizontal,
  ShieldMinus,
  ShieldPlus,
  Trash2,
  Unlock,
  UserCog,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminActions } from "./actions";

type MutatePayload =
  | { type: "role"; userId: string; role: string }
  | { type: "ban"; userId: string }
  | { type: "unban"; userId: string }
  | { type: "delete"; userId: string };

interface UserRowActionsProps {
  user: {
    id: string;
    name: string;
    role?: string;
    banned?: boolean;
  };
  onMutate?: (payload: MutatePayload) => void;
}

export function UserRowActions({ user, onMutate }: UserRowActionsProps) {
  const { setRole, banUser, unbanUser, deleteUser, impersonateUser } =
    useAdminActions();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const router = useRouter();
  const isAdmin = user.role === "admin";

  const handleAction = async (
    actionName: string,
    fn: () => Promise<any>,
    mutatePayload?: MutatePayload,
  ) => {
    setIsLoading(actionName);
    try {
      const result = await fn();
      // If the action succeeded (no error returned), apply optimistic update
      if (!result?.error && mutatePayload && onMutate) {
        onMutate(mutatePayload);
      }
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={!!isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => router.push(`/users/${user.id}`)}
        >
          <UserCog className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>

        {/* Promote / Demote */}
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            const newRole = isAdmin ? "user" : "admin";
            handleAction("promote", () => setRole(user.id, newRole), {
              type: "role",
              userId: user.id,
              role: newRole,
            });
          }}
        >
          {isAdmin ? (
            <>
              <ShieldMinus className="mr-2 h-4 w-4 text-amber-500" /> Demote to
              User
            </>
          ) : (
            <>
              <ShieldPlus className="mr-2 h-4 w-4 text-emerald-500" /> Promote
              to Admin
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() =>
            handleAction("impersonate", () => impersonateUser(user.id))
          }
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Impersonate
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Ban / Unban */}
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            if (user.banned) {
              handleAction("ban", () => unbanUser(user.id), {
                type: "unban",
                userId: user.id,
              });
            } else {
              handleAction("ban", () => banUser(user.id), {
                type: "ban",
                userId: user.id,
              });
            }
          }}
        >
          {user.banned ? (
            <>
              <Unlock className="mr-2 h-4 w-4" /> Unban User
            </>
          ) : (
            <>
              <Ban className="mr-2 h-4 w-4 text-destructive" /> Ban User
            </>
          )}
        </DropdownMenuItem>

        {/* Delete */}
        <DropdownMenuItem
          className="text-destructive focus:text-destructive cursor-pointer"
          onClick={() =>
            handleAction(
              "delete",
              () => {
                if (confirm(`Are you sure you want to delete ${user.name}?`)) {
                  return deleteUser(user.id);
                }
                return Promise.resolve();
              },
              { type: "delete", userId: user.id },
            )
          }
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
