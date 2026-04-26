"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Ban, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { DataTable } from "@/components/admin/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRowActions } from "../user-row-actions";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
  banned?: boolean;
  createdAt: Date;
};

type MutatePayload =
  | { type: "role"; userId: string; role: string }
  | { type: "ban"; userId: string }
  | { type: "unban"; userId: string }
  | { type: "delete"; userId: string };

/** Apply a mutation to the local users array — no refetch needed */
function applyMutation(users: User[], payload: MutatePayload): User[] {
  switch (payload.type) {
    case "role":
      return users.map((u) =>
        u.id === payload.userId ? { ...u, role: payload.role } : u,
      );
    case "ban":
      return users.map((u) =>
        u.id === payload.userId ? { ...u, banned: true } : u,
      );
    case "unban":
      return users.map((u) =>
        u.id === payload.userId ? { ...u, banned: false } : u,
      );
    case "delete":
      return users.filter((u) => u.id !== payload.userId);
  }
}

function buildColumns(
  onMutate: (payload: MutatePayload) => void,
): ColumnDef<User>[] {
  return [
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return (
          <Badge
            variant={role === "admin" ? "default" : "secondary"}
            className="capitalize"
          >
            {role === "admin" && <ShieldCheck className="mr-1 h-3 w-3" />}
            {role}
          </Badge>
        );
      },
    },
    {
      accessorKey: "banned",
      header: "Status",
      cell: ({ row }) => {
        const isBanned = row.getValue("banned") as boolean;
        return (
          <Badge
            variant={isBanned ? "destructive" : "outline"}
            className="capitalize"
          >
            {isBanned ? (
              <>
                <Ban className="mr-1 h-3 w-3" /> Banned
              </>
            ) : (
              "Active"
            )}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(row.getValue("createdAt")), "MMM d, yyyy")}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <UserRowActions
            user={{
              id: user.id,
              name: user.name,
              role: user.role,
              banned: user.banned,
            }}
            onMutate={onMutate}
          />
        );
      },
    },
  ];
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}

export function UsersTable() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((json) => setUsers(json.users ?? []))
      .catch(() => setError("Failed to load users"));
  }, []);

  const handleMutate = useCallback((payload: MutatePayload) => {
    setUsers((prev) => (prev ? applyMutation(prev, payload) : prev));
  }, []);

  const columns = buildColumns(handleMutate);

  if (error) {
    return (
      <p className="text-sm text-destructive text-center py-12">{error}</p>
    );
  }

  if (!users) {
    return <TableSkeleton />;
  }

  return (
    <DataTable
      columns={columns}
      data={users as any}
      searchKey="name"
      onExport={() => console.log("Exporting CSV...")}
    />
  );
}
