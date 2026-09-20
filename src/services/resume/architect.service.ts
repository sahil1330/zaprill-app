import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import db from "@/db";
import { resume, resumeChat, resumeVersion } from "@/db/schema";
import { enrichResumeMetadata } from "@/lib/inference";
import { normalizeResumeData, normalizeResumeMetadata } from "@/lib/resume";
import { clampResumeData } from "@/lib/resume/sanitize";
import type { ResumeData, ResumeMetadata } from "@/types/resume";

export type ResumeArchitectContext = {
  resumeId: string;
  userId: string;
  versioned?: boolean;
  onUsage?: (usage: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  }) => void;
};

export type ResumeArchitectSnapshot = {
  data: ResumeData;
  metadata: ResumeMetadata;
  templateSlug: string;
  title: string;
  targetRole: string | null;
  version: number;
  change: string;
};

export type ListSection =
  | "work"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "languages"
  | "volunteer"
  | "awards"
  | "publications"
  | "references";

type ResumeRow = {
  id: string;
  userId: string;
  title: string;
  templateSlug: string;
  targetRole: string | null;
  data: unknown;
  metadata: unknown;
  version: number;
};

function toSnapshot(row: ResumeRow, change: string): ResumeArchitectSnapshot {
  return {
    data: clampResumeData(normalizeResumeData(row.data)),
    metadata: normalizeResumeMetadata(row.metadata),
    templateSlug: row.templateSlug,
    title: row.title,
    targetRole: row.targetRole,
    version: row.version,
    change,
  };
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function loadResumeRow(
  ctx: ResumeArchitectContext,
): Promise<ResumeRow> {
  const [row] = await db
    .select({
      id: resume.id,
      userId: resume.userId,
      title: resume.title,
      templateSlug: resume.templateSlug,
      targetRole: resume.targetRole,
      data: resume.data,
      metadata: resume.metadata,
      version: resume.version,
    })
    .from(resume)
    .where(and(eq(resume.id, ctx.resumeId), eq(resume.userId, ctx.userId)))
    .limit(1);

  if (!row) {
    throw new Error("Resume not found");
  }

  return row;
}

export async function getResumeOverview(ctx: ResumeArchitectContext) {
  const row = await loadResumeRow(ctx);
  const data = normalizeResumeData(row.data);
  const metadata = normalizeResumeMetadata(row.metadata);

  return {
    title: row.title,
    templateSlug: row.templateSlug,
    targetRole: row.targetRole,
    version: row.version,
    basics: {
      name: data.basics.name,
      label: data.basics.label,
      email: data.basics.email,
      phone: data.basics.phone,
      url: data.basics.url,
      location: data.basics.location,
      summary: stripHtml(data.basics.summary).slice(0, 800),
      profiles: data.basics.profiles,
    },
    work: data.work.map((item) => ({
      id: item.id,
      company: item.company,
      position: item.position,
      startDate: item.startDate,
      endDate: item.endDate,
      location: item.location,
      highlights: item.highlights,
    })),
    education: data.education.map((item) => ({
      id: item.id,
      institution: item.institution,
      studyType: item.studyType,
      area: item.area,
      startDate: item.startDate,
      endDate: item.endDate,
      score: item.score,
    })),
    skills: data.skills.map((item) => ({
      id: item.id,
      name: item.name,
      level: item.level,
      keywords: item.keywords,
    })),
    projects: data.projects.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      highlights: item.highlights,
      keywords: item.keywords,
    })),
    certifications: data.certifications.map((item) => ({
      id: item.id,
      name: item.name,
      issuer: item.issuer,
      date: item.date,
    })),
    languages: data.languages.map((item) => ({
      id: item.id,
      language: item.language,
      fluency: item.fluency,
    })),
    volunteer: data.volunteer.map((item) => ({
      id: item.id,
      organization: item.organization,
      position: item.position,
    })),
    awards: data.awards.map((item) => ({
      id: item.id,
      title: item.title,
      awarder: item.awarder,
    })),
    publications: data.publications.map((item) => ({
      id: item.id,
      name: item.name,
      publisher: item.publisher,
    })),
    references: data.references.map((item) => ({
      id: item.id,
      name: item.name,
    })),
    sectionVisibility: metadata.sectionVisibility,
    sectionOrder: metadata.sectionOrder,
  };
}

async function snapshotBeforeMutate(
  ctx: ResumeArchitectContext,
  row: ResumeRow,
): Promise<void> {
  if (ctx.versioned) return;
  try {
    await db.insert(resumeVersion).values({
      id: nanoid(),
      resumeId: ctx.resumeId,
      version: row.version,
      data: row.data as ResumeData,
      metadata: row.metadata as ResumeMetadata,
      changeDescription: "Before Resume Architect edits",
    });
  } catch (error) {
    console.warn("[resume-architect] version snapshot skipped:", error);
  }
  ctx.versioned = true;
}

