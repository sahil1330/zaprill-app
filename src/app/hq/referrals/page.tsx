"use client";

import {
  Award,
  CheckCircle,
  Clock,
  Flag,
  Loader2,
  Plus,
  RefreshCw,
  Settings,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// ─────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────

interface AdminSummary {
  total: number;
  converted: number;
  pending: number;
  expired: number;
  fraudulent: number;
  conversionRate: number;
  pendingCommissions: number;
}

interface ReferralSettings {
  referral_enabled: boolean;
  referral_referrer_reward_pct: number;
  referral_referee_reward_pct: number;
  referral_expiry_days: number;
  referral_max_per_user: number | null;
}

interface ReferralRow {
  referral: {
    id: string;
    referrerUserId: string;
    referredUserId: string | null;
    referralCode: string;
    type: string;
    status: string;
    referredEmail: string | null;
    convertedAt: string | null;
    createdAt: string;
  };
  referrerName: string | null;
  referrerEmail: string | null;
}

// ─────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    signed_up: { label: "Pending", cls: "badge badge--warning" },
    converted: { label: "Converted", cls: "badge badge--success" },
    expired: { label: "Expired", cls: "badge badge--muted" },
    fraudulent: { label: "Fraud", cls: "badge badge--danger" },
  };
  const { label, cls } = map[status] ?? {
    label: status,
    cls: "badge badge--muted",
  };
  return <span className={cls}>{label}</span>;
}

function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────

function SummaryCards({ summary }: { summary: AdminSummary }) {
  return (
    <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <div className="flex flex-col rounded-xl border bg-card p-4 shadow-sm">
        <div className="mb-2 flex items-center gap-2 text-muted-foreground">
          <Users size={16} />
          <span className="font-medium text-xs uppercase tracking-wider">
            Total Referrals
          </span>
        </div>
        <div className="font-bold text-2xl">{summary.total}</div>
      </div>
      <div className="flex flex-col rounded-xl border border-emerald-500/20 bg-card bg-emerald-500/5 p-4 shadow-sm">
        <div className="mb-2 flex items-center gap-2 text-emerald-600">
          <CheckCircle size={16} />
          <span className="font-medium text-xs uppercase tracking-wider">
            Converted
          </span>
        </div>
        <div className="font-bold text-2xl text-emerald-700">
          {summary.converted}
        </div>
      </div>
      <div className="flex flex-col rounded-xl border bg-card p-4 shadow-sm">
        <div className="mb-2 flex items-center gap-2 text-muted-foreground">
          <TrendingUp size={16} />
          <span className="font-medium text-xs uppercase tracking-wider">
            Conversion Rate
          </span>
        </div>
        <div className="font-bold text-2xl">{summary.conversionRate}%</div>
      </div>
      <div className="flex flex-col rounded-xl border bg-card p-4 shadow-sm">
        <div className="mb-2 flex items-center gap-2 text-muted-foreground">
          <Clock size={16} />
          <span className="font-medium text-xs uppercase tracking-wider">
            Pending
          </span>
        </div>
        <div className="font-bold text-2xl">{summary.pending}</div>
      </div>
      <div className="flex flex-col rounded-xl border border-amber-500/20 bg-amber-500/5 bg-card p-4 shadow-sm">
        <div className="mb-2 flex items-center gap-2 text-amber-600">
          <Wallet size={16} />
          <span className="font-medium text-xs uppercase tracking-wider">
            Pending Comm.
          </span>
        </div>
        <div className="font-bold text-2xl text-amber-700">
          ₹{summary.pendingCommissions.toLocaleString("en-IN")}
        </div>
      </div>
    </div>
  );
}

