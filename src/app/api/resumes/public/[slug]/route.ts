import { and, eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { resume } from "@/db/schema";
import {
  publicViewCookieName,
  shouldCountPublicView,
} from "@/lib/resume/public-view";

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
      })
      .from(resume)
      .where(and(eq(resume.slug, slug), eq(resume.isPublic, true)))
      .limit(1);

    if (!found) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const jar = await cookies();
    const cookieName = publicViewCookieName(slug);
    const countView = shouldCountPublicView(jar.get(cookieName)?.value, slug);
    if (countView) {
      await db
        .update(resume)
        .set({ viewCount: sql`${resume.viewCount} + 1` })
        .where(eq(resume.id, found.id));
    }

    const response = NextResponse.json({
      resume: {
        title: found.title,
        slug: found.slug,
        templateSlug: found.templateSlug,
        data: found.data,
        metadata: found.metadata,
        updatedAt: found.updatedAt,
      },
    });
    if (countView) {
      response.cookies.set(cookieName, slug, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 12,
        path: "/",
      });
    }
    return response;
  } catch (error) {
    console.error("GET /api/resumes/public/[slug] error:", error);
    return NextResponse.json(
      { error: "Failed to load resume" },
      { status: 500 },
    );
  }
}
