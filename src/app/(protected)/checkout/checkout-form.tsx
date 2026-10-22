"use client";

import { AlertCircle, CheckCircle2, Loader2, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/billing-utils";

type Plan = {
  id: string;
  name: string;
  amount: string;
  billingCycle: string;
  isGstEnabled: boolean;
  gstPercentage: string | null;
};

type Coupon = {
  id: string;
  code: string;
  type: string;
  value: string;
};

export default function CheckoutForm({
  plan: initialPlan,
  availablePlans = [],
  availableCoupons = [],
}: {
  plan: Plan;
  availablePlans?: Plan[];
  availableCoupons?: Coupon[];
}) {
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState<Plan>(initialPlan);
  const [couponCode, setCouponCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const planAmount = parseFloat(currentPlan.amount);
  const taxRate = currentPlan.isGstEnabled
    ? parseFloat(currentPlan.gstPercentage ?? "18") / 100
    : 0;
  const taxableAmount = Math.max(0, planAmount - discount);
  const taxAmount = taxableAmount * taxRate;
  const totalAmount = taxableAmount + taxAmount;

  const handleApplyCoupon = async (codeToApply = couponCode) => {
    if (!codeToApply.trim()) return;
    setCouponCode(codeToApply.toUpperCase());
    setIsValidating(true);
    setCouponError(null);

    try {
      const res = await fetch("/api/billing/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: codeToApply.toUpperCase(),
          planId: currentPlan.id,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setCouponError(data.error || "Invalid coupon code");
        setDiscount(0);
        setAppliedCoupon(null);
      } else {
        setDiscount(data.discountAmount);
        setAppliedCoupon(codeToApply.toUpperCase());
        setCouponError(null);
        toast.success("Coupon applied successfully!");
      }
    } catch (err) {
      setCouponError("Failed to validate coupon");
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponError(null);
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      // 1. Call our checkout API to create invoice + CF order
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: currentPlan.id,
          couponCode: appliedCoupon || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Checkout failed");
        setIsProcessing(false);
        return;
      }

      if (data.isFree) {
        toast.success("Subscription activated!");
        router.push(`/payment/status?orderId=${data.invoiceId}`);
        return;
      }

      // 2. Initialize Cashfree Web SDK for seamless checkout
      // Cashfree script should be loaded globally, or redirect to payment link
      // Since we generated paymentSessionId, we redirect to CF checkout

      // Load SDK if not present (simplified approach — better to add in layout)
      if (!window.Cashfree) {
        toast.error(
          "Payment gateway is loading. Please try again in a moment.",
        );
        // We can just redirect them to our return URL if it's a zero amount? No, CF SDK handles it.
        const script = document.createElement("script");
        script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
        document.body.appendChild(script);
        script.onload = () => doCashfreeCheckout(data.paymentSessionId);
        return;
      }

      doCashfreeCheckout(data.paymentSessionId);
    } catch (err) {
      toast.error("An unexpected error occurred");
      setIsProcessing(false);
    }
  };

  const doCashfreeCheckout = (paymentSessionId: string) => {
    const environment =
      process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT === "PRODUCTION"
        ? "production"
        : "sandbox";
    const cf = (window as any).Cashfree({ mode: environment });
    cf.checkout({ paymentSessionId });
  };

  return (
    <div className="grid gap-8 md:grid-cols-5">
      {/* Left Column: Form / Billing Selector / Coupon */}
      <div className="space-y-6 md:col-span-3">
        {/* Billing Cycle Selector */}
        {availablePlans.length > 1 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Select Billing Cycle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <Select
                  value={currentPlan.id}
                  onValueChange={(id) => {
                    const newPlan = availablePlans.find((p) => p.id === id);
                    if (newPlan) {
                      setCurrentPlan(newPlan);
                      if (appliedCoupon) {
                        handleApplyCoupon(appliedCoupon);
                      }
                    }
                  }}
                >
                  <SelectTrigger className="h-12 w-full border-primary/20 bg-background">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold capitalize">
                        {currentPlan.billingCycle}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        ({formatCurrency(currentPlan.amount)})
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlans.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <div className="flex w-full items-center justify-between gap-8">
                          <span className="font-medium capitalize">
                            {p.billingCycle} billing
                          </span>
                          <span className="ml-auto font-mono text-muted-foreground">
                            {formatCurrency(p.amount)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="px-1 text-muted-foreground text-xs">
                  Choose the plan that best fits your career goals. Yearly plans
                  offer the best value!
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Discount Code</CardTitle>
          </CardHeader>
          <CardContent>
            {appliedCoupon ? (
              <div className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50/50 p-3">
                <div className="flex items-center text-emerald-700">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  <span className="font-semibold">{appliedCoupon}</span>
                  <span className="ml-2 text-sm">applied</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveCoupon}
                  className="h-8 px-2 text-muted-foreground"
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Tag className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter coupon code"
                      className="pl-9"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                    />
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => handleApplyCoupon()}
                    disabled={!couponCode.trim() || isValidating}
                  >
                    {isValidating && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Apply
                  </Button>
                </div>
                {couponError && (
                  <div className="mt-2 flex items-center text-destructive text-sm">
                    <AlertCircle className="mr-1 h-4 w-4" />
                    {couponError}
                  </div>
                )}
                {availableCoupons.length > 0 && (
                  <div className="mt-4 border-border/50 border-t pt-3">
                    <p className="mb-2 text-muted-foreground text-sm">
                      Available Coupons:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {availableCoupons.map((coupon) => (
                        <button
                          key={coupon.id}
                          type="button"
                          onClick={() => handleApplyCoupon(coupon.code)}
                          className="flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-medium text-emerald-700 text-xs transition-colors hover:bg-emerald-100"
                        >
                          <Tag className="mr-1 h-3 w-3" />
                          {coupon.code}
                          <span className="ml-1 opacity-75">
                            (
                            {coupon.type === "flat"
                              ? "₹" + parseFloat(coupon.value)
                              : parseFloat(coupon.value) + "%"}{" "}
                            off)
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Order Summary */}
      <div className="md:col-span-2">
        <Card className="sticky top-6">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-lg">{currentPlan.name}</p>
                <p className="font-medium text-muted-foreground text-sm capitalize">
                  {currentPlan.billingCycle} billing
                </p>
              </div>
              <p className="font-bold text-lg">{formatCurrency(planAmount)}</p>
            </div>

            {discount > 0 && (
              <div className="flex items-center justify-between text-emerald-600">
                <p className="text-sm">Discount ({appliedCoupon})</p>
                <p className="font-medium text-sm">
                  -{formatCurrency(discount)}
                </p>
              </div>
            )}

            {currentPlan.isGstEnabled && (
              <div className="flex items-center justify-between border-border/50 border-t pt-4">
                <p className="text-muted-foreground text-sm">
                  Taxes ({currentPlan.gstPercentage}% GST)
                </p>
                <p className="text-sm">{formatCurrency(taxAmount)}</p>
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-4 font-semibold text-lg">
              <p>Total</p>
              <p>{formatCurrency(totalAmount)}</p>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 pt-4">
            <Button
              className="w-full"
              size="lg"
              onClick={handleCheckout}
              disabled={isProcessing}
            >
              {isProcessing && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {totalAmount === 0 ? "Activate Free Plan" : "Proceed to Pay"}
            </Button>
          </CardFooter>
        </Card>

        <p className="mt-4 px-4 text-center text-muted-foreground text-xs">
          By proceeding, you agree to our Terms of Service and Privacy Policy.
          Payments are securely processed by Cashfree.
        </p>
      </div>
    </div>
  );
}
