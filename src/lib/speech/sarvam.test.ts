import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  isSttContentLengthTooLarge,
  MAX_STT_AUDIO_BYTES,
  MAX_TTS_CHARS,
  SpeechRequestError,
  SpeechUnavailableError,
  speechHttpError,
  synthesizeWithSarvam,
  transcribeWithSarvam,
} from "@/lib/speech/sarvam";

const STT_URL = "https://api.sarvam.ai/speech-to-text";
const TTS_URL = "https://api.sarvam.ai/text-to-speech";

const originalFetch = globalThis.fetch;
const originalKey = process.env.SARVAM_API_KEY;

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.SARVAM_API_KEY;
  else process.env.SARVAM_API_KEY = originalKey;
});

function mockFetch(
  handler: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
) {
  globalThis.fetch = handler as typeof fetch;
}

describe("transcribeWithSarvam", () => {
  it("maps a missing key to a thrown error with code SPEECH_UNAVAILABLE", async () => {
    delete process.env.SARVAM_API_KEY;
    let called = false;
    mockFetch(async () => {
      called = true;
      return Response.json({ transcript: "should not run" });
    });

    await assert.rejects(
      () => transcribeWithSarvam(new Blob(["audio"])),
      (error: unknown) => {
        assert.ok(error instanceof SpeechUnavailableError);
        assert.equal(error.code, "SPEECH_UNAVAILABLE");
        return true;
      },
    );
    assert.equal(called, false);
  });

  it("treats a blank key as missing", async () => {
    process.env.SARVAM_API_KEY = "   ";
    let called = false;
    mockFetch(async () => {
      called = true;
      return Response.json({ transcript: "should not run" });
    });
    await assert.rejects(
      () => transcribeWithSarvam(new ArrayBuffer(8)),
      (error: unknown) => {
        assert.equal((error as { code?: string }).code, "SPEECH_UNAVAILABLE");
        return true;
      },
    );
    assert.equal(called, false);
  });

  it("posts audio to the Saaras speech-to-text endpoint", async () => {
    process.env.SARVAM_API_KEY = "test-key";
    let capturedUrl = "";
    let capturedInit: RequestInit | undefined;
    mockFetch(async (input, init) => {
      capturedUrl = String(input);
      capturedInit = init;
      return Response.json({
        request_id: "req-1",
        transcript: "hello coach",
        language_code: "en-IN",
      });
    });

    const audio = new Blob([Uint8Array.from([1, 2, 3, 4])], {
      type: "audio/webm",
    });
    const result = await transcribeWithSarvam(audio, { languageCode: "en-IN" });

    assert.deepEqual(result, { text: "hello coach" });
    assert.equal(capturedUrl, STT_URL);
    const headers = new Headers(capturedInit?.headers);
    assert.equal(headers.get("api-subscription-key"), "test-key");
    assert.equal(headers.get("authorization"), null);
    assert.ok(capturedInit?.body instanceof FormData);
    const form = capturedInit.body;
    assert.equal(form.get("model"), "saaras:v4");
    assert.equal(form.get("mode"), "transcribe");
    assert.equal(form.get("language_code"), "en-IN");
    const file = form.get("file");
    assert.ok(file instanceof File);
    assert.equal(file.name, "audio.webm");
    assert.equal(file.size, 4);
  });

  it("omits language_code when the caller does not pass one", async () => {
    process.env.SARVAM_API_KEY = "test-key";
    let form: FormData | undefined;
    mockFetch(async (_input, init) => {
      form = init?.body instanceof FormData ? init.body : undefined;
      return Response.json({ transcript: "" });
    });

    const result = await transcribeWithSarvam(new ArrayBuffer(2));
    assert.deepEqual(result, { text: "" });
    assert.equal(form?.get("language_code"), null);
    assert.equal(form?.get("model"), "saaras:v4");
  });

  it("drops an invalid language code instead of sending it", async () => {
    process.env.SARVAM_API_KEY = "test-key";
    let form: FormData | undefined;
    mockFetch(async (_input, init) => {
      form = init?.body instanceof FormData ? init.body : undefined;
      return Response.json({ transcript: "ok" });
    });

    await transcribeWithSarvam(new ArrayBuffer(2), {
      languageCode: "english",
    });
    assert.equal(form?.get("language_code"), null);
  });

  it("maps a Sarvam HTTP failure to SPEECH_UNAVAILABLE", async () => {
    process.env.SARVAM_API_KEY = "test-key";
    mockFetch(async () => new Response("overloaded", { status: 503 }));

    await assert.rejects(
      () => transcribeWithSarvam(new ArrayBuffer(4)),
      (error: unknown) => {
        assert.equal((error as { code?: string }).code, "SPEECH_UNAVAILABLE");
        return true;
      },
    );
  });

  it("maps a network failure to SPEECH_UNAVAILABLE", async () => {
    process.env.SARVAM_API_KEY = "test-key";
    mockFetch(async () => {
      throw new Error("socket hang up");
    });

    await assert.rejects(
      () => transcribeWithSarvam(new ArrayBuffer(4)),
      (error: unknown) => {
        assert.ok(error instanceof SpeechUnavailableError);
        return true;
      },
    );
  });

  it("rejects audio larger than 4MB before calling Sarvam", async () => {
    process.env.SARVAM_API_KEY = "test-key";
    let called = false;
    mockFetch(async () => {
      called = true;
      return Response.json({ transcript: "nope" });
    });

    assert.equal(MAX_STT_AUDIO_BYTES, 4 * 1024 * 1024);
    await assert.rejects(
      () => transcribeWithSarvam(new ArrayBuffer(MAX_STT_AUDIO_BYTES + 1)),
      (error: unknown) => {
        assert.equal((error as { code?: string }).code, "AUDIO_TOO_LARGE");
        return true;
      },
    );
    assert.equal(called, false);
  });

  it("accepts audio at the 4MB boundary", async () => {
    process.env.SARVAM_API_KEY = "test-key";
    let called = false;
    mockFetch(async () => {
      called = true;
      return Response.json({ transcript: "edge" });
    });

    const result = await transcribeWithSarvam(
      new ArrayBuffer(MAX_STT_AUDIO_BYTES),
    );
    assert.deepEqual(result, { text: "edge" });
    assert.equal(called, true);
  });
});

