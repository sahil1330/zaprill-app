"use client";

import {
  Check,
  Clock,
  Copy,
  ExternalLink,
  Gift,
  Loader2,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ReferralData {
  referralCode: string | null;
  referralLink: string | null;
  totalReferrals: number;
  converted: number;
  pending: number;
  expired: number;
  totalRewards: number;
  referrals?: {
    id: string;
    referredEmail: string | null;
    status: string;
    convertedAt: string | null;
    createdAt: string;
  }[];
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "destructive";
    color: string;
  }
> = {
  signed_up: {
    label: "Pending",
    variant: "secondary",
    color: "text-amber-600 dark:text-amber-400",
  },
  converted: {
    label: "Converted ✓",
    variant: "default",
    color: "text-green-600 dark:text-green-400",
  },
  expired: {
    label: "Expired",
    variant: "outline",
    color: "text-muted-foreground",
  },
  fraudulent: {
    label: "Flagged",
    variant: "destructive",
    color: "text-destructive",
  },
};

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReferralsPage() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/referrals")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function generateCode() {
    setGenerating(true);
    try {
      const res = await fetch("/api/referrals", { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed");
      setData((prev) =>
        prev
          ? {
              ...prev,
              referralCode: body.referralCode,
              referralLink: body.referralLink,
            }
          : body,
      );
      toast.success("Referral link generated!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setGenerating(false);
    }
  }

  async function copyLink() {
    if (!data?.referralLink) return;
    await navigator.clipboard.writeText(data.referralLink);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  }

  function shareLink() {
    if (!data?.referralLink) return;
    if (navigator.share) {
      void navigator.share({
        title: "Join Zaprill — AI-powered job matching",
        text: "I've been using Zaprill to supercharge my job search. Sign up with my link for a discount on your first subscription!",
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
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      {/* ── Hero header ── */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/60">
          <Gift size={24} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="font-black text-3xl tracking-tight">
            Refer &amp; Earn
          </h1>
          <p className="mt-1 text-muted-foreground">
            Invite friends to Zaprill — when they subscribe, you both get a
            discount coupon applied automatically on renewal.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 size={32} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* ── Referral link card ── */}
          <Card className="border-emerald-200 bg-linear-to-br from-emerald-50/60 to-background dark:border-emerald-800 dark:from-emerald-950/20">
            <CardHeader>
              <CardTitle className="text-lg">Your Referral Link</CardTitle>
              <CardDescription>
                Share this link anywhere — social media, email, WhatsApp,
                wherever your network lives.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data?.referralLink ? (
                <>
                  {/* Link display */}
                  <div className="flex items-center gap-2">
                    <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
                      <code className="flex-1 truncate font-mono text-sm">
                        {data.referralLink}
                      </code>
                      <Badge
                        variant="secondary"
                        className="shrink-0 font-mono text-xs"
                      >
                        {data.referralCode}
                      </Badge>
                    </div>
                    <Button
                      id="ref-copy-btn"
                      variant={copied ? "default" : "outline"}
                      className={
                        copied
                          ? "border-0 bg-green-600 text-white hover:bg-green-700"
                          : ""
                      }
                      onClick={copyLink}
                    >
                      {copied ? <Check size={15} /> : <Copy size={15} />}
                      <span className="ml-2 hidden sm:inline">
                        {copied ? "Copied!" : "Copy"}
                      </span>
                    </Button>
                    <Button
                      id="ref-share-btn"
                      variant="outline"
                      onClick={shareLink}
                    >
                      <Share2 size={15} />
                      <span className="ml-2 hidden sm:inline">Share</span>
                    </Button>
                  </div>

                  {/* Quick share buttons */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Supercharge your job search with AI! Sign up to Zaprill using my link and get a discount: ${data.referralLink}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-black px-3 py-1.5 font-bold text-white text-xs transition-colors hover:bg-neutral-800"
                    >
                      <ExternalLink size={11} /> Share on X
                    </a>
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.referralLink)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#0077b5] px-3 py-1.5 font-bold text-white text-xs transition-colors hover:bg-[#006097]"
                    >
                      <ExternalLink size={11} /> Share on LinkedIn
                    </a>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`Hey! I've been using Zaprill to find jobs with AI. Use my link for a discount: ${data.referralLink}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 font-bold text-white text-xs transition-colors hover:bg-[#1da851]"
                    >
                      <ExternalLink size={11} /> WhatsApp
                    </a>
                  </div>
                </>
              ) : (
                <div className="space-y-4 py-6 text-center">
                  <p className="text-muted-foreground text-sm">
                    Generate your unique referral link to start earning rewards.
                  </p>
                  <Button
                    id="ref-generate-btn"
                    size="lg"
                    onClick={generateCode}
                    disabled={generating}
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    {generating ? (
                      <Loader2 size={16} className="mr-2 animate-spin" />
                    ) : (
                      <Sparkles size={16} className="mr-2" />
                    )}
                    Generate My Referral Link
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Stats grid ── */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              {
                icon: <Users size={18} className="text-muted-foreground" />,
                value: data?.totalReferrals ?? 0,
                label: "Referrals Sent",
              },
              {
                icon: <TrendingUp size={18} className="text-emerald-500" />,
                value: data?.converted ?? 0,
                label: "Converted",
                highlight: true,
              },
              {
                icon: <Gift size={18} className="text-primary" />,
                value: data?.totalRewards ?? 0,
                label: "Coupons Earned",
              },
              {
                icon: <Clock size={18} className="text-amber-500" />,
                value: data?.totalReferrals ? `${conversionRate}%` : "—",
                label: "Conversion Rate",
              },
            ].map((stat) => (
              <Card
                key={stat.label}
                className={
                  stat.highlight
                    ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20"
                    : ""
                }
              >
                <CardContent className="pt-5 pb-4 text-center">
                  <div className="mb-2 flex justify-center">{stat.icon}</div>
                  <div className="font-black text-3xl">{stat.value}</div>
                  <div className="mt-1 font-medium text-muted-foreground text-xs">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ── Referrals history table ── */}
          {data?.referrals && data.referrals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Referral History</CardTitle>
                <CardDescription>
                  Track the status of everyone you&apos;ve referred.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-border border-b">
                        <th className="px-2 py-2.5 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-2 py-2.5 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-2 py-2.5 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                          Converted
                        </th>
                        <th className="px-2 py-2.5 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                          Referred On
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {data.referrals.map((ref) => {
                        const cfg = STATUS_CONFIG[ref.status] ?? {
                          label: ref.status,
                          variant: "secondary" as const,
                        };
                        return (
                          <tr
                            key={ref.id}
                            className="transition-colors hover:bg-muted/30"
                          >
                            <td className="px-2 py-3 font-medium">
                              {ref.referredEmail ?? (
                                <span className="text-muted-foreground italic">
                                  Unknown
                                </span>
                              )}
                            </td>
                            <td className="px-2 py-3">
                              <Badge variant={cfg.variant} className="text-xs">
                                {cfg.label}
                              </Badge>
                            </td>
                            <td className="px-2 py-3 text-muted-foreground">
                              {fmtDate(ref.convertedAt)}
                            </td>
                            <td className="px-2 py-3 text-muted-foreground">
                              {fmtDate(ref.createdAt)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── How it works ── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">How it works</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {[
                  {
                    title: "Share your link",
                    desc: "Send your unique referral link to friends, colleagues, or post it online.",
                  },
                  {
                    title: "They sign up",
                    desc: "Your friend creates a Zaprill account through your link. They see a welcome discount banner.",
                  },
                  {
                    title: "They subscribe",
                    desc: "When your friend pays for their first subscription, the referral is confirmed.",
                  },
                  {
                    title: "You both earn",
                    desc: "You get a discount coupon automatically applied to your next renewal. Your friend gets one too.",
                  },
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-black text-primary text-sm">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-sm">{step.title}</p>
                      <p className="mt-0.5 text-muted-foreground text-sm">
                        {step.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </>
      )}
    </main>
  );
}
