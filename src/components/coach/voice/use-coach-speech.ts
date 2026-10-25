"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  isWebSpeechAvailable,
  pickSpeechMode,
  type SpeechMode,
} from "@/lib/speech/fallback";

export const COACH_STT_PATH = "/api/coach/speech/stt";
export const COACH_TTS_PATH = "/api/coach/speech/tts";
export const WEB_SPEECH_NOTICE = "Using device speech";
export const TEXT_ONLY_MIC_REASON =
  "Voice input is not available on this device.";

export interface SpeechGlobals {
  webkitSpeechRecognition?: unknown;
  SpeechRecognition?: unknown;
  speechSynthesis?: { speak: unknown };
}

export function noticeForSpeechMode(mode: SpeechMode): string | null {
  return mode === "web-speech" ? WEB_SPEECH_NOTICE : null;
}

export function micReasonForSpeechMode(mode: SpeechMode): string | null {
  return mode === "text-only" ? TEXT_ONLY_MIC_REASON : null;
}

export function planSpeechAttempt(
  mode: SpeechMode,
): "sarvam" | "device" | "skip" {
  if (mode === "text-only") return "skip";
  if (mode === "web-speech") return "device";
  return "sarvam";
}

export function shouldFallbackFromSpeechFailure(input: {
  networkError?: boolean;
  status?: number;
  error?: string;
}): boolean {
  if (input.networkError) return true;
  return input.status === 503 && input.error === "SPEECH_UNAVAILABLE";
}

export interface CoachSpeechExchange {
  mode: SpeechMode;
  notice: string | null;
  micReason: string | null;
  fellBack: boolean;
  transcript: string | null;
  audioBase64: string | null;
  mimeType: string | null;
}

function modeAfterSpeechAttempt(
  sarvamOk: boolean,
  globals: SpeechGlobals,
): SpeechMode {
  return pickSpeechMode({
    sarvamOk,
    webSpeechAvailable: isWebSpeechAvailable(globals),
  });
}

function exchangeResult(
  mode: SpeechMode,
  fellBack: boolean,
  extra?: Partial<
    Pick<CoachSpeechExchange, "transcript" | "audioBase64" | "mimeType">
  >,
): CoachSpeechExchange {
  return {
    mode,
    notice: noticeForSpeechMode(mode),
    micReason: micReasonForSpeechMode(mode),
    fellBack,
    transcript: extra?.transcript ?? null,
    audioBase64: extra?.audioBase64 ?? null,
    mimeType: extra?.mimeType ?? null,
  };
}

function audioFilename(type: string): string {
  if (type.includes("mp4") || type.includes("m4a")) return "speech.m4a";
  if (type.includes("wav")) return "speech.wav";
  if (type.includes("ogg")) return "speech.ogg";
  if (type.includes("mpeg") || type.includes("mp3")) return "speech.mp3";
  return "speech.webm";
}

