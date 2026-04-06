import { generateText } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { matchJobsToResume, aggregateSkillGaps } from "@/lib/match-engine";
import type { JobListing } from "@/types";
import { hackclub } from "@/lib/hackClubClient";

export const maxDuration = 60;

const RoadmapItemSchema = z.object({
  skill: z.string(),
  priority: z.enum(["high", "medium", "low"]),
  estimatedTime: z.string(),
  why: z.string(),
  resources: z.array(
    z.object({
      type: z.enum(["course", "book", "tutorial", "documentation", "practice"]),
      name: z.string(),
      url: z.string().optional(),
      free: z.boolean(),
      estimatedTime: z.string().optional(),
    }),
  ).max(4),
  category: z.enum(["language", "framework", "database", "cloud", "tool", "soft", "other"]),
});

const RoadmapSchema = z.object({ roadmap: z.array(RoadmapItemSchema) });

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

    const { text, usage } = await generateText({
      model: hackclub("google/gemini-2.5-flash"),
      prompt: `You are a senior tech career coach. Respond ONLY with valid JSON — no markdown, no explanation, no code fences.

A candidate has these skills: ${resumeSkills.join(", ")}
They are targeting roles like: ${(inferredJobTitles ?? []).join(", ")}

They are MISSING these skills that appear frequently in job listings:
${topGaps.map((g) => `- ${g.skill} (needed in ${g.frequency} out of ${jobs.length} job listings, priority: ${g.priority})`).join("\n")}

Return a JSON object with this exact shape:
{
  "roadmap": [
    {
      "skill": "skill name",
      "priority": "high" | "medium" | "low",
      "estimatedTime": "e.g. 2-4 weeks",
      "why": "why this skill matters for their target roles",
      "resources": [
        { "type": "course" | "book" | "tutorial" | "documentation" | "practice", "name": "resource name", "url": "https://...", "free": true, "estimatedTime": "optional" }
      ],
      "category": "language" | "framework" | "database" | "cloud" | "tool" | "soft" | "other"
    }
  ]
}

Include an entry for each missing skill. Prefer free resources. Use real, working URLs.`,
    });
    console.log("analyze gaps usage", usage);
    // Parse JSON out of the model response (handles thinking tokens / extra text)
    let roadmap: z.infer<typeof RoadmapSchema>["roadmap"] = [];
    try {
      const jsonStr = extractJSON(text) ?? text;
      const parsed = RoadmapSchema.safeParse(JSON.parse(jsonStr));
      if (parsed.success) {
        roadmap = parsed.data.roadmap;
      } else {
        console.warn("Roadmap schema validation failed:", parsed.error.issues);
      }
    } catch (parseErr) {
      console.warn("Could not parse roadmap JSON:", parseErr, "\nRaw:", text.slice(0, 300));
      // Non-fatal — return empty roadmap rather than crashing
    }

    return NextResponse.json({
      matchedJobs: matchedJobs.slice(0, 100),
      skillGaps,
      roadmap,
    });
  } catch (error) {
    console.error("Gap analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze skill gaps" },
      { status: 500 },
    );
  }
}

