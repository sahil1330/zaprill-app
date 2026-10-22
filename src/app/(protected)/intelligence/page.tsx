import type { Metadata } from "next";
import { IntelligenceDashboard } from "@/components/intelligence/intelligence-dashboard";

export const metadata: Metadata = {
  title: "Intelligence · Zaprill",
  description:
    "Your career file: segment, academics, experience, skills, target roles, and pay in INR.",
};

export default function IntelligencePage() {
  return <IntelligenceDashboard />;
}