async function readSpeechPayload(response: Response): Promise<{
  error?: string;
  text?: string;
  audioBase64?: string;
  mimeType?: string;
}> {
  try {
    const body = (await response.json()) as {
      error?: unknown;
      text?: unknown;
      audioBase64?: unknown;
      mimeType?: unknown;
    };
    return {
      error: typeof body.error === "string" ? body.error : undefined,
      text: typeof body.text === "string" ? body.text : undefined,
      audioBase64:
        typeof body.audioBase64 === "string" ? body.audioBase64 : undefined,
      mimeType: typeof body.mimeType === "string" ? body.mimeType : undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Try the app Sarvam route. SPEECH_UNAVAILABLE and network failures pick the
 * next mode with `pickSpeechMode`. The Sarvam key stays on the server.
 */
export async function exchangeCoachSpeech(
  input: { kind: "tts"; text: string } | { kind: "stt"; audio: Blob },
  deps: { fetchImpl: typeof fetch; globals: SpeechGlobals },
): Promise<CoachSpeechExchange> {
  const stay = () =>
    exchangeResult(modeAfterSpeechAttempt(true, deps.globals), false);
  const fallBack = () =>
    exchangeResult(modeAfterSpeechAttempt(false, deps.globals), true);

  let request: { url: string; init: RequestInit };
  if (input.kind === "tts") {
    const text = input.text.trim();
    if (!text) return stay();
    request = {
      url: COACH_TTS_PATH,
      init: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      },
    };
  } else {
    const form = new FormData();
    const type = input.audio.type || "audio/webm";
    form.append("audio", input.audio, audioFilename(type));
    request = { url: COACH_STT_PATH, init: { method: "POST", body: form } };
  }

  let response: Response;
  try {
    response = await deps.fetchImpl(request.url, request.init);
  } catch {
    return fallBack();
  }

  const payload = await readSpeechPayload(response);
  if (
    shouldFallbackFromSpeechFailure({
      status: response.status,
      error: payload.error,
    })
  ) {
    return fallBack();
  }
  if (!response.ok) return stay();

  if (input.kind === "stt") {
    const transcript = payload.text?.trim() ?? "";
    return exchangeResult(modeAfterSpeechAttempt(true, deps.globals), false, {
      transcript: transcript.length > 0 ? transcript : null,
    });
  }

  return exchangeResult(modeAfterSpeechAttempt(true, deps.globals), false, {
    audioBase64: payload.audioBase64 ?? null,
    mimeType: payload.mimeType ?? null,
  });
}

interface RecognitionEvent {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

interface BrowserRecognition {
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort?: () => void;
}

type RecognitionConstructor = new () => BrowserRecognition;

interface Playback {
  stop: () => void;
}

function readGlobals(): SpeechGlobals {
  if (typeof window === "undefined") return {};
  const host = window as Window & {
    SpeechRecognition?: unknown;
    webkitSpeechRecognition?: unknown;
  };
  const speak = host.speechSynthesis?.speak;
  return {
    SpeechRecognition: host.SpeechRecognition,
    webkitSpeechRecognition: host.webkitSpeechRecognition,
    ...(typeof speak === "function"
      ? { speechSynthesis: { speak: speak.bind(host.speechSynthesis) } }
      : {}),
  };
}

function recognitionConstructor(
  globals: SpeechGlobals,
): RecognitionConstructor | null {
  const candidate =
    globals.SpeechRecognition ?? globals.webkitSpeechRecognition;
  return typeof candidate === "function"
    ? (candidate as RecognitionConstructor)
    : null;
}

function pickRecorderMime(): string | undefined {
  if (
    typeof MediaRecorder === "undefined" ||
    typeof MediaRecorder.isTypeSupported !== "function"
  ) {
    return undefined;
  }
  return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((type) =>
    MediaRecorder.isTypeSupported(type),
  );
}

function objectUrlFromBase64(base64: string, mimeType: string): string {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return URL.createObjectURL(
    new Blob([bytes], { type: mimeType || "audio/wav" }),
  );
}

export function useCoachSpeech(options?: {
  onTranscript?: (text: string) => void;
  fetchImpl?: typeof fetch;
}): {
  mode: SpeechMode;
  listening: boolean;
  startListen: () => void;
  stopListen: () => void;
  speak: (text: string) => Promise<void>;
  stopSpeak: () => void;
  notice: string | null;
} {
  const [mode, setMode] = useState<SpeechMode>(() =>
    pickSpeechMode({
      sarvamOk: true,
      webSpeechAvailable: isWebSpeechAvailable(readGlobals()),
    }),
  );
  const [listening, setListening] = useState(false);
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const listeningRef = useRef(false);
  const startingRef = useRef(false);
  const stopRequestedRef = useRef(false);
  const discardListenRef = useRef(false);
  const listenGen = useRef(0);
  const speakGen = useRef(0);
  const mountedRef = useRef(true);
  const onTranscriptRef = useRef(options?.onTranscript);
  onTranscriptRef.current = options?.onTranscript;
  const fetchRef = useRef(options?.fetchImpl ?? fetch);
  fetchRef.current = options?.fetchImpl ?? fetch;
  const recognitionRef = useRef<BrowserRecognition | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const playbackRef = useRef<Playback | null>(null);

  const applyMode = useCallback((next: SpeechMode) => {
    modeRef.current = next;
    setMode(next);
  }, []);

  const stopPlayback = useCallback(() => {
    playbackRef.current?.stop();
    playbackRef.current = null;
  }, []);

  const stopListen = useCallback(() => {
    stopRequestedRef.current = true;
    recognitionRef.current?.stop();
    const recorder = recorderRef.current;
    if (recorder && recorder.state === "recording") {
      try {
        recorder.requestData();
      } catch {
        // stop() still flushes any buffered audio
      }
    }
    if (recorder && recorder.state !== "inactive") recorder.stop();
    listeningRef.current = false;
    setListening(false);
  }, []);

  const stopSpeak = useCallback(() => {
    speakGen.current += 1;
    stopPlayback();
  }, [stopPlayback]);

  const speakWithDevice = useCallback(
    (text: string, gen: number) =>
      new Promise<void>((resolve) => {
        if (!mountedRef.current || speakGen.current !== gen) {
          resolve();
          return;
        }
        const synth = window.speechSynthesis;
        if (
          !synth ||
          typeof synth.speak !== "function" ||
          typeof SpeechSynthesisUtterance === "undefined"
        ) {
          resolve();
          return;
        }
        const utterance = new SpeechSynthesisUtterance(text);
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          if (playbackRef.current?.stop === stop) playbackRef.current = null;
          resolve();
        };
        const stop = () => {
          synth.cancel();
          finish();
        };
        playbackRef.current = { stop };
        utterance.onend = finish;
        utterance.onerror = finish;
        try {
          synth.speak(utterance);
        } catch {
          finish();
        }
      }),
    [],
  );

  const playEncoded = useCallback(
    (base64: string, mimeType: string, gen: number) =>
      new Promise<void>((resolve) => {
        if (!mountedRef.current || speakGen.current !== gen) {
          resolve();
          return;
        }
        let url: string;
        try {
          url = objectUrlFromBase64(base64, mimeType);
        } catch {
          resolve();
          return;
        }
        const audio = new Audio(url);
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          URL.revokeObjectURL(url);
          if (playbackRef.current?.stop === stop) playbackRef.current = null;
          resolve();
        };
        const stop = () => {
          audio.pause();
          finish();
        };
        playbackRef.current = { stop };
        audio.onended = finish;
        audio.onerror = finish;
        void audio.play().catch(finish);
      }),
    [],
  );

  const submitRecording = useCallback(
    async (blob: Blob, gen: number) => {
      const exchange = await exchangeCoachSpeech(
        { kind: "stt", audio: blob },
        { fetchImpl: fetchRef.current, globals: readGlobals() },
      );
      if (!mountedRef.current || listenGen.current !== gen) return;
      if (exchange.fellBack) {
        applyMode(exchange.mode);
        return;
      }
      if (exchange.transcript) onTranscriptRef.current?.(exchange.transcript);
    },
    [applyMode],
  );

  const beginWebListen = useCallback(() => {
    const Ctor = recognitionConstructor(readGlobals());
    if (!Ctor) return;
    const gen = listenGen.current;
    const recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      if (!mountedRef.current || listenGen.current !== gen) return;
      const transcript = event.results?.[0]?.[0]?.transcript?.trim() ?? "";
      if (transcript) onTranscriptRef.current?.(transcript);
    };
    recognition.onerror = () => {
      try {
        recognition.stop();
      } catch {
        if (recognitionRef.current === recognition) {
          recognitionRef.current = null;
        }
        listeningRef.current = false;
        if (mountedRef.current) setListening(false);
      }
    };
    recognition.onend = () => {
      if (recognitionRef.current === recognition) recognitionRef.current = null;
      if (!mountedRef.current || listenGen.current !== gen) return;
      listeningRef.current = false;
      setListening(false);
    };
    recognitionRef.current = recognition;
    listeningRef.current = true;
    setListening(true);
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      listeningRef.current = false;
      setListening(false);
    }
  }, []);

  const beginSarvamListen = useCallback(async () => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      if (isWebSpeechAvailable(readGlobals())) beginWebListen();
      return;
    }
    const gen = listenGen.current;
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      return;
    }
    if (
      !mountedRef.current ||
      stopRequestedRef.current ||
      listenGen.current !== gen
    ) {
      for (const track of stream.getTracks()) track.stop();
      return;
    }
    const mimeType = pickRecorderMime();
    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);
    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    recorder.onstop = () => {
      for (const track of stream.getTracks()) track.stop();
      if (recorderRef.current === recorder) recorderRef.current = null;
      if (
        !mountedRef.current ||
        discardListenRef.current ||
        listenGen.current !== gen
      ) {
        return;
      }
      const blob = new Blob(chunks, {
        type: recorder.mimeType || mimeType || "audio/webm",
      });
      if (blob.size === 0) return;
      void submitRecording(blob, gen);
    };
    recorderRef.current = recorder;
    recorder.start();
    listeningRef.current = true;
    setListening(true);
  }, [beginWebListen, submitRecording]);

  const startListen = useCallback(() => {
    if (listeningRef.current || startingRef.current) return;
    if (planSpeechAttempt(modeRef.current) === "skip") return;
    speakGen.current += 1;
    stopPlayback();
    stopRequestedRef.current = false;
    listenGen.current += 1;
    if (planSpeechAttempt(modeRef.current) === "device") {
      beginWebListen();
      return;
    }
    startingRef.current = true;
    void beginSarvamListen().finally(() => {
      startingRef.current = false;
    });
  }, [beginSarvamListen, beginWebListen, stopPlayback]);

  const speak = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const gen = ++speakGen.current;
      stopPlayback();
      stopListen();
      const plan = planSpeechAttempt(modeRef.current);
      if (plan === "skip") return;
      if (plan === "device") {
        await speakWithDevice(trimmed, gen);
        return;
      }
      const exchange = await exchangeCoachSpeech(
        { kind: "tts", text: trimmed },
        { fetchImpl: fetchRef.current, globals: readGlobals() },
      );
      if (!mountedRef.current || speakGen.current !== gen) return;
      if (exchange.fellBack) {
        applyMode(exchange.mode);
        if (planSpeechAttempt(exchange.mode) === "device") {
          await speakWithDevice(trimmed, gen);
        }
        return;
      }
      if (exchange.audioBase64) {
        await playEncoded(
          exchange.audioBase64,
          exchange.mimeType ?? "audio/wav",
          gen,
        );
      }
    },
    [applyMode, playEncoded, speakWithDevice, stopListen, stopPlayback],
  );

  useEffect(() => {
    mountedRef.current = true;
    discardListenRef.current = false;
    return () => {
      mountedRef.current = false;
      discardListenRef.current = true;
      listenGen.current += 1;
      speakGen.current += 1;
      recognitionRef.current?.abort?.();
      recognitionRef.current?.stop();
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") recorder.stop();
      playbackRef.current?.stop();
    };
  }, []);

  return {
    mode,
    listening,
    startListen,
    stopListen,
    speak,
    stopSpeak,
    notice: noticeForSpeechMode(mode),
  };
}
