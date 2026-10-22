import { NextResponse } from "next/server";
import { requireApiUserId } from "@/lib/api-session";
import {
  careerErrorResponse,
  readJson,
  readResourceId,
} from "@/lib/career/http";
import { careerSkillWriteSchema } from "@/lib/validations/career-profile";
import {
  deleteCareerSkill,
  upsertCareerSkill,
} from "@/services/career/career-profile.service";

export async function PUT(req: Request) {
  try {
    const authResult = await requireApiUserId();
    if (!authResult.ok) return authResult.response;
    const body = careerSkillWriteSchema.parse(await readJson(req));
    const profile = await upsertCareerSkill(authResult.userId, body);
    return NextResponse.json({ profile });
  } catch (error) {
    return careerErrorResponse(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const authResult = await requireApiUserId();
    if (!authResult.ok) return authResult.response;
    const idResult = readResourceId(req, "Skill");
    if (!idResult.ok) return idResult.response;
    const profile = await deleteCareerSkill(authResult.userId, idResult.id);
    return NextResponse.json({ profile });
  } catch (error) {
    return careerErrorResponse(error);
  }
}
