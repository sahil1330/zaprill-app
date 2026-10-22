import { eq, max } from "drizzle-orm";
import { nanoid } from "nanoid";
import db from "@/db";
import { resumeVersion } from "@/db/schema";
import { isUniqueViolation } from "@/lib/resume/slug";
import { nextSnapshotVersion } from "@/lib/resume/version-snapshot";

/**
 * Insert one snapshot. `version` is the next free snapshot sequence so a
 * second snapshot of an unchanged resume, including Architect's pre-edit
 * copy, does not collide with the unique (resume_id, version) index.
 */
export async function insertResumeSnapshot(input: {
  resumeId: string;
  data: unknown;
  metadata: unknown;
  templateSlug: string;
  title: string;
  industry: string;
  changeDescription: string;
}) {
  const [highest] = await db
    .select({ value: max(resumeVersion.version) })
    .from(resumeVersion)
    .where(eq(resumeVersion.resumeId, input.resumeId));

  let version = nextSnapshotVersion(
    highest?.value == null ? [] : [highest.value],
  );

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const [created] = await db
        .insert(resumeVersion)
        .values({
          id: nanoid(),
          resumeId: input.resumeId,
          version,
          data: input.data,
          metadata: input.metadata,
          templateSlug: input.templateSlug,
          title: input.title,
          industry: input.industry,
          changeDescription: input.changeDescription,
        })
        .returning();
      return created;
    } catch (error) {
      if (!isUniqueViolation(error) || attempt === 4) throw error;
      version += 1;
    }
  }

  throw new Error("Failed to allocate a snapshot version");
}
