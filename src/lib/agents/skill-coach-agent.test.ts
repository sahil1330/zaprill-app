import assert from "node:assert/strict";
import test from "node:test";
import {
  createSkillCoachAgent,
  skillCoachAgentSettings,
} from "@/lib/agents/skill-coach-agent";
import { COACH_LIMITS } from "@/services/coach/limits";
import { coachModelOptions } from "@/services/coach/model";
import { SKILL_COACH_TOOL_NAMES } from "@/services/coach/skill-coach-core";

const turn = {
  userId: "user_1",
  planId: "plan_1",
  skillKey: "react",
  displayName: "React",
  roleTitle: "Frontend engineer",
  segment: "fresher",
  module: { key: "hooks", title: "Hooks", objective: "Use state." },
  summary: null,
};

test("agent settings pin gpt-5-mini, the tutor step cap, and a null reasoning summary", () => {
  const settings = skillCoachAgentSettings({ turn });
  assert.equal(settings.id, "skill-coach");
  assert.equal(settings.modelId, COACH_LIMITS.model);
  assert.equal(settings.modelId, "gpt-5-mini");
  assert.equal(settings.stopSteps, COACH_LIMITS.maxTutorSteps);
  assert.equal(settings.maxOutputTokens, COACH_LIMITS.tutorMaxOutputTokens);
  assert.deepEqual(settings.toolNames, [...SKILL_COACH_TOOL_NAMES]);
  assert.equal(settings.reasoningEffort, "low");
  assert.equal(settings.reasoningSummary, null);
  assert.equal(
    settings.reasoningSummary,
    coachModelOptions.openai.reasoningSummary,
  );
  assert.match(settings.instructions, /Frontend engineer/);
});

test("createSkillCoachAgent returns the skill-coach agent", () => {
  const agent = createSkillCoachAgent({ turn });
  assert.equal(agent.id, "skill-coach");
});
