import { NextResponse } from "next/server";
import { requireApiUserId } from "@/lib/api-session";
import {
  careerErrorResponse,
  readJson,
  readResourceId,
} from "@/lib/career/http";
import { careerExperienceWriteSchema } from "@/lib/validations/career-profile";
import {
  deleteCareerExperience,
  upsertCareerExperience,
} from "@/services/career/career-profile.service";

export async function PUT(req: Request) {
  try {
    const authResult = await requireApiUserId();
    if (!authResult.ok) return authResult.response;
    const body = careerExperienceWriteSchema.parse(await readJson(req));
    const profile = await upsertCareerExperience(authResult.userId, body);
    return NextResponse.json({ profile });
  } catch (error) {
    return careerErrorResponse(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const authResult = await requireApiUserId();
    if (!authResult.ok) return authResult.response;
    const idResult = readResourceId(req, "Experience record");
    if (!idResult.ok) return idResult.response;
    const profile = await deleteCareerExperience(
      authResult.userId,
      idResult.id,
    );
    return NextResponse.json({ profile });
  } catch (error) {
    return careerErrorResponse(error);
  }
}
