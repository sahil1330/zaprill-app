"use client";

import {
  ArrowDownToLine,
  Calendar,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileText,
  Receipt,
  Tag,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/billing-utils";

type Invoice = {
  id: string;
  amountDue: string;
  amountPaid: string | null;
  currency: string;
  status: string;
  billingReason: string;
  dueDate: Date | null;
  paidAt: Date | null;
  discountAmount: string | null;
  taxAmount: string | null;
  gstPercentage: string | null;
  totalAmount: string;
  metadata: unknown;
  createdAt: Date;
};

// ─────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────

function formatInvoiceNumber(id: string): string {
  return id.replace("inv_", "INV-").toUpperCase();
}

function billingReasonLabel(reason: string): string {
  const map: Record<string, string> = {
    subscription_create: "New Subscription",
    renewal: "Subscription Renewal",
    upgrade: "Plan Upgrade",
    downgrade: "Plan Downgrade",
  };
  return map[reason] ?? reason;
}

function statusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "paid") return "default";
  if (status === "failed" || status === "void") return "destructive";
  return "secondary";
}

function StatusIcon({ status }: { status: string }) {
  if (status === "paid")
    return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (status === "failed" || status === "void")
    return <XCircle className="h-4 w-4 text-destructive" />;
  return null;
}

// ─────────────────────────────────────────────────
// Invoice Detail Modal
// ─────────────────────────────────────────────────

function InvoiceModal({
  invoice,
  open,
  onClose,
}: {
  invoice: Invoice | null;
  open: boolean;
  onClose: () => void;
}) {
  const [downloading, setDownloading] = useState(false);

  if (!invoice) return null;

  const inv = invoice;
  const subtotal = parseFloat(inv.amountDue);
  const discount = parseFloat(inv.discountAmount ?? "");
  const tax = parseFloat(inv.taxAmount ?? "");
  const total = parseFloat(inv.totalAmount);
  const gstPct = inv.gstPercentage ? parseFloat(inv.gstPercentage) : 0;
  const hasDiscount = discount > 0;
  const hasGst = tax > 0 && gstPct > 0;
  const meta = inv.metadata as Record<string, string>;
  const planName = (meta?.planName as string) || "Subscription";
  const billingCycle = (meta?.billingCycle as string) || "monthly";

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/billing/invoices/${inv.id}/pdf`);
      if (!res.ok) throw new Error("Failed to generate PDF");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${formatInvoiceNumber(inv.id)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-full max-w-lg gap-0 overflow-hidden p-0">
        {/* Header */}
        <div className="bg-linear-to-br from-foreground to-foreground/90 px-6 py-5 text-background">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <Receipt className="h-4 w-4 opacity-70" />
                  <span className="font-semibold text-xs uppercase tracking-widest opacity-70">
                    Invoice
                  </span>
                </div>
                <DialogTitle className="font-bold text-background text-xl">
                  {formatInvoiceNumber(inv.id)}
                </DialogTitle>
              </div>
              <Badge
                variant="outline"
                className={
                  inv.status === "paid"
                    ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-300 text-xs"
                    : "border-red-400/40 bg-red-500/20 text-red-300 text-xs"
                }
              >
                {inv.status === "paid" ? "✓ PAID" : inv.status.toUpperCase()}
              </Badge>
            </div>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-5">
          {/* Meta info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="mb-1 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                Invoice Date
              </p>
              <p className="flex items-center gap-1.5 text-foreground">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                {new Date(inv.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="mb-1 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                {inv.status === "paid" ? "Paid On" : "Due Date"}
              </p>
              <p className="flex items-center gap-1.5 text-foreground">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                {inv.paidAt
                  ? new Date(inv.paidAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : inv.dueDate
                    ? new Date(inv.dueDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "—"}
              </p>
            </div>
            <div>
              <p className="mb-1 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                Type
              </p>
              <p className="flex items-center gap-1.5 text-foreground">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                {billingReasonLabel(inv.billingReason)}
              </p>
            </div>
            <div>
              <p className="mb-1 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                Plan
              </p>
              <p className="flex items-center gap-1.5 text-foreground">
                <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                {planName}{" "}
                <span className="text-muted-foreground text-xs capitalize">
                  ({billingCycle})
                </span>
              </p>
            </div>
          </div>

          {/* Line items */}
          <div className="overflow-hidden rounded-lg border">
            <div className="flex justify-between bg-muted/40 px-4 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              <span>Description</span>
              <span>Amount</span>
            </div>

            {/* Subtotal */}
            <div className="flex items-start justify-between border-t px-4 py-3 text-sm">
              <div>
                <p className="font-medium text-foreground">{planName}</p>
                <p className="mt-0.5 text-muted-foreground text-xs">
                  {billingReasonLabel(inv.billingReason)} ·{" "}
                  {billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)}{" "}
                  plan
                </p>
              </div>
              <span className="font-medium text-foreground tabular-nums">
                {formatCurrency(subtotal, inv.currency)}
              </span>
            </div>

            {/* Discount */}
            {hasDiscount && (
              <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
                <div className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="font-medium text-emerald-600">
                    Coupon Discount
                  </span>
                </div>
                <span className="font-medium text-emerald-600 tabular-nums">
                  −{formatCurrency(discount, inv.currency)}
                </span>
              </div>
            )}

            {/* GST */}
            {hasGst && (
              <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
                <span className="text-muted-foreground">GST ({gstPct}%)</span>
                <span className="text-muted-foreground tabular-nums">
                  +{formatCurrency(tax, inv.currency)}
                </span>
              </div>
            )}

            {/* Total */}
            <div className="flex items-center justify-between border-t bg-foreground px-4 py-3.5 text-background">
              <span className="font-bold text-sm">Total Paid</span>
              <span className="font-bold text-base tabular-nums">
                {formatCurrency(total, inv.currency)}
              </span>
            </div>
          </div>

          {/* Invoice ID reference */}
          <p className="text-center text-muted-foreground text-xs">
            Invoice ID:{" "}
            <span className="font-mono text-foreground">{inv.id}</span>
          </p>
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 px-6 pb-5">
          <Button
            className="flex-1"
            onClick={handleDownload}
            disabled={downloading}
          >
            <ArrowDownToLine className="mr-2 h-4 w-4" />
            {downloading ? "Generating PDF…" : "Download Invoice PDF"}
          </Button>
          <Button variant="outline" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────
// Main Table Component
// ─────────────────────────────────────────────────

export function BillingInvoiceTable({ invoices }: { invoices: Invoice[] }) {
  const [selected, setSelected] = useState<Invoice | null>(null);

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Receipt className="mb-3 h-10 w-10 text-muted-foreground/40" />
        <p className="font-medium text-muted-foreground text-sm">
          No invoices yet
        </p>
        <p className="mt-1 text-muted-foreground/70 text-xs">
          Your invoices will appear here after your first payment.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow
                key={inv.id}
                className="cursor-pointer transition-colors hover:bg-muted/40"
                onClick={() => setSelected(inv)}
              >
                <TableCell className="font-medium font-mono text-xs">
                  {formatInvoiceNumber(inv.id)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(inv.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell className="font-semibold tabular-nums">
                  {formatCurrency(inv.totalAmount, inv.currency)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <StatusIcon status={inv.status} />
                    <Badge variant={statusVariant(inv.status)}>
                      {inv.status}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm capitalize">
                  {billingReasonLabel(inv.billingReason)}
                </TableCell>
                <TableCell className="text-right">
                  <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <InvoiceModal
        invoice={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
