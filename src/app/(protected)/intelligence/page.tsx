import type { Metadata } from "next";
import { IntelligenceDashboard } from "@/components/intelligence/intelligence-dashboard";

export const metadata: Metadata = {
  title: "Intelligence · Zaprill",
  description:
    "Career score, market for your target roles, skill gaps, and the next step.",
};

export default function IntelligencePage() {
  return <IntelligenceDashboard />;
}
