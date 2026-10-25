import { tool } from "ai";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import db from "@/db";
import { coachProgress, learningResources } from "@/db/schema";

export interface SkillCoachToolContext {
  userId: string;
  planId: string;
  skillKey: string;
  displayName: string;
  roleTitle: string;
  segment: string | null;
  module: {
    key: string;
    title: string;
    objective: string;
  } | null;
  summary: string | null;
}

export function createSkillCoachTools(ctx: SkillCoachToolContext) {
  return {
    getLearningContext: tool({
      description:
        "Read the learner's segment, target role, skill, current module, and rolling summary. No resume and no salary.",
      inputSchema: z.object({}),
      execute: async () => ({
        segment: ctx.segment,
        roleTitle: ctx.roleTitle,
        skill: ctx.displayName,
        normalizedName: ctx.skillKey,
        module: ctx.module,
        summary: ctx.summary,
      }),
    }),
    listCuratedResources: tool({
      description:
        "List active catalog resources for this skill. Use only these URLs. Do not invent links.",
      inputSchema: z.object({}),
      execute: async () => {
        const rows = await db
          .select({
            name: learningResources.name,
            url: learningResources.url,
            type: learningResources.type,
            isFree: learningResources.isFree,
            estimatedTime: learningResources.estimatedTime,
          })
          .from(learningResources)
          .where(
            and(
              eq(learningResources.skill, ctx.skillKey),
              eq(learningResources.isActive, true),
            ),
          )
          .limit(8);
        return { resources: rows };
      },
    }),
    getProgress: tool({
      description:
        "Read progress for this plan. You cannot mark a skill verified.",
      inputSchema: z.object({}),
      execute: async () => {
        const [row] = await db
          .select()
          .from(coachProgress)
          .where(
            and(
              eq(coachProgress.planId, ctx.planId),
              eq(coachProgress.userId, ctx.userId),
            ),
          )
          .limit(1);
        return {
          state: row?.state ?? "not_started",
          currentModuleKey: row?.currentModuleKey ?? null,
          tasksAttempted: row?.tasksAttempted ?? 0,
          tasksPassed: row?.tasksPassed ?? 0,
          masteryScore: row?.masteryScore ?? null,
        };
      },
    }),
    setModuleStatus: tool({
      description:
        "Move this plan from not_started to in_progress. Cannot set demonstrated or verified.",
      inputSchema: z.object({
        moduleKey: z.string().trim().min(1).max(80),
      }),
      execute: async ({ moduleKey }) => {
        const [row] = await db
          .select()
          .from(coachProgress)
          .where(eq(coachProgress.planId, ctx.planId))
          .limit(1);
        if (!row || row.userId !== ctx.userId || row.state !== "not_started") {
          return { updated: false, state: row?.state ?? "not_started" };
        }
        await db
          .update(coachProgress)
          .set({
            state: "in_progress",
            currentModuleKey: moduleKey,
            lastSessionAt: new Date(),
          })
          .where(eq(coachProgress.planId, ctx.planId));
        return { updated: true, state: "in_progress" };
      },
    }),
  };
}
