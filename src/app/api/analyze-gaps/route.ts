import { generateText } from "ai";
import { and, desc, eq, gt } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import db from "@/db";
import { resumeAnalysis } from "@/db/schema";
import { auth } from "@/lib/auth";
import { hackclub } from "@/lib/hackClubClient";
import { aggregateSkillGaps, matchJobsToResume } from "@/lib/match-engine";
import type { JobListing, RoadmapItem } from "@/types";

export const maxDuration = 60;

const RoadmapItemSchema = z.object({
  skill: z.string(),
  priority: z.enum(["high", "medium", "low"]),
  estimatedTime: z.string(),
  why: z.string(),
  resources: z
    .array(
      z.object({
        type: z.enum([
          "course",
          "book",
          "tutorial",
          "documentation",
          "practice",
        ]),
        name: z.string(),
        url: z.string().optional(),
        free: z.boolean(),
        estimatedTime: z.string().optional(),
      }),
    )
    .max(4),
  category: z.enum([
    "language",
    "framework",
    "database",
    "cloud",
    "tool",
    "soft",
    "other",
  ]),
});

const AnalysisResponseSchema = z.object({
  advice: z.string(),
  relevantSkillGaps: z.array(z.string()),
  roadmap: z.array(RoadmapItemSchema),
});
/** Extract the first JSON object/array block from a model response */
function extractJSON(text: string): string | null {
  // Find the outermost { ... } block
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

function arraysMatch(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a]
    .map((s) => s.toLowerCase().trim())
    .sort()
    .join("|");
  const sortedB = [...b]
    .map((s) => s.toLowerCase().trim())
    .sort()
    .join("|");
  return sortedA === sortedB;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resumeSkills, jobs, inferredJobTitles } = body as {
      resumeSkills: string[];
      jobs: JobListing[];
      inferredJobTitles?: string[];
    };

    if (!resumeSkills?.length) {
      return NextResponse.json(
        { error: "Resume skills are required" },
        { status: 400 },
      );
    }

    // If no jobs were found, gracefully return empty results
    if (!jobs?.length) {
      return NextResponse.json({ matchedJobs: [], skillGaps: [], roadmap: [] });
    }

    // Compute match scores for all jobs
    const matchedJobs = matchJobsToResume(resumeSkills, jobs);

    // Aggregate skill gaps across all jobs
    const skillGaps = aggregateSkillGaps(resumeSkills, matchedJobs);

    // --- CACHING LOGIC ---
    // Check if we can reuse a recent analysis for this user
    let roadmap: RoadmapItem[] = [];
    let advice = "";
    let filteredGaps = skillGaps;
    let usedCache = false;

    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (session?.user) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Fetch recent analyses for this user
        const recentAnalyses = await db
          .select()
          .from(resumeAnalysis)
          .where(
            and(
              eq(resumeAnalysis.userId, session.user.id),
              gt(resumeAnalysis.createdAt, sevenDaysAgo),
            ),
          )
          .orderBy(desc(resumeAnalysis.createdAt))
          .limit(10);

        // Find matches based on skills and titles
        const match = recentAnalyses.find(
          (a) =>
            arraysMatch(a.resumeSkills ?? [], resumeSkills) &&
            arraysMatch(a.inferredJobTitles ?? [], inferredJobTitles ?? []),
        );

        if (match && match.roadmap && match.advice) {
          console.log("[analyze-gaps] Cache Hit! Reusing analysis:", match.id);
          roadmap = match.roadmap as RoadmapItem[];
          advice = match.advice;
          usedCache = true;

          // Still need to filter the current skillGaps based on the cached relevant gaps
          const relevantSkillMap = new Set(
            roadmap.map((s) => s.skill.toLowerCase().trim()),
          );
          filteredGaps = skillGaps.filter((g) =>
            relevantSkillMap.has(g.skill.toLowerCase().trim()),
          );
        }
      }
    } catch (cacheErr) {
      console.error("[analyze-gaps] Cache lookup failed:", cacheErr);
    }

    if (!usedCache) {
      // Pass top 20 missing skills to the LLM so it can filter intelligently
      const topGaps = skillGaps.slice(0, 20);

      if (topGaps.length === 0) {
        return NextResponse.json({
          matchedJobs: matchedJobs.slice(0, 100),
          skillGaps: [],
          roadmap: [],
          advice: "",
        });
      }

      const { text, usage } = await generateText({
        model: hackclub("google/gemini-2.5-flash"),
        prompt: `You are a senior tech career coach. Respond ONLY with valid JSON — no markdown, no explanation, no code fences.

A candidate has these skills: ${resumeSkills.join(", ")}
They are targeting roles like: ${(inferredJobTitles ?? []).join(", ")}

They appear to be missing these skills based on naive job matching:
${topGaps.map((g) => `- ${g.skill} (frequency: ${g.frequency} out of ${jobs.length} jobs, priority: ${g.priority})`).join("\n")}

YOUR TASK:
1. Identify which of these missing skills are ACTUALLY relevant for the candidate to learn.
   - STRICTLY EXCLUDE foundational or basic web skills if the user has advanced frontend frameworks. For example, if they have React, Angular, Vue, Node.js or Next.js, you MUST NOT include "HTML", "CSS", "HTML5", "CSS3", or "Javascript".
   - STRICTLY EXCLUDE generic soft skills and methodologies (e.g., exclude "Communication", "Agile", "Scrum", "Teamwork") as these clutter the roadmap.
   - EXCLUDE alternative tech stacks that clearly don't fit their primary profile (e.g., exclude "Java", "PHP", "C#" if they are a strong "Node.js" dev, unless they are explicitly standard for the roles).
   - KEEP skills that are genuine, distinct, and valuable additions to their current stack (e.g., Docker, AWS, Redis).
2. Generate an overall "advice" string providing strategic guidance on their career, what to focus on, and why certain skills were skipped.
3. Choose the most relevant missing skills from the list for the roadmap.
4. Add these chosen true gaps to the "relevantSkillGaps" array.
5. Generate a learning roadmap for the chosen relevant skills.

Return ONLY a JSON object with this exact shape:
{
  "advice": "strategic guidance for their career based on their profile",
  "relevantSkillGaps": ["skill1", "skill2", ...],
  "roadmap": [
    {
      "skill": "skill name",
      "priority": "high" | "medium" | "low",
      "estimatedTime": "e.g. 2-4 weeks",
      "why": "why this skill matters specifically for them",
      "resources": [
        { "type": "course" | "book" | "tutorial" | "documentation" | "practice", "name": "resource name", "url": "https://...", "free": true, "estimatedTime": "optional" }
      ],
      "category": "language" | "framework" | "database" | "cloud" | "tool" | "soft" | "other"
    }
  ]
}

Prefer free resources. Use real, working URLs.`,
      });
      console.log("analyze gaps usage", usage);

      try {
        const jsonStr = extractJSON(text) ?? text;
        const parsed = AnalysisResponseSchema.safeParse(JSON.parse(jsonStr));
        if (parsed.success) {
          roadmap = parsed.data.roadmap as RoadmapItem[];
          advice = parsed.data.advice;

          // Filter the original skillGaps based on the LLM's selected relevant skills
          const relevantSkillMap = new Set(
            parsed.data.relevantSkillGaps.map((s) => s.toLowerCase().trim()),
          );
          filteredGaps = skillGaps.filter((g) =>
            relevantSkillMap.has(g.skill.toLowerCase().trim()),
          );
        } else {
          console.warn(
            "Analysis response schema validation failed:",
            parsed.error.issues,
          );
        }
      } catch (parseErr) {
        console.warn(
          "Could not parse roadmap JSON:",
          parseErr,
          "\nRaw:",
          text.slice(0, 300),
        );
        // Non-fatal — return empty roadmap rather than crashing
      }
    }

    return NextResponse.json({
      matchedJobs: matchedJobs.slice(0, 100),
      skillGaps: filteredGaps,
      roadmap,
      advice,
    });
  } catch (error) {
    console.error("Gap analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze skill gaps" },
      { status: 500 },
    );
  }
}
