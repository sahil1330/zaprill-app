import type { Metadata } from "next";
import { CoachDashboard } from "@/components/coach/coach-dashboard";

export const metadata: Metadata = {
  title: "Skill Coach · Zaprill",
  description: "Practice the skills your target roles ask for.",
};

export default function SkillCoachPage() {
  return <CoachDashboard />;
}
