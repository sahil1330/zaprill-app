import { tool } from "ai";
import { z } from "zod";
import { reviewStoredResume } from "@/lib/resume-knowledge";
import { guidanceFor } from "@/lib/resume-knowledge/prompt";
import {
  CAREER_STAGES,
  RESUME_FIELDS,
  RESUME_REGIONS,
} from "@/lib/resume-knowledge/types";
import { searchResumeWeb } from "@/lib/resume-knowledge/web-search";
import {
  getResumeOverview,
  type ListSection,
  loadResumeRow,
  mutateResume,
  type ResumeArchitectContext,
  removeListItem,
  upsertListItem,
} from "@/services/resume/architect.service";

const listSectionSchema = z.enum([
  "work",
  "education",
  "skills",
  "projects",
  "certifications",
  "languages",
  "volunteer",
  "awards",
  "publications",
  "references",
]);

const templateSlugs = [
  "minimalist",
  "tech-stack",
  "executive-pro",
  "creative-portfolio",
  "modern-split",
] as const;

const visibilitySchema = z.object({
  summary: z.boolean().optional(),
  work: z.boolean().optional(),
  education: z.boolean().optional(),
  skills: z.boolean().optional(),
  projects: z.boolean().optional(),
  certifications: z.boolean().optional(),
  languages: z.boolean().optional(),
  volunteer: z.boolean().optional(),
  awards: z.boolean().optional(),
  publications: z.boolean().optional(),
  references: z.boolean().optional(),
});

async function currentReview(ctx: ResumeArchitectContext) {
  const row = await loadResumeRow(ctx);
  return reviewStoredResume({
    data: row.data,
    metadata: row.metadata,
    templateSlug: row.templateSlug,
    targetRole: row.targetRole,
    industry: row.industry,
    profile: ctx.profile,
  });
}

