import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isWebSpeechAvailable, pickSpeechMode } from "@/lib/speech/fallback";

describe("pickSpeechMode", () => {
  it("prefers Sarvam when healthy", () => {
    assert.equal(
      pickSpeechMode({ sarvamOk: true, webSpeechAvailable: true }),
      "sarvam",
    );
  });

  it("prefers Sarvam even when Web Speech is missing", () => {
    assert.equal(
      pickSpeechMode({ sarvamOk: true, webSpeechAvailable: false }),
      "sarvam",
    );
  });

  it("falls back to Web Speech", () => {
    assert.equal(
      pickSpeechMode({ sarvamOk: false, webSpeechAvailable: true }),
      "web-speech",
    );
  });

  it("falls back to text-only", () => {
    assert.equal(
      pickSpeechMode({ sarvamOk: false, webSpeechAvailable: false }),
      "text-only",
    );
  });
});

describe("isWebSpeechAvailable", () => {
  it("requires recognition + synthesis", () => {
    assert.equal(isWebSpeechAvailable({}), false);
    assert.equal(
      isWebSpeechAvailable({
        SpeechRecognition: class {},
        speechSynthesis: { speak: () => undefined },
      }),
      true,
    );
  });

  it("accepts the webkit recognition prefix with synthesis", () => {
    assert.equal(
      isWebSpeechAvailable({
        webkitSpeechRecognition: class {},
        speechSynthesis: { speak: () => undefined },
      }),
      true,
    );
  });

  it("rejects recognition without a speak function", () => {
    assert.equal(
      isWebSpeechAvailable({
        SpeechRecognition: class {},
      }),
      false,
    );
    assert.equal(
      isWebSpeechAvailable({
        SpeechRecognition: class {},
        speechSynthesis: { speak: undefined },
      }),
      false,
    );
  });

  it("rejects synthesis without recognition", () => {
    assert.equal(
      isWebSpeechAvailable({
        speechSynthesis: { speak: () => undefined },
      }),
      false,
    );
  });
});
