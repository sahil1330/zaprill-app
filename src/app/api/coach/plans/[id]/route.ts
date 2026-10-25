import { NextResponse } from "next/server";
import { requireApiUserId } from "@/lib/api-session";
import { coachErrorResponse } from "@/lib/coach/http";
import { coachNotFound } from "@/services/coach/errors";
import { getPlanView } from "@/services/coach/program.service";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const authResult = await requireApiUserId();
    if (!authResult.ok) return authResult.response;
    const { id } = await params;
    const view = await getPlanView(authResult.userId, id);
    if (!view.plan || !view.program) throw coachNotFound("Plan not found");
    return NextResponse.json({
      tier: view.tier,
      allowance: view.allowance,
      program: view.program,
      plan: view.plan,
    });
  } catch (error) {
    return coachErrorResponse(error);
  }
}
