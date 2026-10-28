import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { COACH_LIMITS } from "@/services/coach/limits";
import {
  chatTurnDisposition,
  summaryDue,
  tutorSessionMigrationBody,
} from "@/services/coach/tutor-chat";

test("aborted and empty assistant turns refund", () => {
  assert.equal(
    chatTurnDisposition({ aborted: true, assistantText: "partial" }),
    "refund",
  );
  assert.equal(
    chatTurnDisposition({ aborted: false, assistantText: "  " }),
    "refund",
  );
  assert.equal(
    chatTurnDisposition({
      aborted: false,
      assistantText: "A closure keeps scope.",
    }),
    "persist",
  );
});

test("summary is due only at the history threshold", () => {
  assert.equal(summaryDue(COACH_LIMITS.summaryAfterMessages - 1), false);
  assert.equal(summaryDue(COACH_LIMITS.summaryAfterMessages), true);
  assert.equal(summaryDue(3, 3), true);
});

test("the migration body names the chat route", () => {
  assert.deepEqual(tutorSessionMigrationBody(), {
    error: "TUTOR_MOVED",
    detail: "Tutor chat moved to POST /api/coach/plans/:id/ai/chat",
  });
});

test("the chat route streams with the architect helpers and does not summarize first", () => {
  const source = readFileSync(
    new URL("../../app/api/coach/plans/[id]/ai/chat/route.ts", import.meta.url),
    "utf8",
  );
  assert.match(source, /createAgentUIStreamResponse/);
  assert.match(source, /smoothStream\(\{ chunking: "word" \}\)/);
  assert.match(source, /createSkillCoachAgent/);
  assert.match(source, /sendReasoning: true/);
  assert.match(source, /abortSignal: request\.signal/);
  assert.match(source, /compressTutorSummary/);
  assert.doesNotMatch(source, /generateText\(/);
  const streamAt = source.indexOf("createAgentUIStreamResponse");
  const summaryAt = source.indexOf("compressTutorSummary");
  assert.ok(streamAt > -1 && summaryAt > streamAt);
});
