import { headers } from "next/headers";
import { NextResponse } from "next/server";
import {
  getCoreMetrics,
  getEventMetrics,
  getRealtimeUsers,
} from "@/lib/admin/ga4";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30");

  try {
    const [coreData, eventData, realtimeUsers] = await Promise.all([
      getCoreMetrics(days),
      getEventMetrics(days),
      getRealtimeUsers(),
    ]);

    return NextResponse.json({ coreData, eventData, realtimeUsers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
