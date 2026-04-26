"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthConfigTab } from "./auth-config-tab";
import { CouponsTab } from "./coupons-tab";
import { PlansTab } from "./plans-tab";

export type Plan = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  amount: string;
  currency: string;
  billingCycle: "monthly" | "quarterly" | "yearly";
  features: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type Coupon = {
  id: string;
  code: string;
  type: "percentage" | "flat";
  value: string;
  maxDiscount: string | null;
  minOrderValue: string;
  startTime: string | null;
  endTime: string | null;
  usageLimitGlobal: number | null;
  usageLimitPerUser: number;
  newUserOnly: boolean;
  status: "active" | "expired" | "disabled";
  createdAt: string;
};

export function SettingsContent() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setPlans(json.plans ?? []);
      setCoupons(json.coupons ?? []);
    } catch (e: any) {
      toast.error(e.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const mutate = useCallback(
    async (action: string, data: Record<string, any>) => {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _action: action, ...data }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      return json;
    },
    [],
  );

  return (
    <Tabs defaultValue="plans" className="w-full">
      <TabsList className="mb-6 grid w-full max-w-md grid-cols-3">
        <TabsTrigger value="plans">Plans</TabsTrigger>
        <TabsTrigger value="coupons">Coupons</TabsTrigger>
        <TabsTrigger value="auth">Auth Config</TabsTrigger>
      </TabsList>

      <TabsContent value="plans">
        <PlansTab
          plans={plans}
          loading={loading}
          onMutate={mutate}
          onRefresh={fetchData}
        />
      </TabsContent>

      <TabsContent value="coupons">
        <CouponsTab
          coupons={coupons}
          loading={loading}
          onMutate={mutate}
          onRefresh={fetchData}
        />
      </TabsContent>

      <TabsContent value="auth">
        <AuthConfigTab />
      </TabsContent>
    </Tabs>
  );
}
