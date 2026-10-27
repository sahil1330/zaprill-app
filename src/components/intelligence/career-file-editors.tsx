"use client";

import { Loader2, MapPin } from "lucide-react";
import type { JSX } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type {
  CareerExpectedPay,
  CareerPayFigure,
  CareerPayPeriod,
  CareerProfileView,
  CareerSegment,
} from "@/types/career-profile";

const SEGMENTS: { id: CareerSegment; label: string }[] = [
  { id: "student", label: "Student" },
  { id: "fresher", label: "Fresher" },
  { id: "professional", label: "Professional" },
];

export function CareerFileEditors({
  profile,
  onProfile,
}: {
  profile: CareerProfileView;
  onProfile: (profile: CareerProfileView) => void;
}): JSX.Element {
  const [savingSegment, setSavingSegment] = useState<CareerSegment | null>(
    null,
  );
  const payPeriod: CareerPayPeriod = profile.compensation.stipend
    ? "monthly"
    : "annual";

  const setSegment = async (segment: CareerSegment) => {
    if (profile.segment === segment) return;
    setSavingSegment(segment);
    try {
      const response = await fetch("/api/career-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segment }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        profile?: CareerProfileView;
      };
      if (!response.ok || !body.profile) {
        throw new Error("Could not update your path");
      }
      onProfile(body.profile);
    } catch {
      toast.error("Could not update your path");
    } finally {
      setSavingSegment(null);
    }
  };

  return (
    <>
      <section id="path" className="scroll-mt-24 space-y-3">
        <h2 className="font-medium text-muted-foreground text-sm">
          Career file
        </h2>
        <div className="flex flex-wrap gap-2">
          {SEGMENTS.map((segment) => {
            const selected = profile.segment === segment.id;
            return (
              <Button
                key={segment.id}
                variant={selected ? "secondary" : "outline"}
                aria-pressed={selected}
                disabled={savingSegment !== null}
                onClick={() => void setSegment(segment.id)}
              >
                {savingSegment === segment.id ? (
                  <Loader2 className="animate-spin" />
                ) : null}
                {segment.label}
              </Button>
            );
          })}
        </div>
        <p className="font-medium text-muted-foreground text-sm">
          {profile.segment == null
            ? "Choose the path that fits you right now."
            : profile.fieldSources.segment === "inferred"
              ? "Inferred from your resume. Change it if this is wrong."
              : "You set this path. Resume sync will keep it."}{" "}
          {[formatPlace(profile), formatYears(profile.yearsOfExperience)]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </section>

      <section className="grid overflow-hidden rounded-lg border border-border sm:grid-cols-2 sm:divide-x sm:divide-border">
        <PayFigure
          label={payPeriod === "monthly" ? "Current stipend" : "Current CTC"}
          amount={displayPay(profile.compensation.current, payPeriod)}
          hint={salaryHint(profile, payPeriod)}
          period={payPeriod}
        />
        <PayFigure
          label={payPeriod === "monthly" ? "Expected stipend" : "Expected CTC"}
          amount={null}
          band={expectedBand(profile.compensation.expected, payPeriod)}
          hint={
            payPeriod === "monthly"
              ? "Monthly band, saved as annual too"
              : "Annual band, INR"
          }
          period={payPeriod}
          className="border-border border-t sm:border-t-0"
        />
      </section>

      <PayEditor
        key={`${profile.updatedAt}-${payPeriod}`}
        profile={profile}
        period={payPeriod}
        onSaved={onProfile}
      />
    </>
  );
}

function PayFigure({
  label,
  amount,
  band,
  hint,
  period,
  className,
}: {
  label: string;
  amount: number | null;
  band?: string | null;
  hint: string | null;
  period: CareerPayPeriod;
  className?: string;
}) {
  return (
    <div className={cn("px-6 py-5", className)}>
      <p className="font-bold text-[11px] text-muted-foreground uppercase tracking-widest">
        {label}
      </p>
      <p className="mt-2 font-heading font-semibold text-xl tabular-nums tracking-tight">
        {band ?? formatPay(amount, period)}
      </p>
      {hint ? (
        <p className="mt-1 font-medium text-muted-foreground text-sm">{hint}</p>
      ) : null}
    </div>
  );
}

function PayEditor({
  profile,
  period,
  onSaved,
}: {
  profile: CareerProfileView;
  period: CareerPayPeriod;
  onSaved: (profile: CareerProfileView) => void;
}) {
  const [current, setCurrent] = useState(
    figureForPeriod(profile.compensation.current, period),
  );
  const [min, setMin] = useState(
    expectedForPeriod(profile.compensation.expected, period, "min"),
  );
  const [max, setMax] = useState(
    expectedForPeriod(profile.compensation.expected, period, "max"),
  );
  const [notice, setNotice] = useState(
    profile.compensation.noticePeriodDays == null
      ? ""
      : String(profile.compensation.noticePeriodDays),
  );
  const [relocate, setRelocate] = useState(profile.openToRelocate);
  const [saving, setSaving] = useState(false);
  const monthly = period === "monthly";
  const professional = profile.segment === "professional";

  const save = async () => {
    const currentAmount = parseMoney(current);
    const minAmount = parseMoney(min);
    const maxAmount = parseMoney(max);
    if (
      currentAmount === "invalid" ||
      minAmount === "invalid" ||
      maxAmount === "invalid"
    ) {
      toast.error("Enter whole rupees, or leave a field blank");
      return;
    }
    if (minAmount != null && maxAmount != null && minAmount > maxAmount) {
      toast.error("Expected minimum cannot exceed the maximum");
      return;
    }

    const body: Record<string, unknown> = {
      currentPayPeriod: period,
      currentPayInr: currentAmount,
      expectedPayPeriod: period,
      expectedMinInr: minAmount,
      expectedMaxInr: maxAmount,
    };

    if (professional) {
      const noticeDays =
        notice.trim() === "" ? null : Number.parseInt(notice, 10);
      if (
        noticeDays != null &&
        (!Number.isInteger(noticeDays) || noticeDays < 0 || noticeDays > 365)
      ) {
        toast.error("Notice period is a whole number of days, up to 365");
        return;
      }
      body.noticePeriodDays = noticeDays;
      body.openToRelocate = relocate;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/career-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        profile?: CareerProfileView;
      };
      if (!response.ok || !payload.profile) {
        throw new Error("Could not save pay");
      }
      onSaved(payload.profile);
      toast.success("Career file updated");
    } catch {
      toast.error("Could not save pay");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card
      id="pay"
      className="scroll-mt-24 rounded-lg border border-border shadow-none ring-0"
    >
      <CardHeader>
        <CardTitle className="font-medium text-sm">Pay</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-medium text-muted-foreground text-sm">
          {monthly
            ? "Students and current interns enter a monthly stipend. We also store the annual equivalent."
            : "Enter annual CTC. Expected pay is a minimum and maximum."}
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <MoneyField
            id="career-current-pay"
            label={monthly ? "Current stipend / month" : "Current CTC / year"}
            value={current}
            onChange={setCurrent}
            hint={monthly ? annualEquivalent(current) : null}
          />
          <MoneyField
            id="career-expected-min"
            label={monthly ? "Expected min / month" : "Expected min / year"}
            value={min}
            onChange={setMin}
            hint={monthly ? annualEquivalent(min) : null}
          />
          <MoneyField
            id="career-expected-max"
            label={monthly ? "Expected max / month" : "Expected max / year"}
            value={max}
            onChange={setMax}
            hint={monthly ? annualEquivalent(max) : null}
          />
        </div>
        {professional ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5" htmlFor="career-notice-days">
              <span className="font-medium text-muted-foreground text-xs uppercase tracking-widest">
                Notice period (days)
              </span>
              <Input
                id="career-notice-days"
                inputMode="numeric"
                value={notice}
                placeholder="Optional"
                onChange={(event) => setNotice(event.target.value)}
              />
            </label>
            <label className="flex items-center gap-2 pt-6 font-medium text-sm">
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={relocate}
                onChange={(event) => setRelocate(event.target.checked)}
              />
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Open to relocate
            </label>
          </div>
        ) : null}
        <Button variant="outline" onClick={() => void save()} disabled={saving}>
          {saving ? <Loader2 className="animate-spin" /> : null}
          Save pay
        </Button>
      </CardContent>
    </Card>
  );
}

