import { NextResponse } from "next/server";
import { requireApiUserId } from "@/lib/api-session";
import {
  careerErrorResponse,
  readJson,
  readResourceId,
} from "@/lib/career/http";
import { careerTargetWriteSchema } from "@/lib/validations/career-profile";
import {
  deleteCareerTarget,
  upsertCareerTarget,
} from "@/services/career/career-profile.service";

export async function PUT(req: Request) {
  try {
    const authResult = await requireApiUserId();
    if (!authResult.ok) return authResult.response;
    const body = careerTargetWriteSchema.parse(await readJson(req));
    const profile = await upsertCareerTarget(authResult.userId, body);
    return NextResponse.json({ profile });
  } catch (error) {
    return careerErrorResponse(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const authResult = await requireApiUserId();
    if (!authResult.ok) return authResult.response;
    const idResult = readResourceId(req, "Target role");
    if (!idResult.ok) return idResult.response;
    const profile = await deleteCareerTarget(authResult.userId, idResult.id);
    return NextResponse.json({ profile });
  } catch (error) {
    return careerErrorResponse(error);
  }
}
