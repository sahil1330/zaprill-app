import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { resume, userProfile } from "@/db/schema";
import { auth } from "@/lib/auth";
import { createResumeSchema } from "@/lib/validations/resume";
import { DEFAULT_RESUME_DATA, DEFAULT_RESUME_METADATA } from "@/types/resume";

/**
 * GET /api/resumes
 * List all resumes for the authenticated user.
 * Query params: ?status=draft|complete|archived
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");

    const conditions = [eq(resume.userId, session.user.id)];

    if (
      statusFilter &&
      ["draft", "complete", "archived"].includes(statusFilter)
    ) {
      conditions.push(
        eq(resume.status, statusFilter as "draft" | "complete" | "archived"),
      );
    }

    const resumes = await db
      .select({
        id: resume.id,
        title: resume.title,
        slug: resume.slug,
        status: resume.status,
        templateSlug: resume.templateSlug,
        industry: resume.industry,
        targetRole: resume.targetRole,
        lastAtsScore: resume.lastAtsScore,
        viewCount: resume.viewCount,
        downloadCount: resume.downloadCount,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
      })
      .from(resume)
      .where(and(...conditions))
      .orderBy(desc(resume.updatedAt));

    return NextResponse.json({ resumes });
  } catch (error) {
    console.error("GET /api/resumes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch resumes" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/resumes
 * Create a new resume.
 * Optionally import data from an existing analysis via sourceAnalysisId.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createResumeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { title, templateSlug, industry, sourceAnalysisId, data, metadata } =
      parsed.data;

    // Generate unique slug
    const slug = nanoid(10);
    const id = nanoid();

    // If importing from analysis, we'll use the provided data or defaults
    const resumeData = data ?? DEFAULT_RESUME_DATA;
    const resumeMetadata = metadata ?? DEFAULT_RESUME_METADATA;

    // Pre-fill basics.name from the user's profile if data wasn't provided
    if (!data && session.user.name) {
      resumeData.basics.name = session.user.name;
    }
    if (!data && session.user.email) {
      resumeData.basics.email = session.user.email;
    }

    const [newResume] = await db
      .insert(resume)
      .values({
        id,
        userId: session.user.id,
        title: title ?? "Untitled Resume",
        slug,
        templateSlug: templateSlug ?? "minimalist",
        industry: industry ?? "technology",
        data: resumeData,
        metadata: resumeMetadata,
        sourceAnalysisId: sourceAnalysisId ?? null,
      })
      .returning();

    // Update user profile: set this as primary resume if none exists, and complete onboarding
    try {
      await db
        .insert(userProfile)
        .values({
          id: crypto.randomUUID(),
          userId: session.user.id,
          primaryResumeId: id,
          onboardingStatus: "completed",
        })
        .onConflictDoUpdate({
          target: userProfile.userId,
          set: {
            // Only set primaryResumeId if it's currently null to avoid overwriting existing primary
            primaryResumeId: id,
            onboardingStatus: "completed",
            updatedAt: new Date(),
          },
        });
    } catch (err) {
      console.error("Failed to update user profile on resume creation:", err);
    }

    return NextResponse.json({ resume: newResume }, { status: 201 });
  } catch (error) {
    console.error("POST /api/resumes error:", error);
    return NextResponse.json(
      { error: "Failed to create resume" },
      { status: 500 },
    );
  }
}
