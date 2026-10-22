import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/db";
import { resume } from "@/db/schema";
import { auth } from "@/lib/auth";
import { generateResumeSlug } from "@/lib/resume/slug";
import type { ResumeData } from "@/types/resume";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const shareSchema = z.object({
  isPublic: z.boolean(),
  version: z.number().int().positive(),
  rotateSlug: z.boolean().optional(),
});

function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const record = error as { code?: string; cause?: { code?: string } };
  return record.code === "23505" || record.cause?.code === "23505";
}

/**
 * POST /api/resumes/[id]/share
 * Turn the public /r/{slug} link on or off, and optionally mint a new slug.
 * This is not /api/r, which tracks learning-resource clicks.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const parsed = shareSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { isPublic, version, rotateSlug } = parsed.data;

    const [current] = await db
      .select()
      .from(resume)
      .where(
        and(
          eq(resume.id, id),
          eq(resume.userId, session.user.id),
          eq(resume.version, version),
        ),
      )
      .limit(1);

    if (!current) {
      const [exists] = await db
        .select({ id: resume.id, version: resume.version })
        .from(resume)
        .where(and(eq(resume.id, id), eq(resume.userId, session.user.id)))
        .limit(1);

      if (!exists) {
        return NextResponse.json(
          { error: "Resume not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(
        {
          error: "Version conflict",
          currentVersion: exists.version,
        },
        { status: 409 },
      );
    }

    let slug = current.slug;
    if (rotateSlug || !slug) {
      const data = current.data as ResumeData;
      const seed = data?.basics?.name || current.title;
      slug = generateResumeSlug(seed);
    }

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const [updated] = await db
          .update(resume)
          .set({
            isPublic,
            slug,
            version: version + 1,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(resume.id, id),
              eq(resume.userId, session.user.id),
              eq(resume.version, version),
            ),
          )
          .returning({
            id: resume.id,
            slug: resume.slug,
            isPublic: resume.isPublic,
            version: resume.version,
          });

        if (!updated) {
          return NextResponse.json(
            { error: "Version conflict" },
            { status: 409 },
          );
        }

        return NextResponse.json({ resume: updated });
      } catch (error) {
        if (!isUniqueViolation(error) || attempt === 2 || !rotateSlug) {
          throw error;
        }
        const data = current.data as ResumeData;
        slug = generateResumeSlug(data?.basics?.name || current.title);
      }
    }

    return NextResponse.json(
      { error: "Failed to update share link" },
      { status: 500 },
    );
  } catch (error) {
    console.error("POST /api/resumes/[id]/share error:", error);
    return NextResponse.json(
      { error: "Failed to update share link" },
      { status: 500 },
    );
  }
}
