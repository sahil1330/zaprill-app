# Intelligence Dashboard

v1 of `/intelligence`. It explains the career score, shows what the latest analysis says about the member's target roles, and lists the next step. Resume Builder is always linked. Skill Coach is linked only when the coach flag is on.

This view does not call a model. There is nothing to meter. `logAiUsage` stays unused here. A later written narrative would need a new `ai_action` enum value and a migration. Do not log these reads as `analyze_gaps`.

There is no new table. Migration `0018` stays reserved for Skill Coach (`docs/skill-coach.md`).

## Score

The number is the career score from `scoreCareerProfile` (`docs/career-profile.md`). The page adds the four completeness signals, each worth 25 points: a path, a target role, a skill on file, and current or expected pay. The bar is the weight split, 75% readiness and 25% completeness, not a second score.

`basis` is `target_roles`, `all_jobs`, or `none`. No analysis jobs leaves the score unset. Completeness still shows.

## Market

Figures come from the latest `resume_analysis` row (`createdAt` descending). Jobs are kept when the title or the required-skill list is present. A target uses the jobs whose titles match (`titlesMatch`, same rules as the score).

For each matching role the page shows:

- job count
- remote share, only for jobs that stored a boolean `isRemote`
- a pay band when at least two salaries parse to annual INR (25th, median, 75th). The parser is the same midpoint rules as `/api/career-insights` (LPA, lakh, crore). "Not disclosed" and similar phrases are skipped
- up to four companies
- up to eight skills, missing first, then by how often the jobs ask for them

Salary strings are not trusted as already-annual numbers below 10,000. Those are treated as lakhs.

If the member has no target, or no target title matches, `basis` is `all_jobs`. Each target is still listed (often with zero jobs) and a "Latest analysis" card uses every job. If there are no jobs, `basis` is `none` and each target is an empty card.

Public ATS boards are not connected. Greenhouse, Lever, and Ashby stay out of this version. The page says the figures are from the latest analysis.

## Skill gaps

A skill is on the file when `normalizeSkill` matches a `career_skill` name. Level is shown for those. It does not change the match percentage in v1.

A missing skill's priority uses how often that role's jobs require it: high above half, medium above a quarter, otherwise low. That matches `aggregateSkillGaps`. The next-step skill is the highest-priority miss among roles that have jobs, preferring a real target over the "Latest analysis" fallback.

## Next steps

At most four, in this order:

| Condition | Link |
| --- | --- |
| No skills on file | `/onboarding` when there is no resume, otherwise `/resumes` |
| No target role | `/resumes` |
| No analysis jobs | `/analyze` |
| Top missing skill | `/resumes`, and `/skill-coach` only when the coach flag is on |
| No current or expected annual pay | `/intelligence#pay` |
| No path | `/intelligence#path` |

`/resumes` is the Resume Builder. The coach link is omitted when `app_settings.coach_enabled` is missing or any value other than `true`. `isCoachEnabled()` in `src/lib/app-settings.ts` is that check. `/skill-coach` exists so the link is not a 404. It lists the same gaps and says the tutor, graded practice, and mock interviews are not built. It is not in the app nav.

## API

`GET /api/intelligence` requires a session and returns `{ report: IntelligenceReport }`. The type is in `src/types/intelligence.ts`. The handler materializes the career profile the same way `GET /api/career-profile` does, then reads the latest analysis, whether any resume row exists, and the coach flag. The page loads the career profile first, then this report, so the first visit does not derive the file twice.

The report refreshes after a segment change, a pay save, and a resume sync.

## What's left

- Live ATS job feed (Greenhouse, Lever, Ashby)
- Skill Coach itself: migration `0018`, tutor, graded practice, mock interviews
- Recruiter visibility for skills verified on Zaprill
- An optional written narrative, which needs a new `ai_action` and `logAiUsage`
