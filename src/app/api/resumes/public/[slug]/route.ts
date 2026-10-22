import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { resume } from "@/db/schema";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/resumes/public/[slug]
 * Public read of a resume whose owner turned sharing on.
 * Learning-resource redirects stay on GET /api/r?id= and are unrelated.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const [found] = await db
      .select({
        id: resume.id,
        title: resume.title,
        slug: resume.slug,
        templateSlug: resume.templateSlug,
        data: resume.data,
        metadata: resume.metadata,
        updatedAt: resume.updatedAt,
        viewCount: resume.viewCount,
      })
      .from(resume)
      .where(and(eq(resume.slug, slug), eq(resume.isPublic, true)))
      .limit(1);

    if (!found) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db
      .update(resume)
      .set({ viewCount: (found.viewCount ?? 0) + 1 })
      .where(eq(resume.id, found.id));

    return NextResponse.json({
      resume: {
        title: found.title,
        slug: found.slug,
        templateSlug: found.templateSlug,
        data: found.data,
        metadata: found.metadata,
        updatedAt: found.updatedAt,
      },
    });
  } catch (error) {
    console.error("GET /api/resumes/public/[slug] error:", error);
    return NextResponse.json(
      { error: "Failed to load resume" },
      { status: 500 },
    );
  }
}
