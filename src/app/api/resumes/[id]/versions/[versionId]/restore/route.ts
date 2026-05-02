import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { resume, resumeVersion } from "@/db/schema";
import { auth } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string; versionId: string }>;
}

/**
 * POST /api/resumes/[id]/versions/[versionId]/restore
 * Restore a resume to a specific version snapshot.
 */
export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, versionId } = await params;

    // 1. Fetch the version snapshot
    const [version] = await db
      .select()
      .from(resumeVersion)
      .where(
        and(eq(resumeVersion.id, versionId), eq(resumeVersion.resumeId, id)),
      )
      .limit(1);

    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    // 2. Verify ownership of the resume
    const [found] = await db
      .select({ id: resume.id, version: resume.version })
      .from(resume)
      .where(and(eq(resume.id, id), eq(resume.userId, session.user.id)))
      .limit(1);

    if (!found) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // 3. Update the resume with the snapshot data
    // We also increment the version number of the main resume to ensure consistency
    const [updated] = await db
      .update(resume)
      .set({
        data: version.data as any,
        metadata: version.metadata as any,
        version: found.version + 1,
        updatedAt: new Date(),
      })
      .where(and(eq(resume.id, id), eq(resume.userId, session.user.id)))
      .returning();

    return NextResponse.json({ resume: updated });
  } catch (error) {
    console.error(
      "POST /api/resumes/[id]/versions/[versionId]/restore error:",
      error,
    );
    return NextResponse.json(
      { error: "Failed to restore version" },
      { status: 500 },
    );
  }
}
