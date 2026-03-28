"use client";

import type { SkillCategory } from "@/types";

interface SkillBadgeProps {
  skill: string;
  category?: SkillCategory;
  variant?: "matched" | "missing" | "neutral" | "auto";
  size?: "sm" | "md";
}

const CATEGORY_COLORS: Record<SkillCategory, string> = {
  language: "badge-primary",
  framework: "badge-cyan",
  database: "badge-warning",
  cloud: "badge-danger",
  tool: "badge-neutral",
  soft: "badge-neutral",
  other: "badge-neutral",
};

const VARIANT_COLORS = {
  matched: "badge-success",
  missing: "badge-danger",
  neutral: "badge-neutral",
};

export default function SkillBadge({
  skill,
  category,
  variant = "auto",
  size = "md",
}: SkillBadgeProps) {
  const cls =
    variant === "auto" && category
      ? CATEGORY_COLORS[category]
      : variant !== "auto"
        ? VARIANT_COLORS[variant]
        : "badge-neutral";

  const padding = size === "sm" ? "3px 8px" : "4px 10px";
  const fontSize = size === "sm" ? "11px" : "12px";

  return (
    <span
      className={`badge ${cls}`}
      style={{ padding, fontSize, textTransform: "capitalize" }}
      title={category ? `Category: ${category}` : undefined}
    >
      {skill}
    </span>
  );
}
