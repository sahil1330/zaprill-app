import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { applyLiveEvent, emptyLiveDraft } from "@/components/coach/live-events";
import {
  reduceLivePhase,
  signalFromRealtimeEvent,
} from "@/components/coach/live-phase";

test("live phase follows connect, speech, tools, and stop", () => {
  let phase = reduceLivePhase("idle", { type: "start" });
  assert.equal(phase, "connecting");
  phase = reduceLivePhase(phase, { type: "connected" });
  assert.equal(phase, "listening");
  phase = reduceLivePhase(phase, { type: "response_started" });
  assert.equal(phase, "speaking");
  phase = reduceLivePhase(phase, { type: "tool_started" });
  assert.equal(phase, "tool");
  phase = reduceLivePhase(phase, { type: "tool_finished" });
  assert.equal(phase, "listening");
  phase = reduceLivePhase(phase, { type: "fail" });
  assert.equal(phase, "error");
  phase = reduceLivePhase(phase, { type: "stop" });
  assert.equal(phase, "idle");
});

test("realtime event names map onto the phase signals", () => {
  assert.deepEqual(
    signalFromRealtimeEvent("input_audio_buffer.speech_started"),
    {
      type: "speech_started",
    },
  );
  assert.deepEqual(signalFromRealtimeEvent("response.created"), {
    type: "response_started",
  });
  assert.deepEqual(signalFromRealtimeEvent("response.done"), {
    type: "response_done",
  });
  assert.deepEqual(
    signalFromRealtimeEvent("response.function_call_arguments.done"),
    { type: "tool_started" },
  );
  assert.equal(signalFromRealtimeEvent("session.updated"), null);
});

test("a response.done with transcripts completes one exchange and resets the draft", () => {
  let step = applyLiveEvent(emptyLiveDraft(), {
    type: "conversation.item.input_audio_transcription.completed",
    transcript: "What is a hook?",
  });
  step = applyLiveEvent(step.draft, {
    type: "response.output_audio_transcript.done",
    transcript: "A hook is a function.",
  });
  step = applyLiveEvent(step.draft, {
    type: "response.function_call_arguments.done",
    call_id: "call_9",
    name: "getProgress",
    arguments: "{}",
  });
  assert.deepEqual(step.toolCall, {
    callId: "call_9",
    name: "getProgress",
    arguments: "{}",
  });
  step = applyLiveEvent(step.draft, {
    type: "response.done",
    response: {
      usage: {
        input_token_details: { text_tokens: 1, audio_tokens: 2 },
        output_token_details: { text_tokens: 3, audio_tokens: 4 },
      },
    },
  });
  assert.equal(step.exchange?.userText, "What is a hook?");
  assert.equal(step.exchange?.assistantText, "A hook is a function.");
  assert.deepEqual(step.exchange?.tools, [
    { name: "getProgress", callId: "call_9" },
  ]);
  assert.equal(step.exchange?.usage?.inputAudioTokens, 2);
  assert.equal(step.draft.userText, "");
  assert.equal(step.draft.assistantText, "");
});

test("the browser live files do not execute coach tools or render Streamdown", () => {
  const webrtc = readFileSync(
    new URL("./voice/realtime-webrtc.ts", import.meta.url),
    "utf8",
  );
  const panel = readFileSync(
    new URL("./coach-live-panel.tsx", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(webrtc, /executeSkillCoachTool|skill-coach-core|@\/db/);
  assert.doesNotMatch(panel, /streamdown|executeSkillCoachTool/);
  assert.match(panel, /Listening/);
  assert.match(panel, /Speaking/);
  assert.match(panel, /Running a tool/);
});
