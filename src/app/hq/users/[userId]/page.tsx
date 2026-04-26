import { format } from "date-fns";
import {
  ArrowLeft,
  Ban,
  Calendar,
  Clock,
  ExternalLink,
  Globe,
  History,
  Mail,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Unlock,
  User as UserIcon,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";
import { UserActionsClient } from "./user-actions-client";

export default async function UserDetailPage({
  params,
}: {
  params: { userId: string };
}) {
  const { userId } = params;

  // Fetch user details via admin API
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const { users } = await auth.api.listUsers({
    headers: await headers(),
    query: {
      userId: userId,
    },
  });

  const user = users.find((u) => u.id === userId);

  if (!user) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/users">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
          <p className="text-muted-foreground text-sm">
            Managing{" "}
            <span className="font-medium text-foreground">{user.name}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Info */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-col items-center gap-4 text-center pb-8">
            <Avatar className="h-24 w-24 border-4 border-muted">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback className="text-3xl">
                {user.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <CardDescription className="flex items-center justify-center gap-1">
                <Mail className="h-3 w-3" /> {user.email}
              </CardDescription>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                {user.role === "admin" ? (
                  <ShieldCheck className="mr-1 h-3 w-3" />
                ) : (
                  <UserIcon className="mr-1 h-3 w-3" />
                )}
                {user.role}
              </Badge>
              {user.banned && (
                <Badge variant="destructive">
                  <Ban className="mr-1 h-3 w-3" /> Banned
                </Badge>
              )}
              <Badge variant="outline">
                {user.emailVerified ? "Verified" : "Unverified"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator />
            <div className="grid gap-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-muted-foreground gap-2">
                  <Calendar className="h-4 w-4" /> Joined
                </div>
                <span>{format(new Date(user.createdAt), "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-muted-foreground gap-2">
                  <Shield className="h-4 w-4" /> User ID
                </div>
                <code className="bg-muted px-1 rounded text-[10px]">
                  {user.id}
                </code>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-muted-foreground gap-2">
                  <Globe className="h-4 w-4" /> Provider
                </div>
                <span className="capitalize">Email/Password</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions & Activity */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Administrative Actions</CardTitle>
              <CardDescription>
                Perform sensitive operations on this user account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserActionsClient
                user={{
                  id: user.id,
                  name: user.name,
                  role: user.role,
                  banned: user.banned,
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  The most recent actions performed by this user.
                </CardDescription>
              </div>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 border-l-2 border-muted pl-4 pb-4">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <div className="grid gap-0.5">
                    <p className="text-sm font-medium">
                      Resume Analysis Started
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Today at 2:34 PM
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 border-l-2 border-muted pl-4 pb-4 text-muted-foreground/60">
                  <div className="mt-1 h-2 w-2 rounded-full bg-muted" />
                  <div className="grid gap-0.5">
                    <p className="text-sm font-medium">
                      Signed in from New Device
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Yesterday at 11:05 AM
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 border-l-2 border-transparent pl-4">
                  <div className="mt-1 h-2 w-2 rounded-full bg-muted" />
                  <div className="grid gap-0.5">
                    <p className="text-sm font-medium">
                      Subscription Started (Pro Plan)
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Apr 22, 2026
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
