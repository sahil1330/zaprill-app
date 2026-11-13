export type LivePhase =
  | "idle"
  | "connecting"
  | "listening"
  | "speaking"
  | "tool"
  | "error";

export type LiveSignal = {
  type:
    | "start"
    | "connected"
    | "speech_started"
    | "speech_stopped"
    | "response_started"
    | "response_done"
    | "tool_started"
    | "tool_finished"
    | "fail"
    | "stop";
};

export function reduceLivePhase(
  phase: LivePhase,
  signal: LiveSignal,
): LivePhase {
  if (signal.type === "stop") return "idle";
  if (signal.type === "fail") return "error";
  if (signal.type === "start") return "connecting";
  if (phase === "error") return phase;
  switch (signal.type) {
    case "connected":
    case "speech_started":
    case "speech_stopped":
    case "response_done":
    case "tool_finished":
      return "listening";
    case "response_started":
      return "speaking";
    case "tool_started":
      return "tool";
    default:
      return phase;
  }
}

export function signalFromRealtimeEvent(type: string): LiveSignal | null {
  switch (type) {
    case "input_audio_buffer.speech_started":
      return { type: "speech_started" };
    case "input_audio_buffer.speech_stopped":
      return { type: "speech_stopped" };
    case "response.created":
      return { type: "response_started" };
    case "response.done":
      return { type: "response_done" };
    case "response.function_call_arguments.done":
      return { type: "tool_started" };
    default:
      return null;
  }
}
