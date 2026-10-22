import { NextResponse } from "next/server";
import { requireApiUserId } from "@/lib/api-session";
import { careerErrorResponse, readJson } from "@/lib/career/http";
import { careerSyncSchema } from "@/lib/validations/career-profile";
import { syncCareerProfileFromResume } from "@/services/career/career-profile.service";

export async function POST(req: Request) {
  try {
    const authResult = await requireApiUserId();
    if (!authResult.ok) return authResult.response;
    const body = careerSyncSchema.parse(await readJson(req));
    const profile = await syncCareerProfileFromResume(authResult.userId, {
      refreshSegment: body.refreshSegment,
    });
    return NextResponse.json({ profile });
  } catch (error) {
    return careerErrorResponse(error);
  }
}
