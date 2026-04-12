import { NextResponse } from "next/server";
import { extractSkillsFromText } from "@/lib/skill-extractor";
import type { JobListing } from "@/types";

export const maxDuration = 30;

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

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    // 3 queries — each fetches 2 pages of 50 results = up to 300 jobs total
    // Refine queries based on experience if provided
    const queries = experienceYears !== undefined
      ? jobTitles.map(title => {
          if (experienceYears >= 12) return `Lead ${title}`;
          if (experienceYears >= 7) return `Senior ${title}`;
          if (experienceYears <= 1) return `Junior ${title}`;
          return title;
        })
      : jobTitles;

    const allJobs: JobListing[] = [];
    const seenIds = new Set<string>();

    for (let i = 0; i < queries.length; i++) {
      if (i > 0) await sleep(500); // Adzuna is generous but be polite

      const title = queries[i];

      for (let page = 1; page <= 2; page++) {
        try {
          const url = new URL(
            `https://api.adzuna.com/v1/api/jobs/in/search/${page}`,
          );
          url.searchParams.set("app_id", appId);
          url.searchParams.set("app_key", appKey);
          url.searchParams.set("what", title);
          url.searchParams.set("results_per_page", "50");
          url.searchParams.set("content-type", "application/json");
          if (location) url.searchParams.set("where", location);

          console.log(`[search-jobs] ${title} (page ${page}) → ${url.toString().replace(appKey, "***")}`);

          const res = await fetch(url.toString());
          console.log(`[search-jobs] "${title}" p${page} → HTTP ${res.status}`);

          if (!res.ok) {
            const text = await res.text();
            console.error(`[search-jobs] Error: ${res.status}`, text.slice(0, 200));
            if (res.status === 429) break; // stop paging this title
            continue;
          }

          const data = await res.json();
          const results: AdzunaResult[] = data?.results ?? [];
          console.log(`[search-jobs] "${title}" p${page} → ${results.length} results`);

          for (const result of results) {
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
              employmentType: result.contract_time === "full_time" ? "FULLTIME" : result.contract_time === "part_time" ? "PARTTIME" : undefined,
              isRemote: result.title.toLowerCase().includes("remote") || result.description.toLowerCase().includes("remote"),
              publisher: "Adzuna",
            });
          }

          // If fewer than 50 results, no point fetching page 2
          if (results.length < 50) break;
        } catch (err) {
          console.error(`[search-jobs] Exception for "${title}" p${page}:`, err);
        }
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
