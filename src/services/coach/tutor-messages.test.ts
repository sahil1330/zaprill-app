import assert from "node:assert/strict";
import test from "node:test";
import type { UIMessage } from "ai";
import {
  buildAgentWindow,
  isLegacyCoachTurn,
  latestUserUIMessage,
  messagesForPersistence,
  SUMMARY_SHIM_ID,
  textFromUIMessage,
  toUIMessages,
  userTurnText,
} from "@/services/coach/tutor-messages";

const user = (id: string, text: string): UIMessage => ({
  id,
  role: "user",
  parts: [{ type: "text", text }],
});

const assistant = (id: string, text: string): UIMessage => ({
  id,
  role: "assistant",
  parts: [{ type: "text", text }],
});

test("legacy turns become one text part with a stable id", () => {
  const messages = toUIMessages([
    { role: "user", content: "Explain hooks" },
    { role: "assistant", content: "Hooks run each render." },
    { role: "system", content: "ignore" },
    { nope: true },
  ]);
  assert.equal(messages.length, 2);
  assert.equal(messages[0]?.id, "legacy-0-user");
  assert.equal(messages[0]?.role, "user");
  assert.deepEqual(messages[0]?.parts, [
    { type: "text", text: "Explain hooks" },
  ]);
  assert.equal(messages[1]?.id, "legacy-1-assistant");
  assert.equal(isLegacyCoachTurn(messages[0]), false);
});

test("UIMessage rows pass through and keep their ids", () => {
  const original = user("msg_1", "Keep me");
  const messages = toUIMessages([original, { role: "user", content: "old" }]);
  assert.equal(messages[0]?.id, "msg_1");
  assert.equal(messages[1]?.id, "legacy-1-user");
});

test("textFromUIMessage joins text parts and ignores tool parts", () => {
  const message: UIMessage = {
    id: "a",
    role: "assistant",
    parts: [
      { type: "text", text: "Hello" },
      {
        type: "tool-getProgress",
        toolCallId: "call_1",
        state: "output-available",
        input: {},
        output: { state: "in_progress" },
      },
      { type: "text", text: "world" },
    ],
  };
  assert.equal(textFromUIMessage(message), "Hello\nworld");
});

test("userTurnText rejects empty and over-long turns", () => {
  assert.equal(userTurnText(user("u", "  hi  ")), "hi");
  assert.equal(userTurnText(user("u", "   ")), null);
  assert.equal(userTurnText(user("u", "x".repeat(4001))), null);
});

test("latestUserUIMessage is the last user message only", () => {
  const messages = [
    user("u1", "first"),
    assistant("a1", "reply"),
    user("u2", "second"),
  ];
  assert.equal(latestUserUIMessage(messages)?.id, "u2");
  assert.equal(latestUserUIMessage([assistant("a1", "only")]), null);
  assert.equal(latestUserUIMessage("nope"), null);
});

test("buildAgentWindow keeps a summary shim and the last history slots", () => {
  const history = [
    user("u1", "1"),
    assistant("a1", "2"),
    user("u2", "3"),
    assistant("a2", "4"),
  ];
  const latest = user("u3", "5");
  const window = buildAgentWindow({
    history,
    summary: "Earlier facts",
    latestUser: latest,
    historyMessages: 3,
  });
  assert.equal(window[0]?.id, SUMMARY_SHIM_ID);
  assert.equal(
    textFromUIMessage(window[0] as UIMessage),
    "Earlier summary:\nEarlier facts",
  );
  assert.deepEqual(
    window.slice(1).map((message) => message.id),
    ["a2", "u3"],
  );
});

test("buildAgentWindow omits a blank summary and does not duplicate the latest user", () => {
  const latest = user("u2", "now");
  const window = buildAgentWindow({
    history: [user("u1", "old"), latest],
    summary: "  ",
    latestUser: latest,
    historyMessages: 8,
  });
  assert.deepEqual(
    window.map((message) => message.id),
    ["u1", "u2"],
  );
});

test("messagesForPersistence appends the new turn and drops the summary shim", () => {
  const stored = [
    user(SUMMARY_SHIM_ID, "Earlier summary:\nsecret"),
    user("u1", "old"),
    assistant("a1", "old reply"),
  ];
  const latest = user("u2", "new");
  const ended = [
    user(SUMMARY_SHIM_ID, "Earlier summary:\nsecret"),
    assistant("a1", "old reply"),
    latest,
    assistant("a2", "new reply"),
  ];
  const saved = messagesForPersistence({ stored, latestUser: latest, ended });
  assert.deepEqual(
    saved.map((message) => message.id),
    ["u1", "a1", "u2", "a2"],
  );
});
