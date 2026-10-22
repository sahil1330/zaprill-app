import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { resume } from "@/db/schema";
import { auth } from "@/lib/auth";
import { generateResumeSlug, isUniqueViolation } from "@/lib/resume/slug";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/resumes/[id]/duplicate
 * Create a deep copy of a resume with a new title and reset stats.
 */
export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch the original resume
    const [original] = await db
      .select()
      .from(resume)
      .where(and(eq(resume.id, id), eq(resume.userId, session.user.id)))
      .limit(1);

    if (!original) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Create the duplicate. Retry when the public slug collides.
    const newId = nanoid();
    const data = original.data as { basics?: { name?: string } } | null;
    const seed = data?.basics?.name || `Copy of ${original.title}`;

    let duplicated: typeof resume.$inferSelect | undefined;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const [created] = await db
          .insert(resume)
          .values({
            id: newId,
            userId: session.user.id,
            title: `Copy of ${original.title}`,
            slug: generateResumeSlug(seed),
            status: "draft",
            templateSlug: original.templateSlug,
            industry: original.industry,
            data: original.data,
            metadata: original.metadata,
            targetRole: original.targetRole,
            version: 1,
            isPublic: false,
            viewCount: 0,
            downloadCount: 0,
            lastAtsScore: null,
            sourceAnalysisId: original.sourceAnalysisId,
          })
          .returning();
        duplicated = created;
        break;
      } catch (error) {
        if (!isUniqueViolation(error) || attempt === 2) throw error;
      }
    }

    if (!duplicated) {
      return NextResponse.json(
        { error: "Failed to duplicate resume" },
        { status: 500 },
      );
    }

    return NextResponse.json({ resume: duplicated }, { status: 201 });
  } catch (error) {
    console.error("POST /api/resumes/[id]/duplicate error:", error);
    return NextResponse.json(
      { error: "Failed to duplicate resume" },
      { status: 500 },
    );
  }
}
