import { NextResponse } from "next/server";
import { requireApiUserId } from "@/lib/api-session";
import { careerErrorResponse, readJson } from "@/lib/career/http";
import { recordVerifiedSkillSchema } from "@/lib/validations/career-profile";
import { recordVerifiedSkill } from "@/services/career/career-profile.service";

export async function POST(req: Request) {
  try {
    const authResult = await requireApiUserId();
    if (!authResult.ok) return authResult.response;
    const body = recordVerifiedSkillSchema.parse(await readJson(req));
    const profile = await recordVerifiedSkill(authResult.userId, body);
    return NextResponse.json({ profile });
  } catch (error) {
    return careerErrorResponse(error);
  }
}
