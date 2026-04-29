import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { resume } from "@/db/schema";
import { auth } from "@/lib/auth";
import { updateResumeSchema } from "@/lib/validations/resume";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/resumes/[id]
 * Fetch a single resume by ID.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [found] = await db
      .select()
      .from(resume)
      .where(and(eq(resume.id, id), eq(resume.userId, session.user.id)))
      .limit(1);

    if (!found) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    return NextResponse.json({ resume: found });
  } catch (error) {
    console.error("GET /api/resumes/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch resume" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/resumes/[id]
 * Update a resume. Uses optimistic locking via the `version` field.
 * The client must send the current version number; if it doesn't match,
 * a 409 Conflict is returned.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateResumeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { version, ...updates } = parsed.data;

    // Build the update object — only include fields that were provided
    const updateValues: Record<string, unknown> = {
      updatedAt: new Date(),
      version: version + 1, // increment version
    };

    if (updates.title !== undefined) updateValues.title = updates.title;
    if (updates.status !== undefined) updateValues.status = updates.status;
    if (updates.templateSlug !== undefined)
      updateValues.templateSlug = updates.templateSlug;
    if (updates.industry !== undefined)
      updateValues.industry = updates.industry;
    if (updates.targetRole !== undefined)
      updateValues.targetRole = updates.targetRole;
    if (updates.isPublic !== undefined)
      updateValues.isPublic = updates.isPublic;
    if (updates.data !== undefined) updateValues.data = updates.data;
    if (updates.metadata !== undefined)
      updateValues.metadata = updates.metadata;

    // Optimistic locking: only update if the version matches
    const [updated] = await db
      .update(resume)
      .set(updateValues)
      .where(
        and(
          eq(resume.id, id),
          eq(resume.userId, session.user.id),
          eq(resume.version, version), // optimistic lock
        ),
      )
      .returning();

    if (!updated) {
      // Check if the resume exists at all
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

      // Version mismatch — conflict
      return NextResponse.json(
        {
          error: "Version conflict",
          message:
            "This resume was modified in another session. Please reload to see the latest changes.",
          currentVersion: exists.version,
        },
        { status: 409 },
      );
    }

    return NextResponse.json({ resume: updated });
  } catch (error) {
    console.error("PATCH /api/resumes/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update resume" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/resumes/[id]
 * Delete a resume permanently.
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [deleted] = await db
      .delete(resume)
      .where(and(eq(resume.id, id), eq(resume.userId, session.user.id)))
      .returning({ id: resume.id });

    if (!deleted) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/resumes/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete resume" },
      { status: 500 },
    );
  }
}
