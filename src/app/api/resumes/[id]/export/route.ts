import { and, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import db from "@/db";
import { resume } from "@/db/schema";
import { auth } from "@/lib/auth";
import { renderResumePdf } from "@/lib/resume/pdf/render";
import { pdfDownloadFilename } from "@/lib/resume/pdf/text";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * POST /api/resumes/[id]/export
 * Returns a PDF file. The download count increments only after the file
 * is rendered, so a failed export or an HTML preview does not count.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [found] = await db
      .select()
      .from(resume)
      .where(and(eq(resume.id, id), eq(resume.userId, session.user.id)))
      .limit(1);

    if (!found) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const pdf = await renderResumePdf({
      title: found.title,
      templateSlug: found.templateSlug,
      data: found.data,
      metadata: found.metadata,
    });

    try {
      await db
        .update(resume)
        .set({ downloadCount: sql`${resume.downloadCount} + 1` })
        .where(eq(resume.id, id));
    } catch (error) {
      console.error("Failed to record resume download:", error);
    }

    const filename = pdfDownloadFilename(found.title);
    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
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
