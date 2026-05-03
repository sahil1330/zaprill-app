import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import db from "@/db";
import { userProfile } from "@/db/schema";
import { auth } from "@/lib/auth";

export default async function PrimaryResumePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const profile = await db.query.userProfile.findFirst({
    where: eq(userProfile.userId, session.user.id),
  });

  if (profile?.primaryResumeId) {
    redirect(`/resumes/${profile.primaryResumeId}`);
  }

  // Fallback to the resumes list if no primary resume exists
  redirect("/resumes");
}
