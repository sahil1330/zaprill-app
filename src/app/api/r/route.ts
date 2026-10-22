import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { learningResources, resourceClicks } from "@/db/schema";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Learning-resource click redirect: GET /api/r?id=<resourceId>
 * Public resumes are a different URL: /r/{slug} and GET /api/resumes/public/[slug].
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const [resource] = await db
      .select()
      .from(learningResources)
      .where(eq(learningResources.id, id));

    if (!resource || !resource.isActive) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Get user session if available
    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });

    const ipAddress =
      reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip");
    const userAgent = reqHeaders.get("user-agent");

    // Track the click asynchronously to avoid blocking the redirect
    Promise.all([
      db.insert(resourceClicks).values({
        id: `clk_${nanoid(10)}`,
        resourceId: id,
        userId: session?.user?.id || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      }),
      // Increment the click count on the resource itself
      db.execute(
        `UPDATE "learning_resources" SET "click_count" = "click_count" + 1 WHERE "id" = '${id}'`,
      ),
    ]).catch((err) => console.error("[RESOURCE_CLICK_TRACKING_ERROR]", err));

    return NextResponse.redirect(resource.url);
  } catch (error) {
    console.error("[RESOURCE_REDIRECT_ERROR]", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
