/**
 * Fields that live on `resume` but were omitted from `resume_version`.
 * Older snapshots leave these null so restore does not invent a template.
 */
export type SnapshotIdentity = {
  templateSlug: string;
  title: string;
  industry: string;
};

export function snapshotIdentity(row: {
  templateSlug?: string | null;
  title?: string | null;
  industry?: string | null;
}): SnapshotIdentity {
  return {
    templateSlug: row.templateSlug?.trim() || "minimalist",
    title: row.title?.trim() || "Untitled Resume",
    industry: row.industry?.trim() || "technology",
  };
}

/** Only apply identity that was actually stored on the snapshot row. */
export function restoreIdentityPatch(version: {
  templateSlug?: string | null;
  title?: string | null;
  industry?: string | null;
}): Partial<SnapshotIdentity> {
  const patch: Partial<SnapshotIdentity> = {};
  const templateSlug = version.templateSlug?.trim();
  const title = version.title?.trim();
  const industry = version.industry?.trim();
  if (templateSlug) patch.templateSlug = templateSlug;
  if (title) patch.title = title;
  if (industry) patch.industry = industry;
  return patch;
}