function MoneyField({
  id,
  label,
  value,
  onChange,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint: string | null;
}) {
  return (
    <label className="space-y-1.5" htmlFor={id}>
      <span className="font-medium text-muted-foreground text-xs uppercase tracking-widest">
        {label}
      </span>
      <Input
        id={id}
        inputMode="numeric"
        value={value}
        placeholder="Not set"
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? (
        <span className="block font-medium text-muted-foreground text-xs">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

function formatPay(amount: number | null, period: CareerPayPeriod): string {
  if (amount == null) return "Not set";
  if (period === "monthly") {
    return `₹${amount.toLocaleString("en-IN")}/mo`;
  }
  return formatAnnualInr(amount);
}

function formatAnnualInr(amount: number | null): string {
  if (amount == null) return "Not set";
  if (amount >= 10_000_000) {
    const crore = amount / 10_000_000;
    const text = crore % 1 === 0 ? crore.toFixed(0) : crore.toFixed(1);
    return `₹${text} Cr`;
  }
  if (amount >= 100_000) {
    const lakh = amount / 100_000;
    const text = lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1);
    return `₹${text} LPA`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatPlace(profile: CareerProfileView): string | null {
  const country =
    profile.location.countryCode === "IN"
      ? "India"
      : profile.location.countryCode;
  const parts = [
    profile.location.city,
    profile.location.region,
    country,
  ].filter((part): part is string => Boolean(part));
  if (parts.length === 0) return null;
  if (parts.length === 1 && parts[0] === "India" && !profile.location.city) {
    return null;
  }
  return parts.join(", ");
}

function formatYears(years: number | null): string | null {
  if (years == null) return null;
  if (years === 1) return "1 year";
  return `${years} years`;
}

function salaryHint(
  profile: CareerProfileView,
  period: CareerPayPeriod,
): string | null {
  const unit = period === "monthly" ? "monthly INR" : "annual INR";
  if (profile.compensation.current.annualInr == null) return unit;
  if (profile.fieldSources.currentSalaryInr === "self_reported") {
    return `You set this · ${unit}`;
  }
  if (profile.fieldSources.currentSalaryInr === "legacy_profile") {
    return `From your saved profile · ${unit}`;
  }
  return unit;
}

function displayPay(
  figure: CareerPayFigure,
  period: CareerPayPeriod,
): number | null {
  if (figure.period === period) return figure.amountInr;
  if (figure.annualInr == null) return null;
  return period === "monthly"
    ? Math.round(figure.annualInr / 12)
    : figure.annualInr;
}

function expectedBand(
  expected: CareerExpectedPay,
  period: CareerPayPeriod,
): string | null {
  const min = displayExpected(expected, period, "min");
  const max = displayExpected(expected, period, "max");
  if (min == null && max == null) return "Not set";
  if (min != null && max != null) {
    return `${formatPay(min, period)} – ${formatPay(max, period)}`;
  }
  return formatPay(min ?? max, period);
}

function displayExpected(
  expected: CareerExpectedPay,
  period: CareerPayPeriod,
  edge: "min" | "max",
): number | null {
  const entered = edge === "min" ? expected.minInr : expected.maxInr;
  const annual = edge === "min" ? expected.minAnnualInr : expected.maxAnnualInr;
  if (expected.period === period) return entered;
  if (annual == null) return null;
  return period === "monthly" ? Math.round(annual / 12) : annual;
}

function figureForPeriod(
  figure: CareerPayFigure,
  period: CareerPayPeriod,
): string {
  const amount = displayPay(figure, period);
  return amount == null ? "" : String(amount);
}

function expectedForPeriod(
  expected: CareerExpectedPay,
  period: CareerPayPeriod,
  edge: "min" | "max",
): string {
  const amount = displayExpected(expected, period, edge);
  return amount == null ? "" : String(amount);
}

function parseMoney(value: string): number | null | "invalid" {
  const trimmed = value.trim().replace(/,/g, "");
  if (!trimmed) return null;
  if (!/^\d+$/.test(trimmed)) return "invalid";
  const amount = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(amount) || amount > 100_000_000) return "invalid";
  return amount;
}

function annualEquivalent(value: string): string | null {
  const amount = parseMoney(value);
  if (amount == null || amount === "invalid") return null;
  return `${formatAnnualInr(amount * 12)} a year`;
}
