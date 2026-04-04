import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import db from "@/db";
import { resumeAnalysis } from "@/db/schema";
import { ParsedResume, JobMatch, SkillGap, RoadmapItem } from "@/types";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { resume, jobs, skillGaps, roadmap } = body as {
      resume: ParsedResume;
      jobs: JobMatch[];
      skillGaps: SkillGap[];
      roadmap: RoadmapItem[];
    };

    if (!resume) {
      return NextResponse.json({ error: "Missing resume data" }, { status: 400 });
    }

    const totalJobsFound = jobs?.length || 0;
    
    // Calculate average and top match score
    let topMatchScore = 0;
    let sumMatchScore = 0;
    
    if (jobs && jobs.length > 0) {
      for (const job of jobs) {
        if (job.matchPercentage > topMatchScore) {
          topMatchScore = job.matchPercentage;
        }
        sumMatchScore += job.matchPercentage;
      }
    }
    
    const avgMatchScore = totalJobsFound > 0 ? Math.round(sumMatchScore / totalJobsFound) : 0;

    const analysisId = crypto.randomUUID();

    await db.insert(resumeAnalysis).values({
      id: analysisId,
      userId: session.user.id,
      resumeName: resume.name,
      resumeEmail: resume.email,
      resumePhone: resume.phone,
      resumeLocation: resume.location,
      resumeSkills: resume.skills,
      inferredJobTitles: resume.inferredJobTitles,
      resumeRaw: resume,
      jobs: jobs || [],
      skillGaps: skillGaps || [],
      roadmap: roadmap || [],
      searchLocation: resume.location, 
      totalJobsFound,
      topMatchScore,
      avgMatchScore,
    });

    return NextResponse.json({ success: true, analysisId });
  } catch (error: any) {
    console.error("Save analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save analysis" },
      { status: 500 }
    );
  }
}
