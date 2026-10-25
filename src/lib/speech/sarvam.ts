/**
 * Server-only Sarvam speech helpers.
 *
 * Read SARVAM_API_KEY here and from the coach speech routes only. Do not import
 * this module from a client component.
 *
 * Endpoints checked against Sarvam docs on 2026-10-25:
 * - STT POST https://api.sarvam.ai/speech-to-text
 *   model saaras:v4, mode transcribe, multipart field `file`
 *   https://docs.sarvam.ai/api-reference/speech-to-text/transcribe
 * - TTS POST https://api.sarvam.ai/text-to-speech
 *   model bulbul:v4-flash, JSON body, base64 `audios`
 *   https://docs.sarvam.ai/api-reference/text-to-speech/convert
 */

export const MAX_STT_AUDIO_BYTES = 4 * 1024 * 1024;
export const MAX_TTS_CHARS = 2000;
/** Room for multipart boundaries around a 4MB audio part. */
const STT_DECLARED_SLACK_BYTES = 256 * 1024;

const STT_URL = "https://api.sarvam.ai/speech-to-text";
const TTS_URL = "https://api.sarvam.ai/text-to-speech";
const STT_MODEL = "saaras:v4";
const TTS_MODEL = "bulbul:v4-flash";
const TTS_SPEAKER = "shubh_enhi_ads";
const TTS_CODEC = "wav";
const TTS_MIME_TYPE = "audio/wav";
const DEFAULT_TTS_LANGUAGE = "en-IN";
const REQUEST_TIMEOUT_MS = 45_000;

export class SpeechUnavailableError extends Error {
  readonly code = "SPEECH_UNAVAILABLE" as const;

  constructor(message = "Speech is temporarily unavailable") {
    super(message);
    this.name = "SpeechUnavailableError";
  }
}

export class SpeechRequestError extends Error {
  readonly code: "AUDIO_TOO_LARGE" | "INVALID_AUDIO" | "INVALID_TEXT";
  readonly status: 400 | 413;

  constructor(
    code: SpeechRequestError["code"],
    status: SpeechRequestError["status"],
    message = code,
  ) {
    super(message);
    this.name = "SpeechRequestError";
    this.code = code;
    this.status = status;
  }
}

export function isSttContentLengthTooLarge(header: string | null): boolean {
  if (!header) return false;
  const declared = Number(header);
  if (!Number.isFinite(declared) || declared < 0) return false;
  return declared > MAX_STT_AUDIO_BYTES + STT_DECLARED_SLACK_BYTES;
}

export function speechHttpError(error: unknown): {
  status: number;
  body: { error: string };
} | null {
  if (error instanceof SpeechUnavailableError) {
    return { status: 503, body: { error: error.code } };
  }
  if (error instanceof SpeechRequestError) {
    return { status: error.status, body: { error: error.code } };
  }
  return null;
}

export async function transcribeWithSarvam(
  audio: Blob | ArrayBuffer,
  opts?: { languageCode?: string },
): Promise<{ text: string }> {
  const blob = audio instanceof Blob ? audio : new Blob([audio]);
  if (blob.size === 0) {
    throw new SpeechRequestError("INVALID_AUDIO", 400);
  }
  if (blob.size > MAX_STT_AUDIO_BYTES) {
    throw new SpeechRequestError("AUDIO_TOO_LARGE", 413);
  }

  const form = new FormData();
  const type = blob.type || "application/octet-stream";
  form.append("file", new File([blob], filenameFor(type), { type }));
  form.append("model", STT_MODEL);
  form.append("mode", "transcribe");
  const languageCode = normalizeLanguageCode(opts?.languageCode);
  if (languageCode) form.append("language_code", languageCode);

  const response = await sarvamFetch(STT_URL, {
    method: "POST",
    headers: authHeaders(),
    body: form,
  });
  const payload = (await readJson(response, STT_URL)) as {
    transcript?: unknown;
  };
  if (typeof payload.transcript !== "string") {
    throw new SpeechUnavailableError();
  }
  return { text: payload.transcript };
}

export async function synthesizeWithSarvam(
  text: string,
  opts?: { languageCode?: string },
): Promise<{ audioBase64: string; mimeType: string }> {
  const trimmed = text.trim().slice(0, MAX_TTS_CHARS);
  if (!trimmed) {
    throw new SpeechRequestError("INVALID_TEXT", 400);
  }

  const languageCode = normalizeLanguageCode(opts?.languageCode);
  const body = {
    text: trimmed,
    language_code:
      languageCode && languageCode !== "unknown"
        ? languageCode
        : DEFAULT_TTS_LANGUAGE,
    model: TTS_MODEL,
    speaker: TTS_SPEAKER,
    output_audio_codec: TTS_CODEC,
  };

  const headers = authHeaders();
  headers.set("content-type", "application/json");
  const response = await sarvamFetch(TTS_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const payload = (await readJson(response, TTS_URL)) as { audios?: unknown };
  if (
    !Array.isArray(payload.audios) ||
    payload.audios.some((part) => typeof part !== "string")
  ) {
    throw new SpeechUnavailableError();
  }
  const audioBase64 = payload.audios.join("");
  if (!audioBase64) throw new SpeechUnavailableError();
  return { audioBase64, mimeType: TTS_MIME_TYPE };
}

function authHeaders(): Headers {
  const key = process.env.SARVAM_API_KEY?.trim();
  if (!key) throw new SpeechUnavailableError();
  const headers = new Headers();
  headers.set("api-subscription-key", key);
  return headers;
}

function normalizeLanguageCode(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  if (trimmed.toLowerCase() === "unknown") return "unknown";
  const match = /^([a-z]{2,3})-([a-z]{2})$/i.exec(trimmed);
  if (!match) return undefined;
  return `${match[1].toLowerCase()}-${match[2].toUpperCase()}`;
}

function filenameFor(type: string): string {
  if (type.includes("webm")) return "audio.webm";
  if (type.includes("wav")) return "audio.wav";
  if (type.includes("mpeg") || type.includes("mp3")) return "audio.mp3";
  if (type.includes("ogg")) return "audio.ogg";
  if (type.includes("mp4") || type.includes("m4a")) return "audio.m4a";
  if (type.includes("aac")) return "audio.aac";
  if (type.includes("flac")) return "audio.flac";
  return "audio.bin";
}

async function sarvamFetch(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    console.error("[speech] Sarvam request failed", {
      endpoint: url,
      reason: error instanceof Error ? error.name : "error",
    });
    throw new SpeechUnavailableError();
  }
}

async function readJson(
  response: Response,
  endpoint: string,
): Promise<unknown> {
  if (!response.ok) {
    console.error("[speech] Sarvam HTTP failure", {
      endpoint,
      status: response.status,
    });
    await response.body?.cancel().catch(() => undefined);
    throw new SpeechUnavailableError();
  }
  try {
    return await response.json();
  } catch {
    console.error("[speech] Sarvam returned a non-JSON body", { endpoint });
    throw new SpeechUnavailableError();
  }
}
