import type { Metadata } from "next";
import { IntelligenceRedirect } from "@/components/intelligence/intelligence-redirect";

export const metadata: Metadata = {
  title: "Home · Zaprill",
  description:
    "Career score, market for your target roles, skill gaps, and the next step.",
};

export default function IntelligencePage() {
  return <IntelligenceRedirect />;
}
