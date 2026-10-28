import { openai } from "@ai-sdk/openai";
import {
  type InferAgentUIMessage,
  isStepCount,
  type LanguageModelUsage,
  ToolLoopAgent,
} from "ai";
import { COACH_LIMITS } from "@/services/coach/limits";
import { coachModelOptions } from "@/services/coach/model";
import {
  buildSkillCoachInstructions,
  createSkillCoachTools,
  SKILL_COACH_TOOL_NAMES,
  type SkillCoachTurnContext,
} from "@/services/coach/skill-coach-core";

export interface SkillCoachAgentContext {
  turn: SkillCoachTurnContext;
  onUsage?: (usage: LanguageModelUsage) => void;
}

export function skillCoachAgentSettings(ctx: SkillCoachAgentContext) {
  return {
    id: "skill-coach" as const,
    modelId: COACH_LIMITS.model,
    instructions: buildSkillCoachInstructions(ctx.turn),
    stopSteps: COACH_LIMITS.maxTutorSteps,
    maxOutputTokens: COACH_LIMITS.tutorMaxOutputTokens,
    toolNames: [...SKILL_COACH_TOOL_NAMES],
    reasoningEffort: coachModelOptions.openai.reasoningEffort,
    reasoningSummary: coachModelOptions.openai.reasoningSummary,
  };
}

export function createSkillCoachAgent(ctx: SkillCoachAgentContext) {
  const settings = skillCoachAgentSettings(ctx);
  return new ToolLoopAgent({
    id: settings.id,
    model: openai(settings.modelId),
    instructions: settings.instructions,
    tools: createSkillCoachTools(ctx.turn),
    stopWhen: isStepCount(settings.stopSteps),
    maxOutputTokens: settings.maxOutputTokens,
    providerOptions: coachModelOptions,
    onEnd: ({ usage }) => {
      ctx.onUsage?.(usage);
    },
  });
}

export type SkillCoachUIMessage = InferAgentUIMessage<
  ReturnType<typeof createSkillCoachAgent>
>;
