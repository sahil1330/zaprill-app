import assert from "node:assert/strict";
import test from "node:test";
import {
  type SkillCoachToolContext,
  createSkillCoachTools as toolsFromAgentPath,
} from "@/lib/agents/skill-coach-tools";
import {
  COACH_FACT_RULES,
  COACH_LANGUAGE_RULES,
} from "@/services/coach/prompts";
import {
  activeCoachModule,
  buildSkillCoachInstructions,
  createSkillCoachTools,
  executeSkillCoachTool,
  SKILL_COACH_TOOL_NAMES,
  type SkillCoachTurnContext,
  skillCoachRealtimeTools,
} from "@/services/coach/skill-coach-core";

const ctx: SkillCoachTurnContext = {
  userId: "user_1",
  planId: "plan_1",
  skillKey: "react",
  displayName: "React",
  roleTitle: "Frontend engineer",
  segment: "fresher",
  module: {
    key: "hooks",
    title: "Hooks",
    objective: "Use state and effect.",
  },
  summary: "Covered JSX.",
};

test("instructions keep the current tutor rules and the active module", () => {
  const text = buildSkillCoachInstructions(ctx);
  assert.match(text, /Frontend engineer/);
  assert.match(text, /Current skill: React/);
  assert.match(text, /Module: Hooks/);
  assert.match(text, /Use state and effect/);
  assert.match(text, /Call getLearningContext before a long explanation/);
  assert.ok(text.includes(COACH_LANGUAGE_RULES));
  assert.ok(text.includes(COACH_FACT_RULES));
  assert.doesNotMatch(text, /salary|resume/i);
});

test("activeCoachModule prefers the progress key and falls back to the first module", () => {
  const outline = {
    why: "Jobs ask for it.",
    estimatedTime: "2 weeks",
    modules: [
      {
        key: "jsx",
        title: "JSX",
        objective: "Markup",
        estimatedMinutes: 30,
        resources: [],
      },
      {
        key: "hooks",
        title: "Hooks",
        objective: "State",
        estimatedMinutes: 30,
        resources: [],
      },
    ],
  };
  assert.equal(activeCoachModule(outline, "hooks")?.key, "hooks");
  assert.equal(activeCoachModule(outline, "missing")?.key, "jsx");
  assert.equal(activeCoachModule(outline, null)?.key, "jsx");
  assert.equal(
    activeCoachModule({ why: "", estimatedTime: "", modules: [] }, null),
    null,
  );
});

test("realtime schemas are the four tools and setModuleStatus cannot name a status", () => {
  const tools = skillCoachRealtimeTools();
  assert.deepEqual(
    tools.map((tool) => tool.name),
    [...SKILL_COACH_TOOL_NAMES],
  );
  const status = tools.find((tool) => tool.name === "setModuleStatus");
  assert.ok(status);
  const parameters = status.parameters as {
    properties: Record<string, unknown>;
    required: string[];
  };
  assert.deepEqual(Object.keys(parameters.properties), ["moduleKey"]);
  assert.deepEqual(parameters.required, ["moduleKey"]);
  assert.match(status.description, /Cannot set demonstrated or verified/);
  const resources = tools.find((tool) => tool.name === "listCuratedResources");
  assert.match(resources?.description ?? "", /Do not invent links/);
});

test("getLearningContext returns the turn context and no salary or resume", () => {
  return executeSkillCoachTool(ctx, "getLearningContext", {}).then((result) => {
    assert.equal(result.segment, "fresher");
    assert.equal(result.roleTitle, "Frontend engineer");
    assert.equal(result.skill, "React");
    assert.equal(result.normalizedName, "react");
    assert.equal("salary" in result, false);
    assert.equal("resume" in result, false);
  });
});

test("unknown tools and empty module keys fail closed without throwing", () => {
  return Promise.all([
    executeSkillCoachTool(ctx, "web_search", {}),
    executeSkillCoachTool(ctx, "setModuleStatus", { moduleKey: "" }),
    executeSkillCoachTool(ctx, "setModuleStatus", { status: "verified" }),
  ]).then(([unknown, empty, verified]) => {
    assert.deepEqual(unknown, { error: "unknown_tool" });
    assert.deepEqual(empty, { updated: false, error: "invalid_input" });
    assert.deepEqual(verified, { updated: false, error: "invalid_input" });
  });
});

test("the agent path re-exports the core factory", () => {
  assert.equal(toolsFromAgentPath, createSkillCoachTools);
  const aliased: SkillCoachToolContext = ctx;
  assert.equal(aliased.planId, "plan_1");
  assert.deepEqual(Object.keys(createSkillCoachTools(ctx)), [
    ...SKILL_COACH_TOOL_NAMES,
  ]);
});
