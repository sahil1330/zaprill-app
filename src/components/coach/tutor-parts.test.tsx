import assert from "node:assert/strict";
import test from "node:test";
import type { UIMessage } from "ai";
import { renderToStaticMarkup } from "react-dom/server";
import {
  COACH_TOOL_LABELS,
  TutorMessageParts,
} from "@/components/coach/tutor-parts";
import { TutorThread } from "@/components/coach/tutor-thread";

test("tool chips show pending and done labels for the four coach tools", () => {
  const message: UIMessage = {
    id: "a1",
    role: "assistant",
    parts: [
      {
        type: "tool-getProgress",
        toolCallId: "call_1",
        state: "input-available",
        input: {},
      },
      {
        type: "tool-listCuratedResources",
        toolCallId: "call_2",
        state: "output-available",
        input: {},
        output: { resources: [] },
      },
    ],
  };
  const html = renderToStaticMarkup(
    <TutorMessageParts
      message={message}
      isLastMessage={false}
      isStreaming={false}
    />,
  );
  assert.match(html, new RegExp(COACH_TOOL_LABELS.getProgress.pending));
  assert.match(html, new RegExp(COACH_TOOL_LABELS.listCuratedResources.done));
  assert.match(html, /data-slot="tutor-tool"/);
  assert.match(html, /data-tool="getProgress"/);
  assert.match(html, /data-state="pending"/);
  assert.match(html, /data-state="done"/);
});

test("reasoning collapses behind a Thought control", () => {
  const message: UIMessage = {
    id: "a1",
    role: "assistant",
    parts: [
      { type: "reasoning", text: "Check the module first." },
      { type: "text", text: "Start with state." },
    ],
  };
  const html = renderToStaticMarkup(
    <TutorMessageParts
      message={message}
      isLastMessage={false}
      isStreaming={false}
    />,
  );
  assert.match(html, /Thought/);
  assert.match(html, /Check the module first/);
  assert.match(html, /aria-expanded="false"/);
});

test("an empty thread keeps the docked placeholder", () => {
  const html = renderToStaticMarkup(<TutorThread messages={[]} />);
  assert.match(html, /The tutor replies here/);
  assert.doesNotMatch(html, /data-role=/);
});
