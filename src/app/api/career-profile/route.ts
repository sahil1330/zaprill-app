import { NextResponse } from "next/server";
import { requireApiUserId } from "@/lib/api-session";
import { careerErrorResponse, readJson } from "@/lib/career/http";
import { careerProfilePatchSchema } from "@/lib/validations/career-profile";
import {
  ensureCareerProfile,
  updateCareerProfile,
} from "@/services/career/career-profile.service";

export async function GET() {
  try {
    const authResult = await requireApiUserId();
    if (!authResult.ok) return authResult.response;
    const profile = await ensureCareerProfile(authResult.userId);
    return NextResponse.json({ profile });
  } catch (error) {
    return careerErrorResponse(error);
  }
}

export async function PUT(req: Request) {
  try {
    const authResult = await requireApiUserId();
    if (!authResult.ok) return authResult.response;
    const body = careerProfilePatchSchema.parse(await readJson(req));
    const profile = await updateCareerProfile(authResult.userId, body);
    return NextResponse.json({ profile });
  } catch (error) {
    return careerErrorResponse(error);
  }
}
