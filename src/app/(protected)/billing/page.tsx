import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import db from "@/db";
import { invoice, plan, subscription } from "@/db/schema";
import { auth } from "@/lib/auth";
import { formatCurrency } from "@/lib/billing-utils";
import CancelSubscriptionButton from "./cancel-button";

export const metadata = {
  title: "Billing | Zaprill",
};

export default async function BillingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null; // handled by middleware

  // Fetch active subscription
  const [sub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, session.user.id))
    .orderBy(desc(subscription.createdAt))
    .limit(1);

  let activePlan = null;
  if (sub) {
    const [p] = await db
      .select()
      .from(plan)
      .where(eq(plan.id, sub.planId))
      .limit(1);
    activePlan = p;
  }

  // Fetch invoices
  const invoices = await db
    .select()
    .from(invoice)
    .where(eq(invoice.userId, session.user.id))
    .orderBy(desc(invoice.createdAt))
    .limit(20);

  return (
    <div className="container max-w-5xl mx-auto py-12 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Billing & Subscription
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your active plan and billing history.
        </p>
      </div>

      {/* Subscription Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            {sub?.status === "active"
              ? "Your subscription is active and will auto-renew."
              : sub?.status === "canceled"
                ? "Your subscription has been canceled but remains active until the end of the billing period."
                : "You are currently on the free plan."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {sub && activePlan ? (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg bg-muted/20">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">
                    {activePlan.name}
                  </span>
                  <Badge
                    variant={sub.status === "active" ? "default" : "secondary"}
                  >
                    {sub.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatCurrency(sub.priceAtPurchase)} / {sub.billingCycle}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Current period:{" "}
                  {new Date(sub.currentPeriodStart).toLocaleDateString()} —{" "}
                  {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
              {sub.status === "active" && (
                <CancelSubscriptionButton subscriptionId={sub.id} />
              )}
            </div>
          ) : (
            <div className="p-4 border rounded-lg bg-muted/20 text-center">
              <p className="mb-4">
                You don&apos;t have an active premium subscription.
              </p>
              <a
                href="/pricing"
                className="text-primary hover:underline font-medium"
              >
                View Pricing Plans
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>Recent payments and billing events.</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No invoices found.
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Order ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{formatCurrency(inv.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            inv.status === "paid"
                              ? "default"
                              : inv.status === "failed" || inv.status === "void"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize text-muted-foreground text-sm">
                        {inv.billingReason.replace("_", " ")}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        {inv.id}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
