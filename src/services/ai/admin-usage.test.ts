import assert from "node:assert/strict";
import test from "node:test";
import {
  actionLabel,
  failureRate,
  formatFailurePercent,
  shapeActionStats,
  shapeErrorStats,
} from "@/services/ai/admin-usage";

test("action labels name coach and resume features", () => {
  assert.equal(actionLabel("resume_chat"), "Resume chat");
  assert.equal(actionLabel("coach_tutor"), "Coach tutor");
  assert.equal(actionLabel("coach_live"), "Coach live");
  assert.equal(actionLabel("custom_action"), "custom_action");
});

test("failure rate is zero when the window is empty", () => {
  assert.equal(failureRate(0, 0), 0);
  assert.equal(failureRate(3, 1), 0.25);
  assert.equal(formatFailurePercent(0.25), "25.0%");
  assert.equal(formatFailurePercent(0), "0.0%");
});

test("shapers drop user ids, metadata, and prompts", () => {
  const actions = shapeActionStats([
    {
      action: "coach_live",
      calls: "4",
      tokens: "100",
      cost: "0.096",
      success_count: "3",
      failure_count: "1",
      user_id: "user_secret",
    },
  ]);
  assert.deepEqual(actions, [
    {
      action: "coach_live",
      label: "Coach live",
      calls: 4,
      tokens: 100,
      costUsd: 0.096,
      successCount: 3,
      failureCount: 1,
    },
  ]);
  const errors = shapeErrorStats([
    {
      action: "coach_tutor",
      model: "gpt-5-mini",
      error_code: "EMPTY_REPLY",
      latency_ms: 40,
      created_at: "2026-10-28T00:00:00.000Z",
      user_id: "user_secret",
      metadata: { prompt: "Explain hooks" },
    },
  ]);
  const encoded = JSON.stringify(errors);
  assert.equal(encoded.includes("user_secret"), false);
  assert.equal(encoded.includes("Explain hooks"), false);
  assert.equal(errors[0]?.errorCode, "EMPTY_REPLY");
  assert.equal(errors[0]?.label, "Coach tutor");
});
