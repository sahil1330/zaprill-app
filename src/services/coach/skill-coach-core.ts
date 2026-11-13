import { tool } from "ai";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import db from "@/db";
import { coachProgress, learningResources } from "@/db/schema";
import type { CoachOutline } from "@/services/coach/gaps";
import type { CoachTier } from "@/services/coach/limits";
import { type MeterHold, openCoachMeter } from "@/services/coach/meter.service";
import {
  COACH_FACT_RULES,
  COACH_LANGUAGE_RULES,
} from "@/services/coach/prompts";
import { emptyToolInputSchema } from "@/services/coach/provider-schema";

export interface SkillCoachTurnContext {
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

export type SkillCoachToolContext = SkillCoachTurnContext;

export const SKILL_COACH_TOOL_NAMES = [
  "getLearningContext",
  "listCuratedResources",
  "getProgress",
  "setModuleStatus",
] as const;

export type SkillCoachToolName = (typeof SKILL_COACH_TOOL_NAMES)[number];

const MODULE_KEY = z.object({
  moduleKey: z.string().trim().min(1).max(80),
});

const TOOL_COPY: Record<
  SkillCoachToolName,
  { description: string; parameters: Record<string, unknown> }
> = {
  getLearningContext: {
    description:
      "Read the learner's segment, target role, skill, current module, and rolling summary. No resume and no salary.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false,
      required: [],
    },
  },
  listCuratedResources: {
    description:
      "List active catalog resources for this skill. Use only these URLs. Do not invent links.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false,
      required: [],
    },
  },
  getProgress: {
    description:
      "Read progress for this plan. You cannot mark a skill verified.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false,
      required: [],
    },
  },
  setModuleStatus: {
    description:
      "Move this plan from not_started to in_progress. Cannot set demonstrated or verified.",
    parameters: {
      type: "object",
      properties: {
        moduleKey: { type: "string", minLength: 1, maxLength: 80 },
      },
      required: ["moduleKey"],
      additionalProperties: false,
    },
  },
};

export function buildSkillCoachInstructions(
  ctx: SkillCoachTurnContext,
): string {
  return `You are Zaprill Skill Coach, tutoring one technical skill for the role "${ctx.roleTitle}".
Current skill: ${ctx.displayName}.
Module: ${ctx.module?.title ?? ctx.displayName}. Objective: ${ctx.module?.objective || "Build working familiarity."}
Call getLearningContext before a long explanation. Use listCuratedResources when suggesting material. Use setModuleStatus only to mark the module in progress.
${COACH_LANGUAGE_RULES}
${COACH_FACT_RULES}`;
}

export function activeCoachModule(
  outline: CoachOutline,
  currentModuleKey: string | null | undefined,
): SkillCoachTurnContext["module"] {
  const module =
    outline.modules.find((item) => item.key === currentModuleKey) ??
    outline.modules[0];
  if (!module) return null;
  return { key: module.key, title: module.title, objective: module.objective };
}

export function skillCoachRealtimeTools(): Array<{
  type: "function";
  name: SkillCoachToolName;
  description: string;
  parameters: Record<string, unknown>;
}> {
  return SKILL_COACH_TOOL_NAMES.map((name) => ({
    type: "function" as const,
    name,
    description: TOOL_COPY[name].description,
    parameters: TOOL_COPY[name].parameters,
  }));
}

function isToolName(name: string): name is SkillCoachToolName {
  return (SKILL_COACH_TOOL_NAMES as readonly string[]).includes(name);
}

export async function executeSkillCoachTool(
  ctx: SkillCoachTurnContext,
  name: string,
  input: unknown,
): Promise<Record<string, unknown>> {
  if (!isToolName(name)) return { error: "unknown_tool" };
  try {
    if (name === "getLearningContext") {
      return {
        segment: ctx.segment,
        roleTitle: ctx.roleTitle,
        skill: ctx.displayName,
        normalizedName: ctx.skillKey,
        module: ctx.module,
        summary: ctx.summary,
      };
    }
    if (name === "listCuratedResources") {
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
    }
    if (name === "getProgress") {
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
    }
    const parsed = MODULE_KEY.safeParse(input);
    if (!parsed.success) return { updated: false, error: "invalid_input" };
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
        currentModuleKey: parsed.data.moduleKey,
        lastSessionAt: new Date(),
      })
      .where(eq(coachProgress.planId, ctx.planId));
    return { updated: true, state: "in_progress" };
  } catch {
    return { error: "tool_failed" };
  }
}

export function createSkillCoachTools(ctx: SkillCoachTurnContext) {
  return {
    getLearningContext: tool({
      description: TOOL_COPY.getLearningContext.description,
      inputSchema: emptyToolInputSchema,
      execute: async () => executeSkillCoachTool(ctx, "getLearningContext", {}),
    }),
    listCuratedResources: tool({
      description: TOOL_COPY.listCuratedResources.description,
      inputSchema: emptyToolInputSchema,
      execute: async () =>
        executeSkillCoachTool(ctx, "listCuratedResources", {}),
    }),
    getProgress: tool({
      description: TOOL_COPY.getProgress.description,
      inputSchema: emptyToolInputSchema,
      execute: async () => executeSkillCoachTool(ctx, "getProgress", {}),
    }),
    setModuleStatus: tool({
      description: TOOL_COPY.setModuleStatus.description,
      inputSchema: MODULE_KEY,
      execute: async (input) =>
        executeSkillCoachTool(ctx, "setModuleStatus", input),
    }),
  };
}

export async function openTutorMeter(input: {
  userId: string;
  tier: CoachTier;
}): Promise<MeterHold> {
  return openCoachMeter({
    userId: input.userId,
    tier: input.tier,
    quota: "tutor",
    spend: "tutor",
  });
}
