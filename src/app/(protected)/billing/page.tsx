import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { PageHeader } from "@/components/app/page-header";
import PricingPlans from "@/components/PricingPlans";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import db from "@/db";
import { invoice, plan } from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  formatCurrency,
  getDaysUntil,
  RENEWAL_REMINDER_DAYS,
} from "@/lib/billing-utils";
import {
  getSubscriptionAccessEnd,
  getSubscriptionWithAccess,
  subscriptionGrantsAccess,
} from "@/services/billing/subscription.service";
import type { Subscription } from "@/types/billing";
import { BillingInvoiceTable } from "./_components/billing-invoice-table";
import { RenewalReminder } from "./_components/renewal-reminder";

export const metadata = {
  title: "Billing | Zaprill",
};

function statusBadgeLabel(status: Subscription["status"]): string {
  if (status === "past_due") return "PAST DUE";
  if (status === "trialing") return "TRIAL";
  if (status === "canceled") return "CANCELED";
  return "ACTIVE";
}

export default async function BillingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  const typedSub = await getSubscriptionWithAccess(session.user.id);

  let activePlan = null;
  if (typedSub) {
    const [p] = await db
      .select()
      .from(plan)
      .where(eq(plan.id, typedSub.planId))
      .limit(1);
    activePlan = p;
  }

  const plans = await db
    .select()
    .from(plan)
    .where(eq(plan.isActive, true))
    .orderBy(plan.sortOrder);

  const invoices = await db
    .select()
    .from(invoice)
    .where(eq(invoice.userId, session.user.id))
    .orderBy(desc(invoice.createdAt))
    .limit(20);

  const hasAccess =
    !!typedSub && !!activePlan && subscriptionGrantsAccess(typedSub);
  const accessEndsAt = typedSub ? getSubscriptionAccessEnd(typedSub) : null;
  const daysUntilExpiry =
    accessEndsAt !== null ? getDaysUntil(accessEndsAt) : null;
  const isExpiringSoon =
    hasAccess &&
    daysUntilExpiry !== null &&
    daysUntilExpiry <= RENEWAL_REMINDER_DAYS;
  const isExpired = !!typedSub && !!activePlan && !hasAccess;

  const accessEndLabel = accessEndsAt?.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  let planDescription = "You are currently on the free plan.";
  if (hasAccess && accessEndLabel) {
    planDescription =
      typedSub?.status === "canceled"
        ? `Your plan was canceled. Access continues until ${accessEndLabel}. Renew manually before then to keep pro features.`
        : `Your plan is prepaid. Access continues until ${accessEndLabel}. Renew manually before then to keep pro features — there is no automatic billing.`;
  } else if (isExpired && accessEndLabel) {
    planDescription = `Your prepaid plan ended on ${accessEndLabel}. Choose a plan below to restore pro access.`;
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-6 py-6">
      <PageHeader
        title="Billing"
        description="Manage your plan and view invoices."
      />

      <Card className={hasAccess ? "border-primary/50" : ""}>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>{planDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {hasAccess && activePlan && typedSub ? (
            <div className="space-y-6">
              <div className="rounded-lg border bg-muted/20 p-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">
                    {activePlan.name}
                  </span>
                  <Badge
                    variant={
                      typedSub.status === "past_due" ||
                      typedSub.status === "canceled"
                        ? "secondary"
                        : "default"
                    }
                  >
                    {statusBadgeLabel(typedSub.status)}
                  </Badge>
                </div>
                <p className="mt-1 text-muted-foreground text-sm">
                  {formatCurrency(typedSub.priceAtPurchase)} /{" "}
                  {typedSub.billingCycle}
                </p>
                <p className="mt-2 text-muted-foreground text-xs">
                  Paid period:{" "}
                  {new Date(typedSub.currentPeriodStart).toLocaleDateString()} —{" "}
                  {new Date(typedSub.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>

              {isExpiringSoon && accessEndsAt && daysUntilExpiry !== null ? (
                <>
                  <RenewalReminder
                    expiresAt={accessEndsAt}
                    daysLeft={daysUntilExpiry}
                  />
                  <div className="border-t pt-4">
                    <p className="mb-4 font-medium text-sm">Renew your plan</p>
                    <PricingPlans plans={plans} />
                  </div>
                </>
              ) : null}
            </div>
          ) : (
            <div className="space-y-8">
              {isExpired && activePlan ? (
                <div className="rounded-lg border bg-muted/10 p-6 text-center">
                  <p className="font-medium">{activePlan.name}</p>
                  <p className="mt-1 text-muted-foreground text-sm">
                    This plan is no longer active.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border bg-muted/10 p-8 text-center">
                  <p className="font-medium text-muted-foreground">
                    You don&apos;t have an active premium plan. Choose a plan
                    below to get started.
                  </p>
                </div>
              )}
              <PricingPlans plans={plans} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>
            Click any invoice to view details and download a PDF receipt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BillingInvoiceTable invoices={invoices as any} />
        </CardContent>
      </Card>
    </div>
  );
}
