import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { matchJobsToResume, aggregateSkillGaps } from "@/lib/match-engine";
import type { JobListing } from "@/types";

export const maxDuration = 60;

const RoadmapSchema = z.object({
  roadmap: z.array(
    z.object({
      skill: z.string(),
      priority: z.enum(["high", "medium", "low"]),
      estimatedTime: z.string().describe('e.g. "2-4 weeks", "1-2 months"'),
      why: z
        .string()
        .describe("Why this skill matters for the user's target roles"),
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
    }),
  ),
});

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

    // Only generate roadmap for top 8 missing skills to save tokens
    const topGaps = skillGaps.slice(0, 8);

    if (topGaps.length === 0) {
      return NextResponse.json({ matchedJobs, skillGaps: [], roadmap: [] });
    }

    const { output } = await generateText({
      model: google("gemini-2.5-flash"),
      output: Output.object({ schema: RoadmapSchema }),
      prompt: `You are a senior tech career coach with deep knowledge of the software industry.

A candidate has these skills: ${resumeSkills.join(", ")}
They are targeting roles like: ${(inferredJobTitles ?? []).join(", ")}

They are MISSING these skills that appear frequently in job listings:
${topGaps.map((g) => `- ${g.skill} (needed in ${g.frequency} out of ${jobs.length} job listings, priority: ${g.priority})`).join("\n")}

For each missing skill, provide:
1. A realistic time estimate to become job-ready (not expert)
2. Why it matters specifically for their target roles
3. 2-4 specific, high-quality learning resources with real URLs

Focus on practical, actionable guidance. Prefer free/affordable resources. Be specific and encouraging.`,
    });

    return NextResponse.json({
      matchedJobs: matchedJobs.slice(0, 30),
      skillGaps,
      roadmap: output?.roadmap ?? [],
    });
  } catch (error) {
    console.error("Gap analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze skill gaps" },
      { status: 500 },
    );
  }
}
