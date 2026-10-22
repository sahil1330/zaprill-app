"use client";

import {
  Check,
  Copy,
  ExternalLink,
  Gift,
  Loader2,
  Share2,
  TrendingUp,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ReferralData {
  referralCode: string | null;
  referralLink: string | null;
  totalReferrals: number;
  converted: number;
  pending: number;
  expired: number;
  totalRewards: number;
}

const HOW_IT_WORKS_STEP_IDS = [
  "share-link",
  "sign-up",
  "subscribe",
  "apply-coupon",
] as const;

const HOW_IT_WORKS_STEPS = [
  "Share your referral link with friends",
  "They sign up using your link",
  "When they subscribe, you both earn a discount coupon",
  "Apply your coupon automatically at your next renewal",
] as const;

export function ReferralPanel() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchReferralData = useCallback(async () => {
    try {
      const res = await fetch("/api/referrals");
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferralData();
  }, [fetchReferralData]);

  async function generateCode() {
    setGenerating(true);
    try {
      const res = await fetch("/api/referrals", { method: "POST" });
      if (res.ok) {
        const body = await res.json();
        setData((prev) =>
          prev
            ? {
                ...prev,
                referralCode: body.referralCode,
                referralLink: body.referralLink,
              }
            : null,
        );
      }
    } finally {
      setGenerating(false);
    }
  }

  async function copyLink() {
    if (!data?.referralLink) return;
    await navigator.clipboard.writeText(data.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareLink() {
    if (!data?.referralLink) return;
    if (navigator.share) {
      void navigator.share({
        title: "Join Zaprill",
        text: "I've been using Zaprill to turbocharge my job search. Use my link for a discount!",
        url: data.referralLink,
      });
    } else {
      void copyLink();
    }
  }

  const conversionRate =
    data && data.totalReferrals > 0
      ? Math.round((data.converted / data.totalReferrals) * 100)
      : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Gift size={16} className="text-primary" />
          </div>
          <div>
            <CardTitle>Refer &amp; Earn</CardTitle>
            <CardDescription>
              Share your link — earn discount coupons when friends subscribe
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Referral link box */}
            {data?.referralLink ? (
              <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                  Your Referral Link
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate rounded-md border border-border bg-background px-3 py-2 font-mono text-sm">
                    {data.referralLink}
                  </code>
                  <Button
                    id="referral-copy-btn"
                    variant="outline"
                    size="sm"
                    onClick={copyLink}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check size={14} className="text-green-500" />
                    ) : (
                      <Copy size={14} />
                    )}
                    <span className="ml-1.5 hidden sm:inline">
                      {copied ? "Copied!" : "Copy"}
                    </span>
                  </Button>
                  <Button
                    id="referral-share-btn"
                    variant="outline"
                    size="sm"
                    onClick={shareLink}
                    className="shrink-0"
                  >
                    <Share2 size={14} />
                    <span className="ml-1.5 hidden sm:inline">Share</span>
                  </Button>
                </div>
                <p className="text-muted-foreground text-xs">
                  Code:{" "}
                  <Badge variant="secondary" className="font-mono text-xs">
                    {data.referralCode}
                  </Badge>
                </p>
              </div>
            ) : (
              <div className="space-y-3 rounded-lg border border-border border-dashed bg-muted/20 p-6 text-center">
                <p className="text-muted-foreground text-sm">
                  You don&apos;t have a referral code yet. Generate one to start
                  earning rewards.
                </p>
                <Button
                  id="referral-generate-btn"
                  onClick={generateCode}
                  disabled={generating}
                >
                  {generating ? (
                    <Loader2 size={14} className="mr-2 animate-spin" />
                  ) : (
                    <Gift size={14} className="mr-2" />
                  )}
                  Generate My Referral Link
                </Button>
              </div>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                <Users
                  size={16}
                  className="mx-auto mb-1 text-muted-foreground"
                />
                <div className="font-bold text-2xl">
                  {data?.totalReferrals ?? 0}
                </div>
                <div className="mt-0.5 text-muted-foreground text-xs">
                  Total Referrals
                </div>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50/50 p-3 text-center dark:border-green-800 dark:bg-green-950/20">
                <TrendingUp
                  size={16}
                  className="mx-auto mb-1 text-green-600 dark:text-green-400"
                />
                <div className="font-bold text-2xl text-green-700 dark:text-green-300">
                  {data?.converted ?? 0}
                </div>
                <div className="mt-0.5 text-muted-foreground text-xs">
                  Converted
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                <Gift
                  size={16}
                  className="mx-auto mb-1 text-muted-foreground"
                />
                <div className="font-bold text-2xl">
                  {data?.totalRewards ?? 0}
                </div>
                <div className="mt-0.5 text-muted-foreground text-xs">
                  Rewards Earned
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                <ExternalLink
                  size={16}
                  className="mx-auto mb-1 text-muted-foreground"
                />
                <div className="font-bold text-2xl">
                  {data?.totalReferrals ? `${conversionRate}%` : "—"}
                </div>
                <div className="mt-0.5 text-muted-foreground text-xs">
                  Conversion Rate
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="rounded-lg border border-border bg-muted/10 p-4">
              <p className="mb-3 font-bold text-muted-foreground text-xs uppercase tracking-wider">
                How it works
              </p>
              <ol className="space-y-2">
                {HOW_IT_WORKS_STEP_IDS.map((stepId, i) => (
                  <li
                    key={stepId}
                    className="flex items-start gap-3 text-muted-foreground text-sm"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-[10px] text-primary">
                      {i + 1}
                    </span>
                    {HOW_IT_WORKS_STEPS[i]}
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
