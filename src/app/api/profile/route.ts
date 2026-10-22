import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import db from "@/db";
import { resume, user, userProfile } from "@/db/schema";
import { auth } from "@/lib/auth";
import { enrichResumeMetadata } from "@/lib/inference";
import { normalizeResumeData } from "@/lib/resume";
import { ensureUserProfile } from "@/lib/user-profile";
import { setCurrentAnnualSalary } from "@/services/career/career-profile.service";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await ensureUserProfile(session.user.id);

    if (!profile) {
      return NextResponse.json({ profile: null });
    }

    // If we have a primaryResumeId, fetch that resume's data
    let resumeData = profile.resumeRaw;
    let lastAtsScore = null;

    if (profile.primaryResumeId) {
      const primaryResume = await db.query.resume.findFirst({
        where: eq(resume.id, profile.primaryResumeId),
      });
      if (primaryResume) {
        resumeData = primaryResume.data;
        lastAtsScore = primaryResume.lastAtsScore;
      }
    }

    // Normalize the data to ensure it doesn't crash the frontend
    const normalizedResume = normalizeResumeData(resumeData);

    return NextResponse.json({
      profile: {
        ...profile,
        resumeData: normalizedResume, // Send the clean normalized object
        resumeRaw: normalizedResume, // For backward compatibility
        lastAtsScore,
      },
    });
  } catch (error: any) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve profile" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      onboardingStatus,
      primaryResumeId,
      resumeRaw,
      currentSalary,
    } = body;

    // 1. Update User Table (Name)
    if (name) {
      await db
        .update(user)
        .set({ name, updatedAt: new Date() })
        .where(eq(user.id, session.user.id));
    }

    // Salary goes through the career profile so user_profile.current_salary
    // and the career file cannot diverge. Annual CTC, whole INR.
    if ("currentSalary" in body) {
      const parsed =
        currentSalary != null
          ? Number.parseInt(String(currentSalary), 10)
          : null;
      const annual = parsed != null && Number.isFinite(parsed) ? parsed : null;
      await setCurrentAnnualSalary(session.user.id, annual);
    }

    // 2. Update User Profile Table. Salary is handled above.
    if (onboardingStatus || primaryResumeId) {
      await ensureUserProfile(session.user.id, {
        onboardingStatus: onboardingStatus || undefined,
        primaryResumeId: primaryResumeId || undefined,
      });
    }

    // 3. Update Resume Table if resumeRaw is provided and we have a primaryResumeId
    if (resumeRaw) {
      // Normalize and enrich data
      const normalizedResume = normalizeResumeData(resumeRaw);
      const enrichedResume = enrichResumeMetadata(normalizedResume);
      let targetResumeId = primaryResumeId;

      if (!targetResumeId) {
        const profile = await db.query.userProfile.findFirst({
          where: eq(userProfile.userId, session.user.id),
        });
        targetResumeId = profile?.primaryResumeId;
      }

      if (targetResumeId) {
        await db
          .update(resume)
          .set({
            data: enrichedResume,
            updatedAt: new Date(),
          })
          .where(eq(resume.id, targetResumeId));
      } else {
        // Fallback: If no primaryResumeId, update legacy resumeRaw in userProfile
        await db
          .update(userProfile)
          .set({ resumeRaw: enrichedResume, updatedAt: new Date() })
          .where(eq(userProfile.userId, session.user.id));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 },
    );
  }
}
