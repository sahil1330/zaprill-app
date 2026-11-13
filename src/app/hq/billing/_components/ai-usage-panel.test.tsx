import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { AiUsagePanel } from "@/app/hq/billing/_components/ai-usage-panel";

test("the panel lists cost by action and the latest failure code", () => {
  const html = renderToStaticMarkup(
    <AiUsagePanel
      actions={[
        {
          action: "coach_tutor",
          label: "Coach tutor",
          calls: 2,
          tokens: 500,
          costUsd: 0.012,
          successCount: 2,
          failureCount: 0,
        },
        {
          action: "coach_live",
          label: "Coach live",
          calls: 1,
          tokens: 200,
          costUsd: 0.096,
          successCount: 0,
          failureCount: 1,
        },
      ]}
      errors={[
        {
          action: "coach_live",
          label: "Coach live",
          model: "gpt-realtime",
          errorCode: "EMPTY_REPLY",
          latencyMs: 80,
          createdAt: "2026-10-28T00:00:00.000Z",
        },
      ]}
    />,
  );
  assert.match(html, /Cost by feature/);
  assert.match(html, /Coach tutor/);
  assert.match(html, /Coach live/);
  assert.match(html, /\$0\.0960/);
  assert.match(html, /AI failures/);
  assert.match(html, /33\.3%/);
  assert.match(html, /EMPTY_REPLY/);
  assert.doesNotMatch(html, /System Healthy/);
});

test("an empty failure list says there were none", () => {
  const html = renderToStaticMarkup(<AiUsagePanel actions={[]} errors={[]} />);
  assert.match(html, /No AI failures in this window/);
  assert.match(html, /0\.0%/);
});

test("billing renders the panel and the overview badge file is untouched by this component", () => {
  const billing = readFileSync(
    new URL("./billing-content.tsx", import.meta.url),
    "utf8",
  );
  assert.match(billing, /<AiUsagePanel/);
  assert.match(billing, /actions=\{data\?\.actions/);
  assert.match(billing, /errors=\{data\?\.aiErrors/);
});
