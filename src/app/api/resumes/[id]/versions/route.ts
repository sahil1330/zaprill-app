import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { resume, resumeVersion } from "@/db/schema";
import { auth } from "@/lib/auth";
import { createVersionSchema } from "@/lib/validations/resume";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/resumes/[id]/versions
 * List all version snapshots for a resume.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify resume ownership
    const [found] = await db
      .select({ id: resume.id })
      .from(resume)
      .where(and(eq(resume.id, id), eq(resume.userId, session.user.id)))
      .limit(1);

    if (!found) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const versions = await db
      .select({
        id: resumeVersion.id,
        version: resumeVersion.version,
        changeDescription: resumeVersion.changeDescription,
        createdAt: resumeVersion.createdAt,
      })
      .from(resumeVersion)
      .where(eq(resumeVersion.resumeId, id))
      .orderBy(desc(resumeVersion.version));

    return NextResponse.json({ versions });
  } catch (error) {
    console.error("GET /api/resumes/[id]/versions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch versions" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/resumes/[id]/versions
 * Create a version snapshot of the current resume state.
 * Called before AI rewrites or major edits.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = createVersionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // Fetch current resume state
    const [current] = await db
      .select()
      .from(resume)
      .where(and(eq(resume.id, id), eq(resume.userId, session.user.id)))
      .limit(1);

    if (!current) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Create the version snapshot
    const [version] = await db
      .insert(resumeVersion)
      .values({
        id: nanoid(),
        resumeId: id,
        version: current.version,
        data: current.data,
        metadata: current.metadata,
        changeDescription: parsed.data.changeDescription ?? null,
      })
      .returning();

    return NextResponse.json({ version }, { status: 201 });
  } catch (error) {
    console.error("POST /api/resumes/[id]/versions error:", error);
    return NextResponse.json(
      { error: "Failed to create version" },
      { status: 500 },
    );
  }
}
