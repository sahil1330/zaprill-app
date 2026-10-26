import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { formatCoachError } from "@/components/coach/format-coach-error";
import { TutorComposer } from "@/components/coach/tutor-composer";
import { TutorThread } from "@/components/coach/tutor-thread";

const FRIENDLY = "Something went wrong. Try again.";

test("TutorThread renders user and assistant bubbles with preserved line breaks", () => {
  const html = renderToStaticMarkup(
    <TutorThread
      messages={[
        { role: "user", content: "Explain closures" },
        { role: "assistant", content: "A closure keeps\nits scope." },
      ]}
    />,
  );

  assert.match(html, /data-slot="tutor-thread"/);
  assert.match(html, /data-role="user"[^>]*whitespace-pre-wrap/);
  assert.match(html, /data-role="assistant"[^>]*whitespace-pre-wrap/);
  assert.match(html, /data-role="user"[^>]*bg-primary/);
  assert.match(html, /data-role="assistant"[^>]*bg-muted/);
  assert.match(html, /Explain closures/);
  assert.match(html, /A closure keeps\nits scope\./);
  assert.doesNotMatch(html, /purple|violet|#7c3aed|#6d28d9/i);
});

test("TutorThread renders an empty log without bubbles", () => {
  const html = renderToStaticMarkup(<TutorThread messages={[]} />);
  assert.match(html, /data-slot="tutor-thread"/);
  assert.doesNotMatch(html, /data-role=/);
});

test("TutorComposer renders the draft and Send without speech controls", () => {
  const html = renderToStaticMarkup(
    <TutorComposer
      value="How do I practice SQL?"
      onChange={() => undefined}
      onSend={() => undefined}
      busy={false}
    />,
  );

  assert.match(html, /data-slot="tutor-composer"/);
  assert.match(html, /How do I practice SQL\?/);
  assert.match(html, /Send/);
  assert.match(html, /Ask in English, Hindi, Hinglish/);
  assert.doesNotMatch(html, /data-slot="tutor-mic"/);
  assert.doesNotMatch(html, /data-slot="tutor-speaker"/);
  assert.doesNotMatch(html, /purple|violet|#7c3aed|#6d28d9/i);
});

test("TutorComposer disables Send while busy and shows a spinner", () => {
  const html = renderToStaticMarkup(
    <TutorComposer
      value="How do I practice SQL?"
      onChange={() => undefined}
      onSend={() => undefined}
      busy
    />,
  );

  assert.match(html, /disabled/);
  assert.match(html, /animate-spin/);
});

test("TutorComposer disables Send for an empty draft", () => {
  const html = renderToStaticMarkup(
    <TutorComposer
      value="   "
      onChange={() => undefined}
      onSend={() => undefined}
      busy={false}
    />,
  );

  assert.match(html, /<button[^>]*disabled/);
});

test("TutorComposer explains why Send is disabled", () => {
  const html = renderToStaticMarkup(
    <TutorComposer
      value="hello"
      onChange={() => undefined}
      onSend={() => undefined}
      busy={false}
      disabledReason="Coaching is paused right now."
    />,
  );

  assert.match(html, /Coaching is paused right now\./);
  assert.match(html, /<button[^>]*disabled/);
  assert.match(html, /<textarea[^>]*disabled/);
});

test("TutorComposer can host mic and speaker slots without requiring them", () => {
  const html = renderToStaticMarkup(
    <TutorComposer
      value=""
      onChange={() => undefined}
      onSend={() => undefined}
      busy={false}
      micSlot={<span data-slot="tutor-mic">Mic</span>}
      speakerSlot={<span data-slot="tutor-speaker">Speaker</span>}
    />,
  );

  assert.match(html, /data-slot="tutor-mic"/);
  assert.match(html, /data-slot="tutor-speaker"/);
});

test("formatCoachError replaces a bare Coach request failed", () => {
  const formatted = formatCoachError({ error: "Coach request failed" });

  assert.equal(formatted.message, FRIENDLY);
  assert.notEqual(formatted.message, "Coach request failed");
  assert.equal(formatted.detail, "Coach request failed");
  assert.doesNotMatch(formatted.message, /Coach request failed/);
});

test("formatCoachError keeps COACH_PROVIDER detail out of the user-facing sentence", () => {
  const withDetail = formatCoachError({
    error: "Coach request failed",
    detail: "COACH_PROVIDER",
  });
  assert.equal(withDetail.message, FRIENDLY);
  assert.match(withDetail.detail ?? "", /COACH_PROVIDER/);
  assert.doesNotMatch(withDetail.message, /COACH_PROVIDER/);
  assert.doesNotMatch(withDetail.message, /Coach request failed/);

  const coded = formatCoachError({
    error: "COACH_PROVIDER",
    detail: "upstream timeout",
  });
  assert.equal(coded.message, FRIENDLY);
  assert.match(coded.detail ?? "", /COACH_PROVIDER/);
  assert.match(coded.detail ?? "", /upstream timeout/);
  assert.doesNotMatch(coded.message, /COACH_PROVIDER/);
});

test("formatCoachError turns known coach codes into readable copy", () => {
  const limit = formatCoachError({
    error: "COACH_LIMIT",
    capability: "tutor",
    upgradeTo: "pro",
  });
  assert.match(limit.message, /Limit reached/);
  assert.match(limit.message, /tutor/);
  assert.match(limit.message, /pro/);
  assert.doesNotMatch(limit.message, /COACH_LIMIT/);

  const paused = formatCoachError({ error: "COACH_DISABLED" });
  assert.equal(paused.message, "Coaching is paused right now.");
  assert.doesNotMatch(paused.message, /COACH_DISABLED/);

  assert.equal(
    formatCoachError({ error: "Plan not found" }).message,
    "Plan not found",
  );
  assert.equal(formatCoachError({}).message, FRIENDLY);
  assert.equal(formatCoachError(null).message, FRIENDLY);
});

test("formatCoachError hides a browser network failure and keeps the original for logs", () => {
  const formatted = formatCoachError({ error: "Failed to fetch" });
  assert.equal(formatted.message, FRIENDLY);
  assert.equal(formatted.detail, "Failed to fetch");
  assert.doesNotMatch(formatted.message, /Failed to fetch/);
});

test("formatCoachError stays friendly when the formatted message is passed back in", () => {
  const once = formatCoachError({
    error: "Coach request failed",
    detail: "COACH_PROVIDER",
  });
  const twice = formatCoachError({ error: once.message });
  assert.equal(twice.message, FRIENDLY);
  assert.doesNotMatch(twice.message, /Coach request failed/);
});

test("coach dashboard posts tutor turns to the plan sessions route", () => {
  const source = readFileSync(
    new URL("./coach-dashboard.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /\/api\/coach\/plans\/\$\{planIdAtSend\}\/sessions/);
  assert.match(source, /const planIdAtSend = selected\.plan\.id/);
  assert.match(source, /<TutorThread/);
  assert.match(source, /<TutorComposer/);
  assert.match(source, /formatCoachError/);
  assert.doesNotMatch(source, /Coach request failed/);
});
