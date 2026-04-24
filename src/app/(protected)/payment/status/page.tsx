"use client";

import { CheckCircle2, Loader2, RefreshCcw, XCircle } from "lucide-react";
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
  const [retryCount, setRetryCount] = useState(0);

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

  return (
    <div className="container max-w-md mx-auto py-20 px-4">
      <Card className="text-center shadow-lg border-muted">
        <CardHeader className="pt-8 pb-4">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-muted/50">
            {status === "loading" || status === "pending" ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            ) : status === "paid" ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            ) : (
              <XCircle className="w-8 h-8 text-destructive" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === "loading" && "Verifying Payment..."}
            {status === "pending" && "Payment Processing"}
            {status === "paid" && "Payment Successful"}
            {(status === "failed" || status === "void") && "Payment Failed"}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {status === "loading" &&
              "Please wait while we verify your transaction."}
            {status === "pending" &&
              "Waiting for confirmation from your bank. This may take a moment."}
            {status === "paid" &&
              "Your subscription has been activated successfully."}
            {(status === "failed" || status === "void") &&
              "We couldn't process your payment. Please try again."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground bg-muted/30 py-2 px-3 rounded-md border">
            Order ID:{" "}
            <span className="font-mono text-foreground">{orderId}</span>
          </p>
        </CardContent>
        <CardFooter className="flex-col gap-3 pb-8">
          {status === "paid" && (
            <Button
              className="w-full"
              onClick={() => router.push("/dashboard")}
            >
              Go to Dashboard
            </Button>
          )}
          {(status === "failed" || status === "void") && (
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/billing")}
              >
                View Plans
              </Button>
              <Button className="flex-1" onClick={handleRetryPayment}>
                <RefreshCcw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          )}
          {(status === "loading" || status === "pending") && (
            <Button variant="outline" className="w-full" disabled>
              Processing...
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
