import type { Metadata } from "next";
import PublicResumeView from "./public-resume-view";

export const metadata: Metadata = {
  title: "Shared resume | Zaprill",
  robots: { index: false, follow: false },
};

/**
 * Public resume page at /r/{slug}.
 * GET /api/r remains the learning-resource click redirect and is not this route.
 */
export default function PublicResumePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <PublicResumeView params={params} />;
}
