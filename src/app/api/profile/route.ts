import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import db from "@/db";
import { resume, user, userProfile } from "@/db/schema";
import { auth } from "@/lib/auth";
import { enrichResumeMetadata } from "@/lib/inference";
import { normalizeResumeData } from "@/lib/resume";
import { ensureUserProfile } from "@/lib/user-profile";

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

    // 2. Update User Profile Table
    const profileUpdates: Record<string, any> = { updatedAt: new Date() };
    if (onboardingStatus) profileUpdates.onboardingStatus = onboardingStatus;
    if (primaryResumeId) profileUpdates.primaryResumeId = primaryResumeId;
    // Allow null to clear salary, but skip if key is not present in body
    if ("currentSalary" in body) {
      profileUpdates.currentSalary =
        currentSalary != null
          ? parseInt(String(currentSalary), 10) || null
          : null;
    }

    if (Object.keys(profileUpdates).length > 1) {
      await ensureUserProfile(session.user.id, {
        onboardingStatus: onboardingStatus || undefined,
        primaryResumeId: primaryResumeId || undefined,
      });
      if ("currentSalary" in body) {
        await db
          .update(userProfile)
          .set({
            currentSalary:
              currentSalary != null
                ? parseInt(String(currentSalary), 10) || null
                : null,
            updatedAt: new Date(),
          })
          .where(eq(userProfile.userId, session.user.id));
      }
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