export default function ReferralsPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [settings, setSettings] = useState<ReferralSettings | null>(null);
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState<ReferralSettings | null>(
    null,
  );

  const [showInfluencerForm, setShowInfluencerForm] = useState(false);
  const [influencerForm, setInfluencerForm] = useState({
    userId: "",
    commissionType: "flat" as "flat" | "per_user" | "percentage",
    commissionValue: "",
    customCode: "",
    refereePct: "",
  });
  const [submittingInfluencer, setSubmittingInfluencer] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (typeFilter) params.set("type", typeFilter);

      const res = await fetch(`/api/admin/referrals?${params}`);
      if (!res.ok) throw new Error("Failed to load referrals");
      const json = await res.json();
      setSummary(json.summary);
      setSettings(json.settings);
      setSettingsForm(json.settings);
      setReferrals(json.referrals ?? []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function saveSettings() {
    if (!settingsForm) return;
    setSavingSettings(true);
    try {
      const keys = [
        {
          key: "referral_enabled",
          value: String(settingsForm.referral_enabled),
        },
        {
          key: "referral_referrer_reward_pct",
          value: String(settingsForm.referral_referrer_reward_pct),
        },
        {
          key: "referral_referee_reward_pct",
          value: String(settingsForm.referral_referee_reward_pct),
        },
        {
          key: "referral_expiry_days",
          value: String(settingsForm.referral_expiry_days),
        },
        {
          key: "referral_max_per_user",
          value:
            settingsForm.referral_max_per_user != null
              ? String(settingsForm.referral_max_per_user)
              : "",
        },
      ];

      for (const { key, value } of keys) {
        await fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _action: "update_setting", key, value }),
        });
      }

      setSettings(settingsForm);
      toast.success("Referral settings saved");
    } catch (e: any) {
      toast.error(e.message || "Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  }

  async function createInfluencerCode() {
    const { userId, commissionType, commissionValue, customCode, refereePct } =
      influencerForm;
    if (!userId || !commissionValue) {
      toast.error("User ID and commission value are required");
      return;
    }
    setSubmittingInfluencer(true);
    try {
      const res = await fetch("/api/admin/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _action: "create_influencer_code",
          userId,
          commissionType,
          commissionValue: parseFloat(commissionValue),
          customCode: customCode || undefined,
          refereePct: refereePct ? parseFloat(refereePct) : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      toast.success(`Influencer code created: ${json.code}`);
      setShowInfluencerForm(false);
      setInfluencerForm({
        userId: "",
        commissionType: "flat",
        commissionValue: "",
        customCode: "",
        refereePct: "",
      });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmittingInfluencer(false);
    }
  }

  async function flagFraud(referralId: string) {
    if (!confirm("Flag this referral as fraudulent? This cannot be undone."))
      return;
    await fetch("/api/admin/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _action: "flag_fraudulent", referralId }),
    });
    toast.success("Flagged as fraudulent");
    fetchData();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Referrals</h1>
        <p className="text-muted-foreground">
          Manage referral program, influencer codes and commissions.
        </p>
      </div>

      {summary && <SummaryCards summary={summary} />}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Settings Panel */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-2 font-semibold">
            <Settings size={18} className="text-primary" />
            <span>Program Configuration</span>
          </div>

          {settingsForm && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                <div className="space-y-0.5">
                  <div className="font-medium text-sm">Program Enabled</div>
                  <div className="text-muted-foreground text-xs">
                    Allow users to generate referral codes
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={settingsForm.referral_enabled}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      referral_enabled: e.target.checked,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="hq-referral-referrer-reward"
                    className="font-medium text-muted-foreground text-xs uppercase"
                  >
                    Referrer Reward %
                  </label>
                  <input
                    id="hq-referral-referrer-reward"
                    type="number"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={settingsForm.referral_referrer_reward_pct}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        referral_referrer_reward_pct: parseFloat(
                          e.target.value,
                        ),
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="hq-referral-referee-reward"
                    className="font-medium text-muted-foreground text-xs uppercase"
                  >
                    Referee Reward %
                  </label>
                  <input
                    id="hq-referral-referee-reward"
                    type="number"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={settingsForm.referral_referee_reward_pct}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        referral_referee_reward_pct: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="hq-referral-expiry-days"
                    className="font-medium text-muted-foreground text-xs uppercase"
                  >
                    Expiry (Days)
                  </label>
                  <input
                    id="hq-referral-expiry-days"
                    type="number"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={settingsForm.referral_expiry_days}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        referral_expiry_days: parseInt(e.target.value, 10),
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="hq-referral-max-per-user"
                    className="font-medium text-muted-foreground text-xs uppercase"
                  >
                    Max Referrals / User
                  </label>
                  <input
                    id="hq-referral-max-per-user"
                    type="number"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    placeholder="Unlimited"
                    value={settingsForm.referral_max_per_user ?? ""}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        referral_max_per_user: e.target.value
                          ? parseInt(e.target.value, 10)
                          : null,
                      })
                    }
                  />
                </div>
              </div>

              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm shadow hover:bg-primary/90 disabled:opacity-50"
                onClick={saveSettings}
                disabled={savingSettings}
              >
                {savingSettings && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                Save Configuration
              </button>
            </div>
          )}
        </div>

        {/* Influencer Code Creator */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold">
              <Award size={18} className="text-primary" />
              <span>Influencer Codes</span>
            </div>
            {!showInfluencerForm && (
              <button
                type="button"
                className="flex items-center gap-1 font-medium text-primary text-xs hover:underline"
                onClick={() => setShowInfluencerForm(true)}
              >
                <Plus size={14} /> Create New
              </button>
            )}
          </div>

          {showInfluencerForm ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="hq-influencer-user-id"
                    className="font-medium text-muted-foreground text-xs uppercase"
                  >
                    User ID
                  </label>
                  <input
                    id="hq-influencer-user-id"
                    type="text"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    placeholder="user_xxxx"
                    value={influencerForm.userId}
                    onChange={(e) =>
                      setInfluencerForm({
                        ...influencerForm,
                        userId: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="hq-influencer-custom-code"
                    className="font-medium text-muted-foreground text-xs uppercase"
                  >
                    Custom Code
                  </label>
                  <input
                    id="hq-influencer-custom-code"
                    type="text"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    placeholder="TECHGURU"
                    value={influencerForm.customCode}
                    onChange={(e) =>
                      setInfluencerForm({
                        ...influencerForm,
                        customCode: e.target.value.toUpperCase(),
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="hq-influencer-commission-type"
                    className="font-medium text-muted-foreground text-xs uppercase"
                  >
                    Commission Type
                  </label>
                  <select
                    id="hq-influencer-commission-type"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={influencerForm.commissionType}
                    onChange={(e) =>
                      setInfluencerForm({
                        ...influencerForm,
                        commissionType: e.target.value as any,
                      })
                    }
                  >
                    <option value="flat">Flat (₹ total)</option>
                    <option value="per_user">Per User (₹)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="hq-influencer-commission-value"
                    className="font-medium text-muted-foreground text-xs uppercase"
                  >
                    Value
                  </label>
                  <input
                    id="hq-influencer-commission-value"
                    type="number"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={influencerForm.commissionValue}
                    onChange={(e) =>
                      setInfluencerForm({
                        ...influencerForm,
                        commissionValue: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  className="flex-1 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm shadow hover:bg-primary/90"
                  onClick={createInfluencerCode}
                  disabled={submittingInfluencer}
                >
                  Create Code
                </button>
                <button
                  type="button"
                  className="rounded-md border border-input bg-transparent px-4 py-2 font-medium text-sm shadow-sm hover:bg-accent"
                  onClick={() => setShowInfluencerForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 py-8 text-center">
              <Award size={32} className="mb-2 text-muted-foreground/30" />
              <p className="text-muted-foreground text-sm">
                No active influencers being tracked here.
                <br />
                Create a code to get started.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Referrals Table */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b p-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 font-semibold">
            <Users size={18} className="text-primary" />
            <span>Activity Log</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="h-8 rounded-md border bg-transparent px-2 py-1 text-xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="signed_up">Pending</option>
              <option value="converted">Converted</option>
              <option value="expired">Expired</option>
              <option value="fraudulent">Fraudulent</option>
            </select>
            <button
              type="button"
              className="rounded-md border p-1.5 hover:bg-accent"
              onClick={fetchData}
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
                  Referrer
                </th>
                <th className="px-6 py-3 text-left font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
                  Referred
                </th>
                <th className="px-6 py-3 text-left font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    <Loader2 size={24} className="mx-auto mb-2 animate-spin" />
                    Loading referrals...
                  </td>
                </tr>
              ) : referrals.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    No referrals found matching the filters.
                  </td>
                </tr>
              ) : (
                referrals.map(({ referral, referrerName, referrerEmail }) => (
                  <tr
                    key={referral.id}
                    className="transition-colors hover:bg-muted/5"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium">{referrerName ?? "—"}</div>
                      <div className="text-muted-foreground text-xs">
                        {referrerEmail ?? "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                        {referral.referralCode}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {referral.referredEmail ?? "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 font-medium text-[10px] text-blue-700 capitalize">
                        {referral.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium text-[10px] ${
                          referral.status === "converted"
                            ? "bg-emerald-100 text-emerald-700"
                            : referral.status === "fraudulent"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {referral.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      {fmt(referral.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {referral.status !== "fraudulent" && (
                        <button
                          type="button"
                          className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"
                          onClick={() => flagFraud(referral.id)}
                          title="Flag Fraud"
                        >
                          <Flag size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
