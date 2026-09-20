import { tool } from "ai";
import { z } from "zod";
import {
  getResumeOverview,
  type ListSection,
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

export function createResumeArchitectTools(ctx: ResumeArchitectContext) {
  return {
    getResume: tool({
      description:
        "Read the current resume. Call this before editing so you use real ids, dates, and wording. Never invent employers, dates, or metrics.",
      inputSchema: z.object({}),
      execute: async () => getResumeOverview(ctx),
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
            "Fields for the entry. Work: company, position, startDate, endDate, location, highlights[]. Education: institution, studyType, area, startDate, endDate, score. Skills: name, level, keywords[]. Projects: name, description, highlights[], keywords[].",
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
        "Change template, colors, or which sections appear. Use only when the user asks to restyle the resume.",
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
          },
        }));
      },
    }),
  };
}
