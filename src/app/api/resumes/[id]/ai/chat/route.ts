import {
  AISDKError,
  createAgentUIStreamResponse,
  createIdGenerator,
  smoothStream,
} from "ai";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import {
  createResumeArchitectAgent,
  RESUME_ARCHITECT_MODEL,
  type ResumeArchitectUIMessage,
} from "@/lib/agents/resume-architect";
import { auth } from "@/lib/auth";
import { logAiUsage } from "@/services/ai/usage.service";
import {
  loadChatMessages,
  loadResumeRow,
  type ResumeArchitectContext,
  saveChatMessages,
} from "@/services/resume/architect.service";

export const maxDuration = 60;

type RouteParams = { params: Promise<{ id: string }> };

async function requireResumeOwner(
  id: string,
): Promise<{ error: NextResponse } | { userId: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  try {
    await loadResumeRow({ resumeId: id, userId: session.user.id });
  } catch {
    return {
      error: NextResponse.json({ error: "Resume not found" }, { status: 404 }),
    };
  }

  return { userId: session.user.id };
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const authz = await requireResumeOwner(id);
  if ("error" in authz) return authz.error;

  const messages = await loadChatMessages(id, authz.userId);
  return NextResponse.json({ messages });
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const authz = await requireResumeOwner(id);
  if ("error" in authz) return authz.error;

  const userId = authz.userId;
  const startedAt = Date.now();
  const ctx: ResumeArchitectContext = {
    resumeId: id,
    userId,
    onUsage: (usage) => {
      logAiUsage({
        userId,
        action: "resume_chat",
        model: RESUME_ARCHITECT_MODEL,
        promptTokens: usage.inputTokens ?? 0,
        completionTokens: usage.outputTokens ?? 0,
        totalTokens: usage.totalTokens ?? 0,
        latencyMs: Date.now() - startedAt,
        success: true,
      });
    },
  };

  let body: { messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const uiMessages = Array.isArray(body.messages) ? body.messages : [];
  if (uiMessages.length === 0) {
    return NextResponse.json(
      { error: "messages are required" },
      { status: 400 },
    );
  }

  const agent = createResumeArchitectAgent(ctx);

  try {
    return await createAgentUIStreamResponse({
      agent,
      uiMessages,
      abortSignal: request.signal,
      originalMessages: uiMessages as ResumeArchitectUIMessage[],
      sendReasoning: true,
      generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
      experimental_transform: smoothStream({ chunking: "word" }),
      consumeSseStream: async ({ stream }) => {
        const reader = stream.getReader();
        try {
          while (true) {
            const { done } = await reader.read();
            if (done) break;
          }
        } catch {
          // Client disconnect is expected; persistence still runs via onEnd.
        }
      },
      onEnd: ({ messages }) => {
        void saveChatMessages({
          resumeId: id,
          userId,
          messages,
        });
      },
    });
  } catch (error) {
    logAiUsage({
      userId,
      action: "resume_chat",
      model: RESUME_ARCHITECT_MODEL,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      latencyMs: Date.now() - startedAt,
      success: false,
      errorCode: AISDKError.isInstance(error)
        ? error.name
        : "resume_chat_failed",
    });

    if (AISDKError.isInstance(error)) {
      return NextResponse.json(
        { error: "The architect could not complete that turn." },
        { status: 400 },
      );
    }

    console.error("POST /api/resumes/[id]/ai/chat error:", error);
    return NextResponse.json(
      { error: "Failed to run Resume Architect" },
      { status: 500 },
    );
  }
}
