"use client";

import {
  ArrowDownToLine,
  Calendar,
  CheckCircle2,
  FileText,
  Loader2,
  RefreshCcw,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/billing-utils";
import type { Invoice } from "@/types/billing";

export default function PaymentStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const params = use(searchParams);
  const orderId = params.orderId;
  const router = useRouter();

  const [status, setStatus] = useState<
    "loading" | "paid" | "failed" | "pending" | "void"
  >("loading");
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!orderId) {
      router.push("/billing");
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await fetch(
          `/api/billing/payment-status?orderId=${orderId}`,
        );
        const data = await res.json();

        if (!res.ok) {
          setStatus("failed");
          return;
        }

        setStatus(data.status);
        if (data.invoice) setInvoice(data.invoice);

        // If it's still pending, Cashfree webhook might be delayed. Poll a few times.
        if (data.status === "pending" && retryCount < 10) {
          setTimeout(() => setRetryCount((c) => c + 1), 2000);
        }
      } catch (err) {
        setStatus("failed");
      }
    };

    checkStatus();
  }, [orderId, retryCount, router]);

  const handleDownload = async () => {
    if (!orderId) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/billing/invoices/${orderId}/pdf`);
      if (!res.ok) throw new Error("Failed to generate PDF");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const filename = orderId.replace("inv_", "INV-").toUpperCase();
      a.download = `${filename}.pdf`;
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

  const handleRetryPayment = async () => {
    try {
      setStatus("loading");
      const res = await fetch("/api/billing/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: orderId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("failed");
        return;
      }

      if ((window as any).Cashfree) {
        const cf = (window as any).Cashfree({
          mode:
            process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT === "PRODUCTION"
              ? "production"
              : "sandbox",
        });
        cf.checkout({ paymentSessionId: data.paymentSessionId });
      } else {
        const script = document.createElement("script");
        script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
        document.body.appendChild(script);
        script.onload = () => {
          const cf = (window as any).Cashfree({
            mode:
              process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT === "PRODUCTION"
                ? "production"
                : "sandbox",
          });
          cf.checkout({ paymentSessionId: data.paymentSessionId });
        };
      }
    } catch {
      setStatus("failed");
    }
  };

  const meta = invoice?.metadata as Record<string, string>;
  const planName = meta?.planName || "Subscription";

  return (
    <div className="container mx-auto max-w-lg px-4 py-6 md:py-8">
      <Card className="overflow-hidden border-muted/60 shadow-xl">
        {/* Status Header */}
        <div
          className={`h-2 w-full ${
            status === "paid"
              ? "bg-emerald-500"
              : status === "failed" || status === "void"
                ? "bg-destructive"
                : "animate-pulse bg-primary"
          }`}
        />

        <CardHeader className="pt-10 pb-6 text-center">
          <div
            className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full ${
              status === "paid"
                ? "bg-score-high/50"
                : status === "failed" || status === "void"
                  ? "bg-destructive/5"
                  : "bg-muted/50"
            }`}
          >
            {status === "loading" || status === "pending" ? (
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            ) : status === "paid" ? (
              <CheckCircle2 className="h-10 w-10 text-score-high-fg" />
            ) : (
              <XCircle className="h-10 w-10 text-destructive" />
            )}
          </div>
          <CardTitle className="font-bold text-2xl tracking-tight">
            {status === "loading" && "Verifying Payment..."}
            {status === "pending" && "Payment Processing"}
            {status === "paid" && "Payment Successful"}
            {(status === "failed" || status === "void") && "Payment Failed"}
          </CardTitle>
          <CardDescription className="mx-auto mt-2 max-w-xs text-base">
            {status === "loading" &&
              "Please wait while we confirm your transaction with the bank."}
            {status === "pending" &&
              "We've received your request. Confirmation usually takes a few seconds."}
            {status === "paid" &&
              "Success! Your plan is now active and your receipt is ready."}
            {(status === "failed" || status === "void") &&
              "We couldn't process your payment. Please check your bank details."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Summary Section (Only on success/pending) */}
          {(status === "paid" || status === "pending") && invoice && (
            <div className="overflow-hidden rounded-xl border bg-muted/20">
              <div className="flex items-center justify-between border-bottom bg-muted/40 px-5 py-3">
                <span className="font-bold text-muted-foreground text-xs uppercase tracking-wider">
                  Order Summary
                </span>
                <span className="font-mono text-muted-foreground text-xs">
                  {orderId?.replace("inv_", "INV-").toUpperCase()}
                </span>
              </div>
              <div className="space-y-4 p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-bold text-foreground">{planName}</p>
                    <p className="flex items-center gap-1.5 text-muted-foreground text-xs">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(invoice.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="font-bold text-foreground text-lg tabular-nums">
                    {formatCurrency(invoice.totalAmount, invoice.currency)}
                  </span>
                </div>

                {status === "paid" && (
                  <div className="flex items-center justify-between border-muted-foreground/10 border-t pt-3">
                    <div className="flex items-center gap-1.5 text-score-high-fg">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="font-medium text-sm">Fully Paid</span>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      Ref: {invoice.cashfreeOrderId || "—"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Simple ID for other states */}
          {(status === "failed" ||
            status === "void" ||
            status === "loading") && (
            <div className="flex flex-col items-center gap-2 py-2">
              <p className="font-semibold text-muted-foreground text-xs uppercase tracking-widest">
                Transaction Reference
              </p>
              <code className="rounded-md border bg-muted px-3 py-1 font-mono text-sm">
                {orderId}
              </code>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex-col gap-3 px-6 pb-10">
          {status === "paid" && (
            <>
              <Button
                className="h-11 w-full text-base shadow-sm"
                onClick={() => router.push("/")}
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                className="h-11 w-full"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowDownToLine className="mr-2 h-4 w-4" />
                )}
                {downloading ? "Preparing PDF..." : "Download Invoice PDF"}
              </Button>
            </>
          )}

          {(status === "failed" || status === "void") && (
            <div className="flex w-full flex-col gap-3 md:flex-row">
              <Button
                variant="outline"
                className="h-11 flex-1"
                onClick={() => router.push("/billing")}
              >
                Back to Billing
              </Button>
              <Button className="h-11 flex-1" onClick={handleRetryPayment}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Retry Payment
              </Button>
            </div>
          )}

          {(status === "loading" || status === "pending") && (
            <Button variant="secondary" className="h-11 w-full" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Waiting for Confirmation...
            </Button>
          )}

          <p className="mt-2 px-4 text-center text-muted-foreground text-xs">
            A copy of this receipt has been sent to your registered email
            address. For billing support, please contact help@zaprill.com
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
