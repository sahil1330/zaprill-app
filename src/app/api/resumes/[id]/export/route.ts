import { and, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import db from "@/db";
import { resume } from "@/db/schema";
import { auth } from "@/lib/auth";
import type { ResumeData, ResumeMetadata } from "@/types/resume";

/**
 * POST /api/resumes/[id]/export
 *
 * Generates an export-ready HTML payload for client-side PDF rendering.
 * Returns the resume data + metadata needed to render a print-optimized page.
 *
 * The actual PDF is generated client-side via window.print() or
 * a dedicated print page, avoiding serverless cold-start issues with Puppeteer.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let recordDownload = true;
    try {
      const body = await request.json();
      if (
        body &&
        typeof body === "object" &&
        (body as { recordDownload?: unknown }).recordDownload === false
      ) {
        recordDownload = false;
      }
    } catch {
      recordDownload = true;
    }

    const [found] = await db
      .select()
      .from(resume)
      .where(and(eq(resume.id, id), eq(resume.userId, session.user.id)))
      .limit(1);

    if (!found) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    if (recordDownload) {
      await db
        .update(resume)
        .set({ downloadCount: sql`${resume.downloadCount} + 1` })
        .where(eq(resume.id, id));
    }

    return NextResponse.json({
      resume: {
        id: found.id,
        title: found.title,
        data: found.data as ResumeData,
        metadata: found.metadata as ResumeMetadata,
        templateSlug: found.templateSlug,
      },
    });
  } catch (error) {
    console.error("POST /api/resumes/[id]/export error:", error);
    return NextResponse.json(
      { error: "Failed to export resume" },
      { status: 500 },
    );
  }
}
