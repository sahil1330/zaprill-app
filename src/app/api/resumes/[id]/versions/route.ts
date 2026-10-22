import { and, desc, eq, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { resume, resumeVersion } from "@/db/schema";
import { auth } from "@/lib/auth";
import { isUniqueViolation } from "@/lib/resume/slug";
import { snapshotIdentity } from "@/lib/resume/version-snapshot";
import { createVersionSchema } from "@/lib/validations/resume";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/resumes/[id]/versions
 * List all versions for a resume.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const [found] = await db
      .select({ id: resume.id })
      .from(resume)
      .where(and(eq(resume.id, id), eq(resume.userId, session.user.id)))
      .limit(1);

    if (!found) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const versions = await db
      .select()
      .from(resumeVersion)
      .where(eq(resumeVersion.resumeId, id))
      .orderBy(desc(resumeVersion.createdAt));

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
 * Create a new version snapshot.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const parsed = createVersionSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // 1. Fetch current resume data
    const [current] = await db
      .select()
      .from(resume)
      .where(and(eq(resume.id, id), eq(resume.userId, session.user.id)))
      .limit(1);

    if (!current) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const identity = snapshotIdentity(current);

    // 2. Insert new version
    const newVersion = await db
      .insert(resumeVersion)
      .values({
        id: nanoid(),
        resumeId: id,
        version: current.version,
        data: current.data as any,
        metadata: current.metadata as any,
        templateSlug: identity.templateSlug,
        title: identity.title,
        industry: identity.industry,
        changeDescription: parsed.data.changeDescription || "Manual snapshot",
      })
      .returning();

    // 3. Prune old versions (keep last 20)
    const existingVersions = await db
      .select({ id: resumeVersion.id })
      .from(resumeVersion)
      .where(eq(resumeVersion.resumeId, id))
      .orderBy(desc(resumeVersion.createdAt));

    if (existingVersions.length > 20) {
      const toDelete = existingVersions.slice(20);
      const idsToDelete = toDelete.map((v) => v.id);

      await db
        .delete(resumeVersion)
        .where(
          and(
            eq(resumeVersion.resumeId, id),
            inArray(resumeVersion.id, idsToDelete),
          ),
        );
    }

    return NextResponse.json({ version: newVersion[0] });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        {
          error:
            "A snapshot of this saved version already exists. Edit the resume to capture another.",
        },
        { status: 409 },
      );
    }
    console.error("POST /api/resumes/[id]/versions error:", error);
    return NextResponse.json(
      { error: "Failed to create version snapshot" },
      { status: 500 },
    );
  }
}
