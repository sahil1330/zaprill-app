import { google } from "@ai-sdk/google";
import { type FilePart, generateText, Output, type TextPart } from "ai";
import { and, eq, ne } from "drizzle-orm";
import mammoth from "mammoth";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import WordExtractor from "word-extractor";
import { z } from "zod";
import db from "@/db";
import { resume, userProfile } from "@/db/schema";
import { auth } from "@/lib/auth";
import { hackclub } from "@/lib/hackClubClient";
import { normalizeResumeData } from "@/lib/resume";
import { normalizeSkillList } from "@/lib/skill-extractor";
import { logAiUsage } from "@/services/ai/usage.service";
import type { ResumeData } from "@/types/resume";
import { DEFAULT_RESUME_METADATA } from "@/types/resume";

export const maxDuration = 60;

/** Model identifier — single source of truth for this route. */
const MODEL = "google/gemini-2.5-flash" as const;

const ResumeSchema = z.object({
  isResume: z
    .boolean()
    .describe("Whether the provided content is actually a resume/CV"),
  basics: z.object({
    name: z.string(),
    label: z.string().describe('e.g. "Software Engineer"'),
    email: z.string(),
    phone: z.string().optional(),
    url: z.string().optional(),
    location: z.object({
      city: z.string().optional(),
      region: z.string().optional(),
      countryCode: z.string().optional(),
    }),
    summary: z.string().optional(),
    profiles: z
      .array(
        z.object({
          network: z.string(),
          url: z.string(),
          username: z.string().optional(),
        }),
      )
      .optional(),
  }),
  work: z.array(
    z.object({
      company: z.string(),
      position: z.string(),
      website: z.string().optional(),
      startDate: z.string().describe('ISO format "YYYY-MM"'),
      endDate: z.string().nullable().describe('ISO format "YYYY-MM" or null'),
      summary: z.string().optional(),
      highlights: z.array(z.string()),
      location: z.string().optional(),
    }),
  ),
  education: z.array(
    z.object({
      institution: z.string(),
      url: z.string().optional(),
      area: z.string().describe('Field of study, e.g. "Computer Science"'),
      studyType: z.string().describe('e.g. "Bachelor"'),
      startDate: z.string(),
      endDate: z.string().nullable(),
      score: z.string().optional(),
      courses: z.array(z.string()),
    }),
  ),
  skills: z.array(
    z.object({
      name: z.string().describe('Skill group name, e.g. "Frontend"'),
      keywords: z.array(z.string()),
      category: z.string().optional(),
    }),
  ),
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      highlights: z.array(z.string()),
      url: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().nullable().optional(),
    }),
  ),
  certifications: z.array(
    z.object({
      name: z.string(),
      issuer: z.string(),
      date: z.string().optional(),
      url: z.string().optional(),
    }),
  ),
  languages: z.array(
    z.object({
      language: z.string(),
      fluency: z.string(),
    }),
  ),
  inferredJobTitles: z
    .array(z.string())
    .describe("List of potential job titles for the candidate"),
  totalYearsOfExperience: z
    .number()
    .describe("Total years of professional experience"),
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No resume file provided" },
        { status: 400 },
      );
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    const isDoc = file.name.endsWith(".doc");
    const isDocx = file.name.endsWith(".docx");
    const isPdf = file.name.endsWith(".pdf") || file.type === "application/pdf";
    const isTxt = file.name.endsWith(".txt") || file.type === "text/plain";

    if (
      !allowedTypes.includes(file.type) &&
      !file.name.match(/\.(pdf|doc|docx|txt)$/i)
    ) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload PDF, DOC, DOCX, or TXT" },
        { status: 400 },
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const content: (TextPart | FilePart)[] = [];

    if (isPdf) {
      content.push({
        type: "file",
        data: new Uint8Array(arrayBuffer),
        mediaType: "application/pdf",
      });
    } else {
      let extractedText = "";

      if (isDocx) {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      } else if (isDoc) {
        const extractor = new WordExtractor();
        const doc = await extractor.extract(buffer);
        extractedText = doc.getBody();
      } else if (isTxt) {
        extractedText = buffer.toString("utf-8");
      }

      if (!extractedText) {
        throw new Error("Could not extract text from file");
      }

      content.push({
        type: "text",
        text: `RESUME CONTENT:\n${extractedText}`,
      });
    }

    content.push({
      type: "text",
      text: `You are an expert HR analyst and resume parser. 

FIRST: Determine if the provided content is actually a resume or CV. If it is just random text, garbage data, a different type of document (like a cookbook, a general book, or a news article), or totally unreadable, set "isResume" to false.

IF IT IS A RESUME, extract ALL information with high accuracy. 

For skills, be comprehensive and GROUP them into logical categories (e.g., "Languages", "Frameworks", "Databases", "Cloud & DevOps", "Tools"). Each category should have a list of specific keywords. Include every programming language, framework, library, tool, database, cloud platform, and methodology mentioned.

For location, look for the candidate's current residence (City and State/Country).

For inferredJobTitles, think about what roles this person would realistically apply for based on their entire background — include 3-6 specific, searchable job titles (e.g., "Senior React Developer", "Full Stack Engineer", "Node.js Backend Developer").

For totalYearsOfExperience, sum up the candidate's professional career duration in years, rounding to the nearest whole number.

For profiles, extract all professional links (LinkedIn, GitHub, Portfolio, Personal Site, Twitter, etc.) as a list of objects with "network" (the platform name) and "url". Look for these in the contact or about section.

Be precise and thorough. Do not make up information that isn't in the resume.`,
    });

    const llmStart = Date.now();
    const { output: parsed, usage } = await generateText({
      model: hackclub(MODEL),
      output: Output.object({ schema: ResumeSchema }),
      messages: [
        {
          role: "user",
          content,
        },
      ],
    });
    const latencyMs = Date.now() - llmStart;

    if (!parsed) {
      return NextResponse.json(
        { error: "Failed to extract resume data" },
        { status: 500 },
      );
    }

    if (!parsed.isResume) {
      return NextResponse.json(
        {
          error:
            "The uploaded file does not appear to be a valid resume. Please upload a PDF or Word document containing your professional history.",
        },
        { status: 400 },
      );
    }

    // Resolve session for usage logging + profile save (single lookup)
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id ?? null;

    // Log token usage — fire-and-forget
    logAiUsage({
      userId,
      action: "parse_resume",
      model: MODEL,
      promptTokens: usage.inputTokens ?? 0,
      completionTokens: usage.outputTokens ?? 0,
      totalTokens: usage.totalTokens ?? 0,
      latencyMs,
      success: true,
    });

    // Transform parsed data into ResumeData format with IDs
    const finalResumeData: ResumeData = {
      basics: {
        name: parsed.basics.name || "",
        label: parsed.basics.label || "",
        email: parsed.basics.email || "",
        location: {
          city: parsed.basics.location?.city || "",
          region: parsed.basics.location?.region || "",
          countryCode: parsed.basics.location?.countryCode || "",
        },
        summary: parsed.basics.summary || "",
        phone: parsed.basics.phone || "",
        url: parsed.basics.url || "",
        picture: null,
        profiles: (parsed.basics.profiles || []).map((p) => ({
          network: p.network,
          url: p.url,
          username: p.username || p.url.split("/").pop() || "",
        })),
      },
      socialProfiles: (parsed.basics.profiles || []).map((p) => ({
        platform: p.network,
        url: p.url,
      })),
      work: parsed.work.map((w) => ({
        ...w,
        id: nanoid(),
        website: w.website || "",
        summary: w.summary || "",
        location: w.location || "",
      })),
      education: parsed.education.map((e) => ({
        ...e,
        id: nanoid(),
        url: e.url || "",
        score: e.score || "",
      })),
      skills: parsed.skills.map((s) => ({
        id: nanoid(),
        name: s.name,
        keywords: s.keywords,
        level: "Intermediate",
        category: s.category || "technical",
      })),
      projects: parsed.projects.map((p) => ({
        ...p,
        id: nanoid(),
        url: p.url || "",
        githubUrl: "",
        startDate: p.startDate || "",
        endDate: p.endDate || null,
        keywords: [],
      })),
      certifications: parsed.certifications.map((c) => ({
        ...c,
        id: nanoid(),
        date: c.date || "",
        url: c.url || "",
      })),
      languages: parsed.languages.map((l) => ({
        ...l,
        id: nanoid(),
      })),
      awards: [],
      publications: [],
      references: [],
      volunteer: [],
      customSections: [],
      // Extra fields for analysis/onboarding
      inferredJobTitles: parsed.inferredJobTitles || [],
      totalYearsOfExperience: parsed.totalYearsOfExperience || 0,
    };

    // Save to user profile and resume table
    try {
      if (session?.user) {
        const userId = session.user.id;

        // 1. Check for existing profile
        const existingProfile = await db.query.userProfile.findFirst({
          where: eq(userProfile.userId, userId),
        });

        let resumeId = existingProfile?.primaryResumeId;

        // If no primary ID in profile, check if ANY resume exists for this user
        if (!resumeId) {
          const firstResume = await db.query.resume.findFirst({
            where: eq(resume.userId, userId),
          });
          resumeId = firstResume?.id;
        }

        if (resumeId) {
          // Update existing resume
          await db
            .update(resume)
            .set({
              data: finalResumeData,
              title: `Imported Resume (${new Date().toLocaleDateString()})`,
              updatedAt: new Date(),
            })
            .where(eq(resume.id, resumeId));
        } else {
          // Create new resume
          resumeId = nanoid();
          await db.insert(resume).values({
            id: resumeId,
            userId,
            title: `Imported Resume (${new Date().toLocaleDateString()})`,
            slug: `${userId.slice(0, 8)}-${nanoid(6)}`,
            data: finalResumeData,
            metadata: DEFAULT_RESUME_METADATA,
            status: "complete",
          });
        }

        // 2. Cleanup: Remove any other resumes this user might have to enforce "one user, one resume"
        await db
          .delete(resume)
          .where(and(eq(resume.userId, userId), ne(resume.id, resumeId)));

        // 3. Link/Update profile
        await db
          .insert(userProfile)
          .values({
            id: crypto.randomUUID(),
            userId,
            resumeRaw: finalResumeData,
            primaryResumeId: resumeId,
            onboardingStatus: "completed",
          })
          .onConflictDoUpdate({
            target: userProfile.userId,
            set: {
              resumeRaw: finalResumeData,
              primaryResumeId: resumeId,
              onboardingStatus: "completed",
              updatedAt: new Date(),
            },
          });
      }
    } catch (saveErr) {
      console.error("Failed to save user profile and resume:", saveErr);
    }

    return NextResponse.json(normalizeResumeData(finalResumeData));
  } catch (error) {
    console.error("Resume parsing error:", error);
    return NextResponse.json(
      { error: "Failed to parse resume. Please try again." },
      { status: 500 },
    );
  }
}