export async function mutateResume(
  ctx: ResumeArchitectContext,
  change: string,
  mutator: (input: {
    data: ResumeData;
    metadata: ResumeMetadata;
    title: string;
    templateSlug: string;
    targetRole: string | null;
  }) => {
    data?: ResumeData;
    metadata?: ResumeMetadata;
    title?: string;
    templateSlug?: string;
    targetRole?: string | null;
  },
): Promise<ResumeArchitectSnapshot> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const row = await loadResumeRow(ctx);
    if (attempt === 0) {
      await snapshotBeforeMutate(ctx, row);
    }

    const current = {
      data: clampResumeData(normalizeResumeData(row.data)),
      metadata: normalizeResumeMetadata(row.metadata),
      title: row.title,
      templateSlug: row.templateSlug,
      targetRole: row.targetRole,
    };
    const next = mutator(current);

    const updateValues: Record<string, unknown> = {
      updatedAt: new Date(),
      version: row.version + 1,
    };
    if (next.data !== undefined) {
      updateValues.data = enrichResumeMetadata(clampResumeData(next.data));
    }
    if (next.metadata !== undefined) {
      updateValues.metadata = next.metadata;
    }
    if (next.title !== undefined) updateValues.title = next.title;
    if (next.templateSlug !== undefined) {
      updateValues.templateSlug = next.templateSlug;
    }
    if (next.targetRole !== undefined) {
      updateValues.targetRole = next.targetRole;
    }

    const [updated] = await db
      .update(resume)
      .set(updateValues)
      .where(
        and(
          eq(resume.id, ctx.resumeId),
          eq(resume.userId, ctx.userId),
          eq(resume.version, row.version),
        ),
      )
      .returning({
        id: resume.id,
        userId: resume.userId,
        title: resume.title,
        templateSlug: resume.templateSlug,
        targetRole: resume.targetRole,
        data: resume.data,
        metadata: resume.metadata,
        version: resume.version,
      });

    if (updated) {
      return toSnapshot(updated, change);
    }
  }

  throw new Error(
    "Could not save the resume because it changed in another session. Ask the user to retry.",
  );
}

export function emptyListItem(section: ListSection): Record<string, unknown> {
  switch (section) {
    case "work":
      return {
        id: nanoid(),
        company: "",
        position: "",
        website: "",
        startDate: "",
        endDate: null,
        summary: "",
        highlights: [],
        location: "",
      };
    case "education":
      return {
        id: nanoid(),
        institution: "",
        url: "",
        area: "",
        studyType: "",
        startDate: "",
        endDate: null,
        score: "",
        courses: [],
      };
    case "skills":
      return {
        id: nanoid(),
        name: "",
        level: "",
        keywords: [],
        category: "technical",
      };
    case "projects":
      return {
        id: nanoid(),
        name: "",
        description: "",
        highlights: [],
        url: "",
        githubUrl: "",
        startDate: "",
        endDate: null,
        keywords: [],
      };
    case "certifications":
      return {
        id: nanoid(),
        name: "",
        issuer: "",
        date: "",
        url: "",
      };
    case "languages":
      return { id: nanoid(), language: "", fluency: "" };
    case "volunteer":
      return {
        id: nanoid(),
        organization: "",
        position: "",
        url: "",
        startDate: "",
        endDate: null,
        summary: "",
        highlights: [],
      };
    case "awards":
      return { id: nanoid(), title: "", date: "", awarder: "", summary: "" };
    case "publications":
      return {
        id: nanoid(),
        name: "",
        publisher: "",
        releaseDate: "",
        url: "",
        summary: "",
      };
    case "references":
      return { id: nanoid(), name: "", reference: "" };
  }
}

function revealSection(
  metadata: ResumeMetadata,
  section: ListSection | "summary",
): ResumeMetadata {
  if (section === "summary") {
    return {
      ...metadata,
      sectionVisibility: { ...metadata.sectionVisibility, summary: true },
    };
  }
  if (section in metadata.sectionVisibility) {
    return {
      ...metadata,
      sectionVisibility: {
        ...metadata.sectionVisibility,
        [section]: true,
      },
    };
  }
  return metadata;
}

export async function upsertListItem(
  ctx: ResumeArchitectContext,
  section: ListSection,
  item: Record<string, unknown>,
  id?: string,
): Promise<ResumeArchitectSnapshot> {
  return mutateResume(ctx, `Updated ${section}`, ({ data, metadata }) => {
    const list = [
      ...(data[section] as unknown as Array<Record<string, unknown>>),
    ];
    const existingIndex = id ? list.findIndex((entry) => entry.id === id) : -1;

    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...item, id };
    } else {
      list.push({ ...emptyListItem(section), ...item, id: id ?? nanoid() });
    }

    return {
      data: { ...data, [section]: list } as ResumeData,
      metadata: revealSection(metadata, section),
    };
  });
}

export async function removeListItem(
  ctx: ResumeArchitectContext,
  section: ListSection,
  id: string,
): Promise<ResumeArchitectSnapshot> {
  return mutateResume(ctx, `Removed ${section} entry`, ({ data }) => {
    const list = (data[section] as Array<{ id: string }>).filter(
      (entry) => entry.id !== id,
    );
    return { data: { ...data, [section]: list } as ResumeData };
  });
}

export async function loadChatMessages(
  resumeId: string,
  userId: string,
): Promise<unknown[]> {
  const [row] = await db
    .select({ messages: resumeChat.messages })
    .from(resumeChat)
    .where(
      and(eq(resumeChat.resumeId, resumeId), eq(resumeChat.userId, userId)),
    )
    .limit(1);

  return Array.isArray(row?.messages) ? row.messages : [];
}

export async function saveChatMessages(params: {
  resumeId: string;
  userId: string;
  messages: unknown[];
}): Promise<void> {
  const [existing] = await db
    .select({ id: resumeChat.id })
    .from(resumeChat)
    .where(
      and(
        eq(resumeChat.resumeId, params.resumeId),
        eq(resumeChat.userId, params.userId),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .update(resumeChat)
      .set({ messages: params.messages, updatedAt: new Date() })
      .where(eq(resumeChat.id, existing.id));
    return;
  }

  await db.insert(resumeChat).values({
    id: nanoid(),
    resumeId: params.resumeId,
    userId: params.userId,
    messages: params.messages,
  });
}