export function createResumeArchitectTools(ctx: ResumeArchitectContext) {
  return {
    getResume: tool({
      description:
        "Read the current resume and its layout review. Call this before editing so you use real ids. The review lists field, stage, page estimate, violations, and citations. Never invent employers, dates, or metrics.",
      inputSchema: z.object({}),
      execute: async () => {
        const [overview, review] = await Promise.all([
          getResumeOverview(ctx),
          currentReview(ctx),
        ]);
        return {
          ...overview,
          review: {
            field: review.audience.field,
            stage: review.audience.stage,
            region: review.audience.region,
            years: review.audience.years,
            estimatedPages: review.estimatedPages,
            maxPages: review.maxPages,
            violations: review.violations.map((item) => ({
              id: item.id,
              severity: item.severity,
              message: item.message,
            })),
            recommended: review.recommended,
            citations: review.citations,
          },
        };
      },
    }),

    updateProfile: tool({
      description:
        "Update contact details, professional headline, summary, resume title, or target role. Pass only fields that should change. Do not invent email, phone, or location.",
      inputSchema: z.object({
        title: z.string().max(120).optional(),
        targetRole: z.string().max(120).optional(),
        name: z.string().max(100).optional(),
        label: z.string().max(100).optional(),
        email: z.string().max(200).optional(),
        phone: z.string().max(30).optional(),
        url: z.string().max(300).optional(),
        city: z.string().max(100).optional(),
        region: z.string().max(100).optional(),
        countryCode: z.string().max(5).optional(),
        summary: z
          .string()
          .max(5000)
          .optional()
          .describe("Plain text professional summary. Do not invent metrics."),
      }),
      execute: async (input) => {
        return mutateResume(ctx, "Updated profile", ({ data, metadata }) => {
          const nextBasics = { ...data.basics };
          if (input.name !== undefined) nextBasics.name = input.name;
          if (input.label !== undefined) nextBasics.label = input.label;
          if (input.email !== undefined) nextBasics.email = input.email;
          if (input.phone !== undefined) nextBasics.phone = input.phone;
          if (input.url !== undefined) nextBasics.url = input.url;
          if (input.summary !== undefined) nextBasics.summary = input.summary;
          if (
            input.city !== undefined ||
            input.region !== undefined ||
            input.countryCode !== undefined
          ) {
            nextBasics.location = {
              ...nextBasics.location,
              ...(input.city !== undefined ? { city: input.city } : {}),
              ...(input.region !== undefined ? { region: input.region } : {}),
              ...(input.countryCode !== undefined
                ? { countryCode: input.countryCode }
                : {}),
            };
          }

          return {
            data: { ...data, basics: nextBasics },
            metadata:
              input.summary !== undefined
                ? {
                    ...metadata,
                    sectionVisibility: {
                      ...metadata.sectionVisibility,
                      summary: true,
                    },
                  }
                : metadata,
            title: input.title,
            targetRole: input.targetRole,
          };
        });
      },
    }),

    upsertEntry: tool({
      description:
        "Add or update one resume entry. Pass id from getResume to update. Omit id to add. Required fields: work needs company+position; education needs institution; skills need name; projects need name. Put accomplishment bullets in highlights. Never invent numbers.",
      inputSchema: z.object({
        section: listSectionSchema,
        id: z
          .string()
          .optional()
          .describe("Existing entry id from getResume. Omit to create."),
        item: z
          .record(z.unknown())
          .describe(
            "Fields for the entry. Work: company, position, startDate, endDate, location, highlights[]. Education: institution, studyType, area, startDate, endDate, score. Skills: name, level, keywords[]. Projects: name, description, highlights[], url, githubUrl, keywords[]. Certifications: name, issuer, date. Publications: name, publisher, releaseDate, summary. Use only facts the user gave.",
          ),
      }),
      execute: async ({ section, id, item }) => {
        return upsertListItem(ctx, section as ListSection, item, id);
      },
    }),

    removeEntry: tool({
      description: "Delete one resume entry by section and id from getResume.",
      inputSchema: z.object({
        section: listSectionSchema,
        id: z.string(),
      }),
      execute: async ({ section, id }) => {
        return removeListItem(ctx, section as ListSection, id);
      },
    }),

    setDesign: tool({
      description:
        "Change template, colors, type, margins, or which sections appear. Use when the user asks for a specific look. Font size stays between 10 and 12. Margins stay between 13 and 25mm.",
      inputSchema: z.object({
        templateSlug: z.enum(templateSlugs).optional(),
        theme: z
          .object({
            primary: z.string().optional(),
            accent: z.string().optional(),
            text: z.string().optional(),
            background: z.string().optional(),
          })
          .optional(),
        sectionVisibility: visibilitySchema.optional(),
        sectionOrder: z.array(z.string()).optional(),
        fontFamily: z.string().max(40).optional(),
        fontSize: z.number().min(10).max(12).optional(),
        marginMm: z.number().min(13).max(25).optional(),
        pageFormat: z.enum(["a4", "letter"]).optional(),
      }),
      execute: async (input) => {
        return mutateResume(ctx, "Updated design", ({ metadata }) => ({
          templateSlug: input.templateSlug,
          metadata: {
            ...metadata,
            theme: { ...metadata.theme, ...input.theme },
            sectionVisibility: {
              ...metadata.sectionVisibility,
              ...input.sectionVisibility,
            },
            sectionOrder: input.sectionOrder ?? metadata.sectionOrder,
            typography: {
              ...metadata.typography,
              font: {
                family: input.fontFamily ?? metadata.typography.font.family,
                size: input.fontSize ?? metadata.typography.font.size,
              },
            },
            page: {
              format: input.pageFormat ?? metadata.page.format,
              margin: input.marginMm ?? metadata.page.margin,
            },
          },
        }));
      },
    }),

    applyRecommendedLayout: tool({
      description:
        "Set the template, section order, font, and margins recommended for this person's field and career stage. Call when the user asks to fix layout, length, order, or ATS structure.",
      inputSchema: z.object({}),
      execute: async () => {
        const review = await currentReview(ctx);
        const applied = await mutateResume(
          ctx,
          "Applied recommended layout",
          ({ metadata }) => ({
            templateSlug: review.recommended.templateSlug,
            metadata: {
              ...metadata,
              typography: {
                ...metadata.typography,
                font: {
                  family: review.recommended.fontFamily,
                  size: review.recommended.fontSize,
                },
              },
              page: {
                ...metadata.page,
                margin: review.recommended.marginMm,
              },
              sectionOrder: review.recommended.sectionOrder,
            },
          }),
        );
        return {
          version: applied.version,
          templateSlug: review.recommended.templateSlug,
          sectionOrder: review.recommended.sectionOrder,
          fontFamily: review.recommended.fontFamily,
          fontSize: review.recommended.fontSize,
          marginMm: review.recommended.marginMm,
          citations: review.citations,
        };
      },
    }),

    lookupGuidance: tool({
      description:
        "Read the cited rules for another field, stage, or region when the opening slice is the wrong one.",
      inputSchema: z.object({
        field: z.enum(RESUME_FIELDS).optional(),
        stage: z.enum(CAREER_STAGES).optional(),
        region: z.enum(RESUME_REGIONS).optional(),
      }),
      execute: async (input) => {
        const review = await currentReview(ctx);
        const audience = {
          ...review.audience,
          ...(input.field ? { field: input.field } : {}),
          ...(input.stage ? { stage: input.stage } : {}),
          ...(input.region ? { region: input.region } : {}),
        };
        return { guidance: guidanceFor(audience) };
      },
    }),

    web_search: tool({
      description:
        "Search the web when the knowledge slice lacks a field-specific or current fact. Cite the returned URLs. Do not call this for rules already in the slice.",
      inputSchema: z.object({
        query: z.string().min(3).max(300),
      }),
      execute: async ({ query }) => {
        const hit = await searchResumeWeb(query);
        ctx.onToolUsage?.({
          inputTokens: hit.usage.inputTokens,
          outputTokens: hit.usage.outputTokens,
          totalTokens: hit.usage.totalTokens,
          success: !hit.unavailable,
          metadata: {
            tool: "web_search",
            query,
            searchContextSize: "low",
            unavailable: hit.unavailable ?? false,
          },
        });
        return {
          answer: hit.answer,
          sources: hit.sources,
          unavailable: hit.unavailable ?? false,
        };
      },
    }),
  };
}
