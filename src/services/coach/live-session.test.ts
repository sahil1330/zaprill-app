import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { isCoachLiveEnabled } from "@/services/coach/live-flag";
import {
  COACH_LIVE_MODEL,
  estimateRealtimeCostUsd,
  functionCallOutputPayload,
  liveExchangeDisposition,
  liveTurnMeterAction,
  mintRealtimeClientSecret,
  RESPONSE_CREATE,
  readRealtimeUsage,
  redactSecrets,
} from "@/services/coach/live-session";
import { skillCoachRealtimeTools } from "@/services/coach/skill-coach-core";

test("the live flag is off unless explicitly enabled", () => {
  assert.equal(isCoachLiveEnabled({} as unknown as NodeJS.ProcessEnv), false);
  assert.equal(
    isCoachLiveEnabled({
      COACH_LIVE_ENABLED: "",
    } as unknown as NodeJS.ProcessEnv),
    false,
  );
  assert.equal(
    isCoachLiveEnabled({
      COACH_LIVE_ENABLED: "false",
    } as unknown as NodeJS.ProcessEnv),
    false,
  );
  assert.equal(
    isCoachLiveEnabled({
      COACH_LIVE_ENABLED: "0",
    } as unknown as NodeJS.ProcessEnv),
    false,
  );
  assert.equal(
    isCoachLiveEnabled({
      COACH_LIVE_ENABLED: "true",
    } as unknown as NodeJS.ProcessEnv),
    true,
  );
  assert.equal(
    isCoachLiveEnabled({
      COACH_LIVE_ENABLED: "TRUE",
    } as unknown as NodeJS.ProcessEnv),
    true,
  );
  assert.equal(
    isCoachLiveEnabled({
      COACH_LIVE_ENABLED: "yes",
    } as unknown as NodeJS.ProcessEnv),
    true,
  );
  assert.equal(
    isCoachLiveEnabled({
      COACH_LIVE_ENABLED: "1",
    } as unknown as NodeJS.ProcessEnv),
    true,
  );
});

test("realtime audio rates price a 1k/1k audio exchange at 0.096 USD", () => {
  assert.equal(COACH_LIVE_MODEL, "gpt-realtime");
  const usd = estimateRealtimeCostUsd({
    inputTextTokens: 0,
    inputAudioTokens: 1000,
    outputTextTokens: 0,
    outputAudioTokens: 1000,
  });
  assert.equal(Number(usd.toFixed(6)), 0.096);
});

test("readRealtimeUsage splits text and audio and ignores other fields", () => {
  const usage = readRealtimeUsage({
    type: "response.done",
    response: {
      usage: {
        input_tokens: 10,
        output_tokens: 4,
        input_token_details: { text_tokens: 3, audio_tokens: 7 },
        output_token_details: { text_tokens: 1, audio_tokens: 3 },
      },
    },
  });
  assert.deepEqual(usage, {
    inputTextTokens: 3,
    inputAudioTokens: 7,
    outputTextTokens: 1,
    outputAudioTokens: 3,
  });
  assert.equal(readRealtimeUsage({ type: "response.created" }), null);
});

test("the first live exchange settles the mint hold and a later one opens a new meter", () => {
  assert.equal(liveTurnMeterAction("live_hold"), "settle_hold");
  assert.equal(liveTurnMeterAction("active"), "open_new");
  assert.equal(liveExchangeDisposition("  "), "refund");
  assert.equal(liveExchangeDisposition("Heard you."), "count");
});

test("tool output redacts secrets and is safe to send back to Realtime", () => {
  const payload = functionCallOutputPayload("call_1", {
    apiKey: "sk-secretsecret",
    note: "Bearer sk-secretsecret",
    ok: true,
  });
  assert.equal(payload.type, "conversation.item.create");
  assert.equal(payload.item.call_id, "call_1");
  assert.equal(payload.item.output.includes("sk-secret"), false);
  assert.match(payload.item.output, /\[redacted\]/);
  assert.deepEqual(redactSecrets("ek_abcdefghij"), "[redacted]");
  assert.equal(RESPONSE_CREATE.type, "response.create");
});

test("mint sends the server key only to OpenAI and returns the ephemeral value", async () => {
  let auth = "";
  const secret = await mintRealtimeClientSecret({
    instructions: "Tutor",
    tools: skillCoachRealtimeTools(),
    apiKey: "sk-server-key-not-for-browser",
    fetchImpl: async (url, init) => {
      auth = String((init?.headers as Record<string, string>).Authorization);
      assert.equal(
        String(url),
        "https://api.openai.com/v1/realtime/client_secrets",
      );
      const body = JSON.parse(String(init?.body));
      assert.equal(body.session.model, COACH_LIVE_MODEL);
      assert.equal(body.session.type, "realtime");
      assert.equal(body.session.tools.length, 4);
      return new Response(
        JSON.stringify({
          value: "ek_ephemeral",
          expires_at: 1700000000,
          session: { client_secret: "do-not-forward" },
        }),
        { status: 200 },
      );
    },
  });
  assert.equal(secret.value, "ek_ephemeral");
  assert.equal(secret.expiresAt, 1700000000);
  assert.equal("session" in secret, false);
  assert.match(auth, /sk-server-key-not-for-browser/);
  assert.equal(JSON.stringify(secret).includes("sk-server"), false);
});

test("live routes keep execute on the server and the programs payload exposes the flag", () => {
  const tool = readFileSync(
    new URL(
      "../../app/api/coach/plans/[id]/live/tool/route.ts",
      import.meta.url,
    ),
    "utf8",
  );
  const session = readFileSync(
    new URL(
      "../../app/api/coach/plans/[id]/live/session/route.ts",
      import.meta.url,
    ),
    "utf8",
  );
  const programs = readFileSync(
    new URL("../../app/api/coach/programs/route.ts", import.meta.url),
    "utf8",
  );
  assert.match(tool, /executeSkillCoachTool/);
  assert.match(session, /isCoachLiveEnabled/);
  assert.match(session, /COACH_LIVE_DISABLED/);
  assert.match(session, /clientSecret: secret\.clientSecret/);
  assert.doesNotMatch(session, /return NextResponse\.json\(openaiBody\)/);
  assert.match(programs, /liveEnabled: isCoachLiveEnabled\(\)/);
});
