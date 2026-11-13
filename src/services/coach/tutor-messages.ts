import type { UIMessage } from "ai";

export const SUMMARY_SHIM_ID = "coach-summary-shim";

const MAX_USER_CHARS = 4000;

export function isLegacyCoachTurn(
  value: unknown,
): value is { role: "user" | "assistant"; content: string } {
  if (!value || typeof value !== "object") return false;
  const turn = value as { role?: unknown; content?: unknown; parts?: unknown };
  if (Array.isArray(turn.parts)) return false;
  return (
    (turn.role === "user" || turn.role === "assistant") &&
    typeof turn.content === "string"
  );
}

function isStoredUIMessage(value: unknown): value is UIMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as { id?: unknown; role?: unknown; parts?: unknown };
  return (
    typeof message.id === "string" &&
    (message.role === "user" || message.role === "assistant") &&
    Array.isArray(message.parts)
  );
}

export function toUIMessages(value: unknown): UIMessage[] {
  if (!Array.isArray(value)) return [];
  const messages: UIMessage[] = [];
  value.forEach((item, index) => {
    if (isStoredUIMessage(item)) {
      messages.push(item);
      return;
    }
    if (isLegacyCoachTurn(item)) {
      messages.push({
        id: `legacy-${index}-${item.role}`,
        role: item.role,
        parts: [{ type: "text", text: item.content }],
      });
    }
  });
  return messages;
}

export function textFromUIMessage(message: UIMessage): string {
  return message.parts
    .filter(
      (part): part is { type: "text"; text: string } =>
        part.type === "text" && "text" in part && typeof part.text === "string",
    )
    .map((part) => part.text)
    .join("\n")
    .trim();
}

export function userTurnText(message: UIMessage): string | null {
  const text = textFromUIMessage(message).trim();
  if (text.length < 1 || text.length > MAX_USER_CHARS) return null;
  return text;
}

export function latestUserUIMessage(messages: unknown): UIMessage | null {
  const ui = toUIMessages(messages);
  for (let index = ui.length - 1; index >= 0; index -= 1) {
    const message = ui[index];
    if (message && message.role === "user" && message.id !== SUMMARY_SHIM_ID) {
      return message;
    }
  }
  return null;
}

export function buildAgentWindow(input: {
  history: UIMessage[];
  summary: string | null;
  latestUser: UIMessage;
  historyMessages: number;
}): UIMessage[] {
  const summary = input.summary?.trim() ?? "";
  const prior = input.history.filter(
    (message) =>
      message.id !== SUMMARY_SHIM_ID && message.id !== input.latestUser.id,
  );
  // The budget counts the summary shim and the latest user turn.
  const shimCount = summary.length > 0 ? 1 : 0;
  const slots = Math.max(0, input.historyMessages - 1 - shimCount);
  const window = prior.slice(-slots);
  const shim: UIMessage[] =
    summary.length > 0
      ? [
          {
            id: SUMMARY_SHIM_ID,
            role: "user",
            parts: [{ type: "text", text: `Earlier summary:\n${summary}` }],
          },
        ]
      : [];
  return [...shim, ...window, input.latestUser];
}

export function messagesForPersistence(input: {
  stored: UIMessage[];
  latestUser: UIMessage;
  ended: UIMessage[];
}): UIMessage[] {
  const base = input.stored.filter((message) => message.id !== SUMMARY_SHIM_ID);
  const withUser = base.some((message) => message.id === input.latestUser.id)
    ? base
    : [...base, input.latestUser];
  const seen = new Set(withUser.map((message) => message.id));
  const assistants = input.ended.filter(
    (message) =>
      message.role === "assistant" &&
      message.id !== SUMMARY_SHIM_ID &&
      !seen.has(message.id),
  );
  return [...withUser, ...assistants];
}
