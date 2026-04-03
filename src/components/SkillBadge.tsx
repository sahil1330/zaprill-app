"use client";

import { Badge } from "@/components/ui/badge";

interface SkillBadgeProps {
  skill: string;
  variant?: "default" | "matched" | "missing" | "neutral";
  size?: "sm" | "md";
}

export default function SkillBadge({
  skill,
  variant = "default",
  size = "md",
}: SkillBadgeProps) {
  let vClass = "bg-muted text-foreground border-border";
  switch (variant) {
    case "matched":
      vClass = "bg-primary text-primary-foreground border-transparent";
      break;
    case "missing":
      vClass = "bg-muted text-muted-foreground border-border border-dashed";
      break;
    case "neutral":
    default:
      vClass = "bg-muted text-foreground border-border";
      break;
  }

  const sClass = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <Badge
      variant="outline"
      className={`rounded text-center font-medium shadow-none ${vClass} ${sClass}`}
    >
      {skill}
    </Badge>
  );
}
