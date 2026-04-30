import { generateText } from "ai";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/db";
import { resume } from "@/db/schema";
import { auth } from "@/lib/auth";
import { hackclub } from "@/lib/hackClubClient";
import { logAiUsage } from "@/services/ai/usage.service";

export const maxDuration = 30;

const MODEL = "google/gemini-2.5-flash" as const;

const RequestSchema = z.object({
  bullet: z.string().min(1).max(1000),
  context: z
    .object({
      position: z.string().optional(),
      company: z.string().optional(),
    })
    .optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify resume belongs to user
    const [row] = await db
      .select({ userId: resume.userId })
      .from(resume)
      .where(eq(resume.id, id))
      .limit(1);

    if (!row || row.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { bullet, context } = parsed.data;

    const contextStr = context
      ? `The person works as ${context.position ?? "a professional"} at ${context.company ?? "a company"}.`
      : "";

    const llmStart = Date.now();
    const { text, usage } = await generateText({
      model: hackclub(MODEL),
      prompt: `You are an expert resume writer. Rewrite the following resume bullet point to be more impactful.

Rules:
- Start with a strong action verb (e.g., "Spearheaded", "Engineered", "Orchestrated", "Drove")
- Quantify the impact with numbers, percentages, or dollar amounts when possible
- Use the STAR method (Situation, Task, Action, Result) condensed into one line
- Keep it concise — ONE sentence, under 30 words
- Do NOT use vague phrases like "responsible for" or "helped with"
- Do NOT add quotation marks around the output
- Return ONLY the rewritten bullet point, nothing else

${contextStr}

Original bullet point:
${bullet}`,
    });
    const latencyMs = Date.now() - llmStart;

    logAiUsage({
      userId: session.user.id,
      action: "enhance_bullet",
      model: MODEL,
      promptTokens: usage.inputTokens ?? 0,
      completionTokens: usage.outputTokens ?? 0,
      totalTokens: usage.totalTokens ?? 0,
      latencyMs,
      success: true,
    });

    // Strip any wrapping quotes the model might add
    const enhanced = text.trim().replace(/^["']|["']$/g, "");

    return NextResponse.json({ enhanced });
  } catch (error) {
    console.error("Enhance bullet error:", error);
    return NextResponse.json(
      { error: "Failed to enhance bullet" },
      { status: 500 },
    );
  }
}
