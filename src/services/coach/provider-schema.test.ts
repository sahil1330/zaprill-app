import assert from "node:assert/strict";
import test from "node:test";
import { zodSchema } from "ai";
import { coachModelOptions } from "@/services/coach/model";
import {
  emptyToolInputSchema,
  outlineFromModel,
  outlineSchema,
} from "@/services/coach/provider-schema";

function strictObjectProblems(schema: unknown, path = "root"): string[] {
  if (!schema || typeof schema !== "object") return [];
  const node = schema as {
    type?: unknown;
    properties?: Record<string, unknown>;
    required?: unknown;
    items?: unknown;
    anyOf?: unknown;
  };
  const problems: string[] = [];
  if (node.type === "object" && node.properties) {
    const keys = Object.keys(node.properties);
    const required = Array.isArray(node.required)
      ? node.required.filter((item): item is string => typeof item === "string")
      : null;
    if (!required) {
      problems.push(`${path} is missing required`);
    } else {
      for (const key of keys) {
        if (!required.includes(key)) {
          problems.push(`${path}.${key} is not required`);
        }
      }
    }
    for (const [key, child] of Object.entries(node.properties)) {
      problems.push(...strictObjectProblems(child, `${path}.${key}`));
    }
  }
  if (node.items) {
    problems.push(...strictObjectProblems(node.items, `${path}[]`));
  }
  if (Array.isArray(node.anyOf)) {
    node.anyOf.forEach((child, index) => {
      problems.push(...strictObjectProblems(child, `${path}.anyOf[${index}]`));
    });
  }
  return problems;
}

test("outline schema lists every property in required", () => {
  const problems = strictObjectProblems(zodSchema(outlineSchema).jsonSchema);
  assert.deepEqual(problems, []);
});

test("empty tool input includes required", () => {
  const schema = emptyToolInputSchema.jsonSchema as {
    type?: string;
    required?: string[];
    properties?: Record<string, unknown>;
  };
  assert.equal(schema.type, "object");
  assert.deepEqual(schema.properties, {});
  assert.deepEqual(schema.required, []);
});

test("blank resource times are omitted from the stored outline", () => {
  const outline = outlineFromModel({
    why: "SQL shows up in backend screens.",
    estimatedTime: "2 weeks",
    modules: [
      {
        key: "selects",
        title: "Selects",
        objective: "Read rows.",
        estimatedMinutes: 40,
        resources: [
          {
            type: "documentation",
            name: "SQL notes",
            free: true,
            estimatedTime: "",
          },
        ],
      },
    ],
  });
  assert.equal(outline.modules[0]?.resources[0]?.estimatedTime, undefined);
});

test("coach model calls do not request a detailed reasoning summary", () => {
  assert.equal(coachModelOptions.openai.reasoningEffort, "low");
  assert.equal(coachModelOptions.openai.reasoningSummary, null);
});
