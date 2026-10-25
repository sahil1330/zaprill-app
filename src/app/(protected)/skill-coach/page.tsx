import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { SkillCoachPanel } from "@/components/intelligence/skill-coach-panel";

export const metadata: Metadata = {
  title: "Skill Coach · Zaprill",
  description: "Practice the skills your target roles ask for.",
};

export default function SkillCoachPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 px-6 py-10">
      <PageHeader
        eyebrow="Practice"
        title="Skill Coach"
        description="A plan for each skill your target roles ask for and your career file does not have."
      />
      <SkillCoachPanel />
    </main>
  );
}
