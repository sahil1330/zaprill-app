import { generateText } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizeSkillList } from "@/lib/skill-extractor";
import { hackclub } from "@/lib/hackClubClient";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

export const maxDuration = 60;

const ResumeSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  summary: z.string().optional(),
  skills: z.array(z.string()),
  experience: z.array(
    z.object({
      role: z.string(),
      company: z.string(),
      duration: z.string().optional(),
      description: z.string(),
      skillsUsed: z.array(z.string()),
    }),
  ),
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      technologies: z.array(z.string()),
      url: z.string().optional(),
    }),
  ),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      year: z.number().optional(),
      field: z.string().optional(),
    }),
  ),
  inferredJobTitles: z.array(z.string()),
});

/** Extract the first JSON object from a model response (handles thinking tokens / preamble) */
function extractJSON(text: string): string | null {
  const start = text.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

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

    // Extract plain text from the PDF (works for all models, not just vision ones)
    let resumeText = "";
    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      resumeText = new TextDecoder().decode(buffer);
    } else {
      try {
        const pdf = await pdfParse(buffer);
        resumeText = pdf.text;
      } catch {
        return NextResponse.json(
          { error: "Could not read the PDF. Please ensure it is not scanned/image-only." },
          { status: 400 },
        );
      }
    }

    if (!resumeText.trim()) {
      return NextResponse.json(
        { error: "Resume appears to be empty or is an image-only PDF." },
        { status: 400 },
      );
    }

    const { text } = await generateText({
      model: hackclub("qwen/qwen3-32b"),
      prompt: `You are an expert HR analyst and resume parser. Respond ONLY with valid JSON — no markdown, no explanation, no code fences.

Extract ALL information from this resume with high accuracy.

For skills: include every programming language, framework, library, tool, database, cloud platform, and methodology mentioned anywhere.

For inferredJobTitles: 3-6 specific, searchable job titles this person would realistically apply for (e.g., "Senior React Developer", "Full Stack Engineer").

Return a JSON object with this EXACT shape:
{
  "name": "full name",
  "email": "email@example.com",
  "phone": "optional phone",
  "summary": "optional professional summary",
  "skills": ["skill1", "skill2"],
  "experience": [
    { "role": "Job Title", "company": "Company", "duration": "Jan 2022 – Present", "description": "what they did", "skillsUsed": ["skill"] }
  ],
  "projects": [
    { "name": "Project Name", "description": "what it does", "technologies": ["tech"], "url": "optional url" }
  ],
  "education": [
    { "degree": "B.Tech", "institution": "University Name", "year": 2023, "field": "Computer Science" }
  ],
  "inferredJobTitles": ["Title 1", "Title 2"]
}

RESUME TEXT:
${resumeText.slice(0, 12000)}`,
    });

    let parsed: z.infer<typeof ResumeSchema> | null = null;
    try {
      const jsonStr = extractJSON(text) ?? text;
      const result = ResumeSchema.safeParse(JSON.parse(jsonStr));
      if (result.success) {
        parsed = result.data;
      } else {
        console.warn("Resume schema validation failed:", result.error.issues);
        // Try a lenient parse so partial data still works
        parsed = JSON.parse(jsonStr);
      }
    } catch (parseErr) {
      console.error("Could not parse resume JSON:", parseErr, "\nRaw:", text.slice(0, 300));
      return NextResponse.json(
        { error: "Failed to extract resume data. Please try again." },
        { status: 500 },
      );
    }

    if (!parsed) {
      return NextResponse.json(
        { error: "Failed to extract resume data" },
        { status: 500 },
      );
    }

    // Normalize and deduplicate skills across all sections
    const allSkills = normalizeSkillList([
      ...(parsed.skills ?? []),
      ...(parsed.experience ?? []).flatMap((e) => e.skillsUsed ?? []),
      ...(parsed.projects ?? []).flatMap((p) => p.technologies ?? []),
    ]);

    return NextResponse.json({ ...parsed, skills: allSkills });
  } catch (error) {
    console.error("Resume parsing error:", error);
    return NextResponse.json(
      { error: "Failed to parse resume. Please try again." },
      { status: 500 },
    );
  }
}
