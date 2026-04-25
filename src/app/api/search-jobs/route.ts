import { NextResponse } from "next/server";
import { extractSkillsFromText } from "@/lib/skill-extractor";
import type { JobListing } from "@/types";

export const maxDuration = 240;

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

function optimizeJobTitle(title: string): string {
  // Remove "Stack" to broaden results without forcing "Developer"
  // e.g., "Full Stack Designer" -> "Full Designer"
  return title
    .replace(/\b(MERN|MEAN|LAMP|JAM|Full|Web)\s+Stack\b/gi, "$1")
    .replace(/\bStack\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
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

    // Normalize location: strip ", India" or ", IN" as they are redundant on the /in/ endpoint
    const normalizedLocation = location
      ? location.replace(/,\s*(India|IN)$/i, "").trim()
      : undefined;

    // Refine queries based on experience if provided
    const queries = (jobTitles || []).map((t) => {
      let title = optimizeJobTitle(t);
      if (experienceYears !== undefined) {
        if (experienceYears >= 12) title = `Lead ${title}`;
        else if (experienceYears >= 7) title = `Senior ${title}`;
      }
      return title;
    });

    // Fire all title×page fetches simultaneously
    const billingDone = Date.now();

    const fetchPage = async (
      query: string,
      page: number,
    ): Promise<AdzunaResult[]> => {
      const url = new URL(
        `https://api.adzuna.com/v1/api/jobs/in/search/${page}`,
      );
      url.searchParams.set("app_id", appId);
      url.searchParams.set("app_key", appKey);
      url.searchParams.set("what", query);
      url.searchParams.set("results_per_page", "50");
      url.searchParams.set("max_days_old", "30");
      url.searchParams.set("content-type", "application/json");
      if (normalizedLocation) url.searchParams.set("where", normalizedLocation);

      const fullUrl = url.toString();

      console.log(
        `[search-jobs] Fetching "${query}" p${page} → ${fullUrl.replace(appKey, "***")}`,
      );

      const t0 = Date.now();
      try {
        // Add a small artificial delay between requests to avoid 429 rate limits
        // especially when firing many parallel fetches
        const burstDelay = page > 1 ? 200 * page : 0;
        if (burstDelay > 0) await new Promise((r) => setTimeout(r, burstDelay));

        const res = await fetch(fullUrl);
        if (!res.ok) {
          const text = await res.text();
          console.error(
            `[search-jobs] Error ${res.status}:`,
            text.slice(0, 200),
          );
          return [];
        }
        const data = await res.json();
        const results: AdzunaResult[] = data?.results ?? [];
        console.log(
          `[search-jobs] "${query}" p${page} → ${results.length} results (${Date.now() - t0}ms)`,
        );
        return results;
      } catch (e) {
        console.error(`[search-jobs] Fetch failed for "${query}":`, e);
        return [];
      }
    };

    // --- STAGE 1: Title-Based Search ---
    const stage1Tasks = queries.flatMap((title) => [
      fetchPage(title, 1),
      fetchPage(title, 2),
      fetchPage(title, 3),
    ]);
    const stage1Outcomes = await Promise.allSettled(stage1Tasks);

    const allJobs: JobListing[] = [];
    const seenIds = new Set<string>();

    const processOutcomes = (
      outcomes: PromiseSettledResult<AdzunaResult[]>[],
    ) => {
      for (const outcome of outcomes) {
        if (outcome.status === "rejected") continue;
        for (const result of outcome.value) {
          if (seenIds.has(result.id)) continue;
          seenIds.add(result.id);

          const requiredSkills = extractSkillsFromText(
            result.description ?? "",
          );

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
    };

    processOutcomes(stage1Outcomes);

    // --- STAGE 2: Skill-Based Fallback ---
    if (allJobs.length < 40 && skills?.length > 0) {
      console.log(
        `[search-jobs] Low results (${allJobs.length}), triggering Stage 2 fallback...`,
      );

      const topSkills = skills.slice(0, 3);

      // Stage 2: Broaden by searching for top skills individually
      // This helps find jobs that use the tech but might have different titles
      for (const skill of topSkills) {
        if (allJobs.length >= 60) break;
        const results = await fetchPage(skill, 1);
        processOutcomes([{ status: "fulfilled", value: results }]);
        await new Promise((r) => setTimeout(r, 300));
      }

      // Stage 3: If still low, try the "generic" version of titles (last word)
      // e.g., "MERN Developer" -> "Developer", "Social Media Manager" -> "Manager"
      if (allJobs.length < 40) {
        console.log(
          `[search-jobs] Still low (${allJobs.length}), searching generic variations...`,
        );
        const genericTitles = Array.from(
          new Set(
            queries.map((q) => {
              const words = q.split(" ");
              return words[words.length - 1];
            }),
          ),
        );

        for (const title of genericTitles) {
          if (allJobs.length >= 100) break;
          // Fetch multiple pages of generic variations
          for (const page of [1, 2]) {
            const results = await fetchPage(title, page);
            processOutcomes([{ status: "fulfilled", value: results }]);
            await new Promise((r) => setTimeout(r, 400));
          }
        }
      }
    }

    console.log(
      `[search-jobs] All fetches done in ${Date.now() - billingDone}ms`,
    );

    // Deduplicate by title + company
    const deduplicated = allJobs.filter(
      (job, idx, arr) =>
        arr.findIndex(
          (j) => j.title === job.title && j.company === job.company,
        ) === idx,
    );

    console.log(`[search-jobs] Returning ${deduplicated.length} jobs`);
    return NextResponse.json({
      jobs: deduplicated,
    });
  } catch (error) {
    console.error("Job search error:", error);
    return NextResponse.json(
      { error: "Failed to search jobs" },
      { status: 500 },
    );
  }
}