describe("synthesizeWithSarvam", () => {
  it("maps a missing key to SPEECH_UNAVAILABLE", async () => {
    delete process.env.SARVAM_API_KEY;
    let called = false;
    mockFetch(async () => {
      called = true;
      return Response.json({ audios: ["abc"] });
    });

    await assert.rejects(
      () => synthesizeWithSarvam("Hello"),
      (error: unknown) => {
        assert.equal((error as { code?: string }).code, "SPEECH_UNAVAILABLE");
        return true;
      },
    );
    assert.equal(called, false);
  });

  it("posts text to the Bulbul text-to-speech endpoint", async () => {
    process.env.SARVAM_API_KEY = "test-key";
    let capturedUrl = "";
    let capturedInit: RequestInit | undefined;
    mockFetch(async (input, init) => {
      capturedUrl = String(input);
      capturedInit = init;
      return Response.json({
        request_id: "req-2",
        audios: ["UklGRg==", "AAAA"],
      });
    });

    const result = await synthesizeWithSarvam("  Welcome  ", {
      languageCode: "hi-IN",
    });

    assert.deepEqual(result, {
      audioBase64: "UklGRg==AAAA",
      mimeType: "audio/wav",
    });
    assert.equal(capturedUrl, TTS_URL);
    const headers = new Headers(capturedInit?.headers);
    assert.equal(headers.get("api-subscription-key"), "test-key");
    assert.match(headers.get("content-type") ?? "", /application\/json/);
    const body = JSON.parse(String(capturedInit?.body)) as {
      text: string;
      language_code: string;
      model: string;
      speaker: string;
      output_audio_codec: string;
    };
    assert.equal(body.text, "Welcome");
    assert.equal(body.language_code, "hi-IN");
    assert.equal(body.model, "bulbul:v4-flash");
    assert.equal(body.speaker, "shubh_enhi_ads");
    assert.equal(body.output_audio_codec, "wav");
  });

  it("trims TTS text to 2000 characters", async () => {
    process.env.SARVAM_API_KEY = "test-key";
    let sent = "";
    mockFetch(async (_input, init) => {
      sent = JSON.parse(String(init?.body)).text as string;
      return Response.json({ audios: ["QQ=="] });
    });

    assert.equal(MAX_TTS_CHARS, 2000);
    const result = await synthesizeWithSarvam(`  ${"a".repeat(2500)}  `);
    assert.equal(sent.length, 2000);
    assert.equal(sent, "a".repeat(2000));
    assert.equal(result.mimeType, "audio/wav");
  });

  it("defaults language to en-IN", async () => {
    process.env.SARVAM_API_KEY = "test-key";
    let language = "";
    mockFetch(async (_input, init) => {
      language = JSON.parse(String(init?.body)).language_code as string;
      return Response.json({ audios: ["QQ=="] });
    });

    await synthesizeWithSarvam("Practice this answer.");
    assert.equal(language, "en-IN");
  });

  it("falls back to en-IN when the language code is invalid", async () => {
    process.env.SARVAM_API_KEY = "test-key";
    let language = "";
    mockFetch(async (_input, init) => {
      language = JSON.parse(String(init?.body)).language_code as string;
      return Response.json({ audios: ["QQ=="] });
    });

    await synthesizeWithSarvam("Hello", { languageCode: "not a language" });
    assert.equal(language, "en-IN");
  });

  it("maps a Sarvam HTTP failure to SPEECH_UNAVAILABLE", async () => {
    process.env.SARVAM_API_KEY = "test-key";
    mockFetch(async () => new Response("bad", { status: 500 }));

    await assert.rejects(
      () => synthesizeWithSarvam("Hello"),
      (error: unknown) => {
        assert.equal((error as { code?: string }).code, "SPEECH_UNAVAILABLE");
        return true;
      },
    );
  });

  it("rejects empty text before calling Sarvam", async () => {
    process.env.SARVAM_API_KEY = "test-key";
    let called = false;
    mockFetch(async () => {
      called = true;
      return Response.json({ audios: ["QQ=="] });
    });

    await assert.rejects(
      () => synthesizeWithSarvam("   "),
      (error: unknown) => {
        assert.equal((error as { code?: string }).code, "INVALID_TEXT");
        return true;
      },
    );
    assert.equal(called, false);
  });
});

