import type { Metadata } from "next";
import { CoachDashboard } from "@/components/coach/coach-dashboard";

export const metadata: Metadata = {
  title: "Skill Coach · Zaprill",
  description:
    "Learning programs, an AI tutor, graded practice, and mock interviews for your technical skill gaps.",
};

export default function CoachPage() {
  return <CoachDashboard />;
}
