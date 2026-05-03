import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import db from "@/db";
import {
  resumeAnalysis,
  resume as resumeTable,
  userProfile,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import type { JobMatch, ParsedResume, RoadmapItem, SkillGap } from "@/types";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { resume, jobs, skillGaps, roadmap, advice } = body as {
      resume: ParsedResume;
      jobs: JobMatch[];
      skillGaps: SkillGap[];
      roadmap: RoadmapItem[];
      advice: string;
    };

    if (!resume) {
      return NextResponse.json(
        { error: "Missing resume data" },
        { status: 400 },
      );
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

    const avgMatchScore =
      totalJobsFound > 0 ? Math.round(sumMatchScore / totalJobsFound) : 0;

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
      advice: advice || "",
      searchLocation: resume.location,
      totalJobsFound,
      topMatchScore,
      avgMatchScore,
    });

    // Also update the permanent user profile with the reviewed data
    try {
      await db
        .insert(userProfile)
        .values({
          id: crypto.randomUUID(),
          userId: session.user.id,
          resumeRaw: resume,
        })
        .onConflictDoUpdate({
          target: userProfile.userId,
          set: {
            resumeRaw: resume,
            updatedAt: new Date(),
          },
        });

      // 2. Also update the actual resume table to keep it in sync
      const profile = await db.query.userProfile.findFirst({
        where: eq(userProfile.userId, session.user.id),
      });

      if (profile?.primaryResumeId) {
        await db
          .update(resumeTable)
          .set({
            data: resume,
            updatedAt: new Date(),
          })
          .where(eq(resumeTable.id, profile.primaryResumeId));
      } else {
        // If somehow they don't have a primary resume, create one
        const newResumeId = nanoid();
        await db.insert(resumeTable).values({
          id: newResumeId,
          userId: session.user.id,
          title: "Imported Resume",
          slug: `${session.user.id.slice(0, 8)}-${nanoid(6)}`,
          data: resume,
          status: "complete",
        });

        await db
          .update(userProfile)
          .set({ primaryResumeId: newResumeId })
          .where(eq(userProfile.userId, session.user.id));
      }
    } catch (profileErr) {
      console.error(
        "Failed to update user profile/resume during save:",
        profileErr,
      );
      // Don't fail the whole request if profile update fails
    }

    return NextResponse.json({ success: true, analysisId });
  } catch (error: any) {
    console.error("Save analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save analysis" },
      { status: 500 },
    );
  }
}
