import { NextResponse } from "next/server";
import { extractSkillsFromText } from "@/lib/skill-extractor";
import type { JobListing } from "@/types";

export const maxDuration = 120;

interface AdzunaResult {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string;
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
  contract_time?: string; // "full_time" | "part_time"
  created: string; // ISO date
}

function buildSalaryString(result: AdzunaResult): string | undefined {
  if (result.salary_min && result.salary_max) {
    return `INR ${result.salary_min.toLocaleString()} – ${result.salary_max.toLocaleString()}`;
  }
  return undefined;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { skills, jobTitles, location, experienceYears } = body as {
      skills: string[];
      jobTitles: string[];
      location?: string;
      experienceYears?: number;
    };

    if (!skills?.length || !jobTitles?.length) {
      return NextResponse.json(
        { error: "Skills and job titles are required" },
        { status: 400 },
      );
    }

    const { headers } = await import("next/headers");
    const { auth } = await import("@/lib/auth");
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { getActiveSubscription } = await import(
      "@/services/billing/subscription.service"
    );
    const db = (await import("@/db")).default;
    const { user } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    const activeSub = await getActiveSubscription(userId);
    const isPro = !!activeSub;

    if (!isPro) {
      const [currentUser] = await db
        .select({
          dailySearchesCount: user.monthlySearchesCount, // column reused for daily tracking
          searchesResetDate: user.searchesResetDate,
        })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      if (!currentUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const now = new Date();
      const lastReset = currentUser.searchesResetDate
        ? new Date(currentUser.searchesResetDate)
        : null;

      // Reset if last reset was on a different calendar day (midnight boundary)
      const oneDayMs = 24 * 60 * 60 * 1000;
      let newCount = currentUser.dailySearchesCount || 0;
      let shouldReset = false;

      if (!lastReset || now.getTime() - lastReset.getTime() > oneDayMs) {
        newCount = 0;
        shouldReset = true;
      }

      if (newCount >= 2) {
        return NextResponse.json({ error: "LIMIT_REACHED" }, { status: 403 });
      }

      await db
        .update(user)
        .set({
          monthlySearchesCount: newCount + 1,
          ...(shouldReset ? { searchesResetDate: now } : {}),
        })
        .where(eq(user.id, userId));
    }

    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;
    if (!appId || !appKey || appId === "your_app_id_here") {
      return NextResponse.json(
        {
          error: "ADZUNA_NOT_CONFIGURED",
          details:
            "Get free credentials at https://developer.adzuna.com/ and add ADZUNA_APP_ID + ADZUNA_APP_KEY to .env.local",
        },
        { status: 500 },
      );
    }

    // Refine queries based on experience if provided
    const queries =
      experienceYears !== undefined
        ? jobTitles.map((title) => {
            if (experienceYears >= 12) return `Lead ${title}`;
            if (experienceYears >= 7) return `Senior ${title}`;
            // For entry-level (<=1 year), "Junior" is too restrictive on Adzuna India.
            return title;
          })
        : jobTitles;

    // Build a flat list of all (title, page) combos and fetch them all in parallel
    const fetchPage = async (
      title: string,
      page: number,
    ): Promise<AdzunaResult[]> => {
      const url = new URL(
        `https://api.adzuna.com/v1/api/jobs/in/search/${page}`,
      );
      url.searchParams.set("app_id", appId);
      url.searchParams.set("app_key", appKey);
      url.searchParams.set("what", title);
      url.searchParams.set("results_per_page", "50");
      url.searchParams.set("max_days_old", "30");
      url.searchParams.set("content-type", "application/json");
      if (location) url.searchParams.set("where", location);

      console.log(
        `[search-jobs] Fetching "${title}" p${page} → ${url.toString().replace(appKey, "***")}`,
      );

      const t0 = Date.now();
      const res = await fetch(url.toString());
      console.log(
        `[search-jobs] "${title}" p${page} → HTTP ${res.status} (${Date.now() - t0}ms)`,
      );

      if (!res.ok) {
        const text = await res.text();
        console.error(`[search-jobs] Error ${res.status}:`, text.slice(0, 200));
        return [];
      }

      const data = await res.json();
      const results: AdzunaResult[] = data?.results ?? [];
      console.log(
        `[search-jobs] "${title}" p${page} → ${results.length} results`,
      );
      return results;
    };

    // Fire all title×page fetches simultaneously
    const billingDone = Date.now();
    const pageTasks = queries.flatMap((title) => [
      fetchPage(title, 1),
      fetchPage(title, 2),
    ]);
    const settled = await Promise.allSettled(pageTasks);
    console.log(
      `[search-jobs] All fetches done in ${Date.now() - billingDone}ms`,
    );

    const allJobs: JobListing[] = [];
    const seenIds = new Set<string>();

    for (const outcome of settled) {
      if (outcome.status === "rejected") {
        console.error("[search-jobs] Fetch rejected:", outcome.reason);
        continue;
      }
      for (const result of outcome.value) {
        if (seenIds.has(result.id)) continue;
        seenIds.add(result.id);

        const requiredSkills = extractSkillsFromText(result.description ?? "");

        allJobs.push({
          id: result.id,
          title: result.title,
          company: result.company?.display_name ?? "Unknown",
          location: result.location?.display_name ?? "India",
          description: result.description ?? "",
          requiredSkills,
          url: result.redirect_url,
          salary: buildSalaryString(result),
          postedAt: result.created,
          employmentType:
            result.contract_time === "full_time"
              ? "FULLTIME"
              : result.contract_time === "part_time"
                ? "PARTTIME"
                : undefined,
          isRemote:
            result.title.toLowerCase().includes("remote") ||
            result.description.toLowerCase().includes("remote"),
          publisher: "Adzuna",
        });
      }
    }

    // Deduplicate by title + company
    const deduplicated = allJobs.filter(
      (job, idx, arr) =>
        arr.findIndex(
          (j) => j.title === job.title && j.company === job.company,
        ) === idx,
    );

    console.log(`[search-jobs] Returning ${deduplicated.length} jobs`);
    return NextResponse.json({ jobs: deduplicated });
  } catch (error) {
    console.error("Job search error:", error);
    return NextResponse.json(
      { error: "Failed to search jobs" },
      { status: 500 },
    );
  }
}
