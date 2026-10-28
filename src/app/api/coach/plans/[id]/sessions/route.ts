import { NextResponse } from "next/server";
import { tutorSessionMigrationBody } from "@/services/coach/tutor-chat";

export const maxDuration = 60;

export async function POST() {
  return NextResponse.json(tutorSessionMigrationBody(), { status: 410 });
}
