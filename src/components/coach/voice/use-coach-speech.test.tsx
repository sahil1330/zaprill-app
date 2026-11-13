import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { TutorComposer } from "@/components/coach/tutor-composer";
import {
  CoachMicButton,
  CoachSpeakerButton,
} from "@/components/coach/voice/coach-speech-controls";
import {
  COACH_STT_PATH,
  COACH_TTS_PATH,
  exchangeCoachSpeech,
  micReasonForSpeechMode,
  noticeForSpeechMode,
  planSpeechAttempt,
  shouldFallbackFromSpeechFailure,
  TEXT_ONLY_MIC_REASON,
  WEB_SPEECH_NOTICE,
} from "@/components/coach/voice/use-coach-speech";

const webSpeech = {
  SpeechRecognition: class SpeechRecognition {},
  speechSynthesis: { speak: () => undefined },
};

function jsonResponse(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

describe("shouldFallbackFromSpeechFailure", () => {
  it("falls back on SPEECH_UNAVAILABLE and network errors only", () => {
    assert.equal(
      shouldFallbackFromSpeechFailure({
        status: 503,
        error: "SPEECH_UNAVAILABLE",
      }),
      true,
    );
    assert.equal(shouldFallbackFromSpeechFailure({ networkError: true }), true);
    assert.equal(
      shouldFallbackFromSpeechFailure({ status: 503, error: "OTHER" }),
      false,
    );
    assert.equal(
      shouldFallbackFromSpeechFailure({ status: 400, error: "INVALID_AUDIO" }),
      false,
    );
    assert.equal(
      shouldFallbackFromSpeechFailure({ status: 401, error: "Unauthorized" }),
      false,
    );
    assert.equal(
      shouldFallbackFromSpeechFailure({
        status: 413,
        error: "AUDIO_TOO_LARGE",
      }),
      false,
    );
  });
});

describe("useCoachSpeech mode selection", () => {
  it("keeps Sarvam when text-to-speech returns audio", async () => {
    let url = "";
    let init: RequestInit | undefined;
    const result = await exchangeCoachSpeech(
      { kind: "tts", text: "  Closures keep their scope.  " },
      {
        globals: webSpeech,
        fetchImpl: async (input, request) => {
          url = String(input);
          init = request;
          return jsonResponse({
            audioBase64: "aGVsbG8=",
            mimeType: "audio/wav",
          });
        },
      },
    );

    assert.equal(url, COACH_TTS_PATH);
    assert.equal(init?.method, "POST");
    const headers = new Headers(init?.headers);
    assert.equal(headers.get("content-type"), "application/json");
    assert.equal(headers.get("api-subscription-key"), null);
    assert.deepEqual(JSON.parse(String(init?.body)), {
      text: "Closures keep their scope.",
    });
    assert.equal(JSON.stringify(init).includes("SARVAM_API_KEY"), false);
    assert.equal(result.mode, "sarvam");
    assert.equal(result.fellBack, false);
    assert.equal(result.notice, null);
    assert.equal(result.micReason, null);
    assert.equal(result.audioBase64, "aGVsbG8=");
    assert.equal(result.mimeType, "audio/wav");
    assert.equal(planSpeechAttempt(result.mode), "sarvam");
  });

  it("does not call fetch for an empty utterance", async () => {
    let called = false;
    const result = await exchangeCoachSpeech(
      { kind: "tts", text: "   " },
      {
        globals: webSpeech,
        fetchImpl: async () => {
          called = true;
          return jsonResponse({});
        },
      },
    );
    assert.equal(called, false);
    assert.equal(result.mode, "sarvam");
    assert.equal(result.fellBack, false);
  });

  it("falls back to Web Speech when TTS returns SPEECH_UNAVAILABLE", async () => {
    const result = await exchangeCoachSpeech(
      { kind: "tts", text: "Hello" },
      {
        globals: webSpeech,
        fetchImpl: async () =>
          jsonResponse({ error: "SPEECH_UNAVAILABLE" }, 503),
      },
    );
    assert.equal(result.mode, "web-speech");
    assert.equal(result.fellBack, true);
    assert.equal(result.notice, WEB_SPEECH_NOTICE);
    assert.equal(result.notice, "Using device speech");
    assert.equal(result.micReason, null);
    assert.equal(result.audioBase64, null);
    assert.equal(planSpeechAttempt(result.mode), "device");
  });

  it("falls back to text-only when device speech is missing", async () => {
    const result = await exchangeCoachSpeech(
      { kind: "tts", text: "Hello" },
      {
        globals: {},
        fetchImpl: async () =>
          jsonResponse({ error: "SPEECH_UNAVAILABLE" }, 503),
      },
    );
    assert.equal(result.mode, "text-only");
    assert.equal(result.fellBack, true);
    assert.equal(result.notice, null);
    assert.equal(result.micReason, TEXT_ONLY_MIC_REASON);
    assert.equal(planSpeechAttempt(result.mode), "skip");
  });

  it("does not treat recognition without synthesis as device speech", async () => {
    const result = await exchangeCoachSpeech(
      { kind: "tts", text: "Hello" },
      {
        globals: { SpeechRecognition: class SpeechRecognition {} },
        fetchImpl: async () =>
          jsonResponse({ error: "SPEECH_UNAVAILABLE" }, 503),
      },
    );
    assert.equal(result.mode, "text-only");
    assert.equal(result.micReason, TEXT_ONLY_MIC_REASON);
  });

  it("accepts the webkit recognition prefix on fallback", async () => {
    const result = await exchangeCoachSpeech(
      { kind: "tts", text: "Hello" },
      {
        globals: {
          webkitSpeechRecognition: class WebkitSpeechRecognition {},
          speechSynthesis: { speak: () => undefined },
        },
        fetchImpl: async () => {
          throw new TypeError("Failed to fetch");
        },
      },
    );
    assert.equal(result.mode, "web-speech");
    assert.equal(result.fellBack, true);
    assert.equal(result.notice, "Using device speech");
  });

  it("falls back to text-only on a network error without device speech", async () => {
    const result = await exchangeCoachSpeech(
      { kind: "tts", text: "Hello" },
      {
        globals: {},
        fetchImpl: async () => {
          throw new TypeError("Failed to fetch");
        },
      },
    );
    assert.equal(result.mode, "text-only");
    assert.equal(result.fellBack, true);
    assert.equal(result.micReason, TEXT_ONLY_MIC_REASON);
  });

  it("stays on Sarvam for request errors", async () => {
    for (const [status, error] of [
      [400, "INVALID_TEXT"],
      [401, "Unauthorized"],
      [413, "AUDIO_TOO_LARGE"],
    ] as const) {
      const result = await exchangeCoachSpeech(
        { kind: "tts", text: "Hello" },
        {
          globals: webSpeech,
          fetchImpl: async () => jsonResponse({ error }, status),
        },
      );
      assert.equal(result.mode, "sarvam", error);
      assert.equal(result.fellBack, false, error);
      assert.equal(result.notice, null, error);
    }
  });

  it("fills a transcript from the speech-to-text route", async () => {
    let url = "";
    let sawAudio = false;
    const result = await exchangeCoachSpeech(
      { kind: "stt", audio: new Blob(["voice"], { type: "audio/webm" }) },
      {
        globals: webSpeech,
        fetchImpl: async (input, request) => {
          url = String(input);
          assert.equal(request?.method, "POST");
          assert.ok(request?.body instanceof FormData);
          assert.equal(request.headers, undefined);
          const entry: unknown = request.body.get("audio");
          sawAudio = entry instanceof Blob;
          return jsonResponse({ text: "  practice sql joins  " });
        },
      },
    );

    assert.equal(url, COACH_STT_PATH);
    assert.equal(sawAudio, true);
    assert.equal(result.mode, "sarvam");
    assert.equal(result.fellBack, false);
    assert.equal(result.transcript, "practice sql joins");
  });

  it("drops the transcript and switches mode when STT is unavailable", async () => {
    const result = await exchangeCoachSpeech(
      { kind: "stt", audio: new Blob(["voice"], { type: "audio/webm" }) },
      {
        globals: webSpeech,
        fetchImpl: async () =>
          jsonResponse({ error: "SPEECH_UNAVAILABLE" }, 503),
      },
    );
    assert.equal(result.mode, "web-speech");
    assert.equal(result.fellBack, true);
    assert.equal(result.transcript, null);
    assert.equal(result.notice, "Using device speech");
  });

  it("does not switch mode when the recording is rejected", async () => {
    const result = await exchangeCoachSpeech(
      { kind: "stt", audio: new Blob(["voice"], { type: "audio/webm" }) },
      {
        globals: {},
        fetchImpl: async () => jsonResponse({ error: "INVALID_AUDIO" }, 400),
      },
    );
    assert.equal(result.mode, "sarvam");
    assert.equal(result.fellBack, false);
    assert.equal(result.transcript, null);
  });
});

describe("speech notices", () => {
  it("names device speech and the text-only mic reason", () => {
    assert.equal(noticeForSpeechMode("web-speech"), "Using device speech");
    assert.equal(noticeForSpeechMode("sarvam"), null);
    assert.equal(noticeForSpeechMode("text-only"), null);
    assert.equal(micReasonForSpeechMode("text-only"), TEXT_ONLY_MIC_REASON);
    assert.equal(micReasonForSpeechMode("sarvam"), null);
    assert.equal(micReasonForSpeechMode("web-speech"), null);
    assert.equal(planSpeechAttempt("sarvam"), "sarvam");
    assert.equal(planSpeechAttempt("web-speech"), "device");
    assert.equal(planSpeechAttempt("text-only"), "skip");
  });
});

describe("coach speech client boundary", () => {
  it("keeps the Sarvam key and host off the client hook", () => {
    const source = readFileSync(
      new URL("./use-coach-speech.ts", import.meta.url),
      "utf8",
    );
    assert.match(source, /pickSpeechMode/);
    assert.match(source, /isWebSpeechAvailable/);
    assert.match(source, /exchangeCoachSpeech/);
    assert.match(source, /speechSynthesis/);
    assert.match(source, /webkitSpeechRecognition/);
    assert.doesNotMatch(source, /SARVAM_API_KEY/);
    assert.doesNotMatch(source, /api\.sarvam\.ai/);
    assert.doesNotMatch(source, /@\/lib\/speech\/sarvam/);
  });

  it("wires mic and speaker slots on the streaming tutor", () => {
    const source = readFileSync(
      new URL("../tutor-chat.tsx", import.meta.url),
      "utf8",
    );
    assert.match(source, /useCoachSpeech/);
    assert.match(source, /micSlot=/);
    assert.match(source, /speakerSlot=/);
    assert.match(source, /\/api\/coach\/plans\/\$\{planId\}\/ai\/chat/);
    assert.doesNotMatch(source, /\/api\/coach\/speech\/stt/);
    assert.doesNotMatch(source, /SARVAM_API_KEY/);
    assert.doesNotMatch(source, /api\.sarvam\.ai/);
  });
});

describe("coach speech controls", () => {
  it("labels the mic and shows why it is disabled", () => {
    const html = renderToStaticMarkup(
      <CoachMicButton
        listening={false}
        disabled
        disabledReason={TEXT_ONLY_MIC_REASON}
        describedBy="tutor-speech-notice"
        onPress={() => undefined}
      />,
    );
    assert.match(html, /data-slot="tutor-mic"/);
    assert.match(html, /type="button"/);
    assert.match(
      html,
      /aria-label="Start voice input\. Voice input is not available on this device\."/,
    );
    assert.match(html, /disabled=""/);
    assert.match(html, /title="Voice input is not available on this device\."/);
    assert.match(html, /aria-describedby="tutor-speech-notice"/);
  });

  it("labels an active mic as stop", () => {
    const html = renderToStaticMarkup(
      <CoachMicButton listening disabled={false} onPress={() => undefined} />,
    );
    assert.match(html, /aria-label="Stop voice input"/);
    assert.match(html, /aria-pressed="true"/);
    assert.doesNotMatch(html, /disabled=""/);
  });

  it("labels the speaker and disables it with a reason", () => {
    const html = renderToStaticMarkup(
      <CoachSpeakerButton
        disabled
        disabledReason="No tutor reply to play yet."
        onSpeak={() => undefined}
        onStop={() => undefined}
      />,
    );
    assert.match(html, /data-slot="tutor-speaker"/);
    assert.match(html, /type="button"/);
    assert.match(
      html,
      /aria-label="Play the tutor reply\. No tutor reply to play yet\."/,
    );
    assert.match(html, /disabled=""/);
    assert.match(html, /title="No tutor reply to play yet\."/);
  });

  it("shows the device-speech notice in the composer", () => {
    const html = renderToStaticMarkup(
      <TutorComposer
        value=""
        onChange={() => undefined}
        onSend={() => undefined}
        busy={false}
        notice="Using device speech"
        micSlot={<span data-slot="tutor-mic">Mic</span>}
        speakerSlot={<span data-slot="tutor-speaker">Speaker</span>}
      />,
    );
    assert.match(html, /id="tutor-speech-notice"/);
    assert.match(html, /data-slot="tutor-speech-notice"/);
    assert.match(html, /Using device speech/);
    assert.match(html, /data-slot="tutor-mic"/);
    assert.match(html, /data-slot="tutor-speaker"/);
  });
});
