import { jsonSchema } from "ai";
import { z } from "zod";
import type { CoachOutline } from "@/services/coach/gaps";

/**
 * OpenAI strict structured outputs require every property to be listed in
 * `required`. Zod `.optional()` omits the key and the Responses API rejects
 * the outline with HTTP 400 before the tutor runs.
 */
export const outlineSchema = z.object({
  why: z.string().min(1).max(600),
  estimatedTime: z.string().min(1).max(80),
  modules: z
    .array(
      z.object({
        key: z.string().min(1).max(80),
        title: z.string().min(1).max(120),
        objective: z.string().min(1).max(400),
        estimatedMinutes: z.number().int().min(10).max(600),
        resources: z
          .array(
            z.object({
              type: z.enum([
                "course",
                "book",
                "tutorial",
                "documentation",
                "practice",
              ]),
              name: z.string().min(1).max(160),
              free: z.boolean(),
              estimatedTime: z.string().max(80),
            }),
          )
          .max(4),
      }),
    )
    .min(1)
    .max(4),
});

export type OutlineModelOutput = z.infer<typeof outlineSchema>;

export function outlineFromModel(output: OutlineModelOutput): CoachOutline {
  return {
    why: output.why,
    estimatedTime: output.estimatedTime,
    modules: output.modules.map((module) => ({
      key: module.key,
      title: module.title,
      objective: module.objective,
      estimatedMinutes: module.estimatedMinutes,
      resources: module.resources.map((resource) => ({
        type: resource.type,
        name: resource.name,
        free: resource.free,
        ...(resource.estimatedTime
          ? { estimatedTime: resource.estimatedTime }
          : {}),
      })),
    })),
  };
}

/** No-argument tool input. Includes `required: []`, which Zod's empty object omits. */
export const emptyToolInputSchema = jsonSchema<Record<string, never>>({
  type: "object",
  properties: {},
  additionalProperties: false,
  required: [],
});
