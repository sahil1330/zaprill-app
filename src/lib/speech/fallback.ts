/**
 * Client-safe speech mode selection.
 * Sarvam health is supplied by the caller (via an app API). This module never
 * reads SARVAM_API_KEY or any other server secret.
 */

export type SpeechMode = "sarvam" | "web-speech" | "text-only";

export function pickSpeechMode(input: {
  sarvamOk: boolean;
  webSpeechAvailable: boolean;
}): SpeechMode {
  if (input.sarvamOk) return "sarvam";
  if (input.webSpeechAvailable) return "web-speech";
  return "text-only";
}

export function isWebSpeechAvailable(g: {
  webkitSpeechRecognition?: unknown;
  SpeechRecognition?: unknown;
  speechSynthesis?: { speak: unknown };
}): boolean {
  const hasRecognition =
    g.SpeechRecognition != null || g.webkitSpeechRecognition != null;
  const canSpeak = typeof g.speechSynthesis?.speak === "function";
  return hasRecognition && canSpeak;
}
