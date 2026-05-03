import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import db from "@/db";
import { resume, user, userProfile } from "@/db/schema";
import { auth } from "@/lib/auth";
import { normalizeResumeData } from "@/lib/resume";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await db.query.userProfile.findFirst({
      where: eq(userProfile.userId, session.user.id),
    });

    if (!profile) {
      return NextResponse.json({ profile: null });
    }

    // If we have a primaryResumeId, fetch that resume's data
    let resumeData = profile.resumeRaw;

    if (profile.primaryResumeId) {
      const primaryResume = await db.query.resume.findFirst({
        where: eq(resume.id, profile.primaryResumeId),
      });
      if (primaryResume) {
        resumeData = primaryResume.data;
      }
    }

    // Normalize the data to ensure it doesn't crash the frontend
    const normalizedResume = normalizeResumeData(resumeData);

    return NextResponse.json({
      profile: {
        ...profile,
        resumeData: normalizedResume, // Send the clean normalized object
        resumeRaw: normalizedResume, // For backward compatibility
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
    const { name, onboardingStatus, primaryResumeId, resumeRaw } = body;

    // 1. Update User Table (Name)
    if (name) {
      await db
        .update(user)
        .set({ name, updatedAt: new Date() })
        .where(eq(user.id, session.user.id));
    }

    // 2. Update User Profile Table
    if (onboardingStatus || primaryResumeId) {
      await db
        .insert(userProfile)
        .values({
          id: crypto.randomUUID(),
          userId: session.user.id,
          onboardingStatus: onboardingStatus || "not_started",
          primaryResumeId: primaryResumeId || null,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: userProfile.userId,
          set: {
            ...(onboardingStatus && { onboardingStatus }),
            ...(primaryResumeId && { primaryResumeId }),
            updatedAt: new Date(),
          },
        });
    }

    // 3. Update Resume Table if resumeRaw is provided and we have a primaryResumeId
    if (resumeRaw) {
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
            data: resumeRaw,
            updatedAt: new Date(),
          })
          .where(eq(resume.id, targetResumeId));
      } else {
        // Fallback: If no primaryResumeId, update legacy resumeRaw in userProfile
        await db
          .update(userProfile)
          .set({ resumeRaw, updatedAt: new Date() })
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