describe("speechHttpError", () => {
  it("maps SPEECH_UNAVAILABLE to HTTP 503", () => {
    assert.deepEqual(speechHttpError(new SpeechUnavailableError()), {
      status: 503,
      body: { error: "SPEECH_UNAVAILABLE" },
    });
  });

  it("maps client speech errors to their HTTP status", () => {
    assert.deepEqual(
      speechHttpError(new SpeechRequestError("AUDIO_TOO_LARGE", 413)),
      { status: 413, body: { error: "AUDIO_TOO_LARGE" } },
    );
    assert.deepEqual(
      speechHttpError(new SpeechRequestError("INVALID_TEXT", 400)),
      { status: 400, body: { error: "INVALID_TEXT" } },
    );
  });

  it("flags a declared upload well above 4MB", () => {
    assert.equal(isSttContentLengthTooLarge(null), false);
    assert.equal(isSttContentLengthTooLarge("4096"), false);
    assert.equal(
      isSttContentLengthTooLarge(String(MAX_STT_AUDIO_BYTES + 64 * 1024)),
      false,
    );
    assert.equal(
      isSttContentLengthTooLarge(String(MAX_STT_AUDIO_BYTES + 512 * 1024)),
      true,
    );
  });

  it("leaves unrelated errors unmapped", () => {
    assert.equal(speechHttpError(new Error("nope")), null);
  });
});
