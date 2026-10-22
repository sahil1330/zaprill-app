"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Ban, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/admin/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRowActions } from "../user-row-actions";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
  banned?: boolean;
  isPro?: boolean;
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
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="User" />
      ),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              {user.isPro && (
                <div className="-right-1 -top-1 absolute flex h-3 w-3 items-center justify-center rounded-full border-2 border-background bg-primary">
                  <div className="h-1 w-1 rounded-full bg-white" />
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-medium">{user.name}</span>
                {user.isPro && (
                  <Badge
                    variant="default"
                    className="h-4 border-none bg-linear-to-r from-yellow-400 to-orange-500 px-1 font-bold text-[10px] text-white uppercase tracking-wider"
                  >
                    Pro
                  </Badge>
                )}
              </div>
              <span className="text-muted-foreground text-xs">
                {user.email}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "isPro",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Subscription" />
      ),
      cell: ({ row }) => {
        const isPro = row.getValue("isPro") as boolean;
        return (
          <Badge variant={isPro ? "default" : "outline"} className="capitalize">
            {isPro ? "Pro" : "Free"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
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
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
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
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Joined" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
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
      {["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"].map((slot) => (
        <Skeleton key={slot} className="h-14 w-full" />
      ))}
    </div>
  );
}

export function UsersTable() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [proFilter, setProFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((json) => setUsers(json.users ?? []))
      .catch(() => setError("Failed to load users"));
  }, []);

  const handleMutate = useCallback((payload: MutatePayload) => {
    setUsers((prev) => (prev ? applyMutation(prev, payload) : prev));
  }, []);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (proFilter === "pro") return users.filter((u) => u.isPro);
    if (proFilter === "free") return users.filter((u) => !u.isPro);
    return users;
  }, [users, proFilter]);

  const columns = buildColumns(handleMutate);

  if (error) {
    return (
      <p className="py-12 text-center text-destructive text-sm">{error}</p>
    );
  }

  if (!users) {
    return <TableSkeleton />;
  }

  return (
    <DataTable
      columns={columns}
      data={filteredUsers as any}
      searchKey="name"
      onExport={() => console.log("Exporting CSV...")}
      toolbarContent={
        <Select
          value={proFilter}
          onValueChange={(v) => setProFilter(v ?? "all")}
        >
          <SelectTrigger className="w-37.5">
            <SelectValue placeholder="Subscription" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="pro">Pro Users</SelectItem>
            <SelectItem value="free">Free Users</SelectItem>
          </SelectContent>
        </Select>
      }
    />
  );
}
