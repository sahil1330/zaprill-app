# Career profile

Shared contract for the person behind a Zaprill account. Resume Builder, Skill Coach, and the Intelligence Dashboard all read and write this aggregate. The resume remains a document. The career profile is the person.

The job feed is not part of this contract. Do not read Adzuna from here. The later feed will use public ATS boards (Greenhouse, Lever, Ashby). It is not built yet.

## Tables

One profile per user. Child rows cascade from `career_profile` and from `user`.

| Table | What it stores |
| --- | --- |
| `career_profile` | Segment, headline, location, current and expected pay (as entered and as annual INR), experience in months, notice period, relocate flag, field provenance, resume the row was last derived from |
| `career_academic` | Institution, degree, field, dates, score text (CGPA or percentage), current flag |
| `career_experience` | Company, title, employment type, dates, summary, highlights |
| `career_skill` | One row per normalised skill name, with level, `level_locked`, category, and evidence |
| `career_target_role` | Roles the member is aiming at. One primary |

`user_profile` stays the onboarding and legacy-resume row. `user_profile.current_salary` is the legacy mirror of **annual** current pay. This profile does not copy phone, email, or the raw resume JSON.

Migration `0016_career_profile` is additive and safe to re-run (`IF NOT EXISTS`, and enum/constraint creation ignores `duplicate_object`). It does not alter resume, analysis, or job tables. It is not applied by this change. Resume Builder owns `0015_resume_version_snapshot_identity` on `cursor/resume-snapshot-share-export-2c58`. This branch's journal lists `0016` and does not include their file. Merging the two journals will conflict at the end of `_journal.json`; keep both entries, with Resume Builder at idx 15 and this one at idx 16.

Drizzle snapshots stop at `0012`. Do not run `drizzle-kit generate` until those snapshots are reconciled, or it will try to recreate later tables.

## Segment

`student | fresher | professional | null`

Null means we do not know yet.

- No education and no work → `null`
- No full-time, contract, or freelance work, and education is still open → `student` (internships and part-time campus jobs stay here)
- No substantive work, education finished or only internships after college → `fresher`
- Substantive work of **under 2 years** → `fresher`
- Substantive work of **2 years or more** → `professional`

Substantive work is full-time, contract, or freelance. Contract and freelance count as real work, so a long freelance career is not labelled a fresher. Internships, apprenticeships, and part-time campus jobs do not count toward the 2-year line.

The 2-year line uses substantive jobs only. An explicit `totalYearsOfExperience > 0` wins when those jobs exist. Otherwise it is the calendar span of those jobs, including gaps. If the only substantive role has no dates and no explicit year count, the segment is `fresher`: we cannot show 2 years. Displayed `yearsOfExperience` is still the overall span (or the explicit total), including internships.

Onboarding asks this question. The upload path syncs the resume first, then shows the inferred segment. The build-from-scratch path asks before an empty resume exists, so the suggestion may be empty. Either way, Continue writes the choice as `self_reported`. Later syncs keep that choice unless `POST /api/career-profile/sync` is called with `{ "refreshSegment": true }`.

The Intelligence page can change the segment the same way.

## Pay

`career_pay_period` is `monthly | annual`.

| Column | Meaning |
| --- | --- |
| `current_pay_period`, `current_pay_inr` | What the member entered |
| `current_salary_inr` | Annual whole INR. Monthly times 12, or the annual amount |
| `expected_pay_period`, `expected_min_inr`, `expected_max_inr` | Expected band, as entered |
| `expected_min_annual_inr`, `expected_max_annual_inr` | The same band, normalized to annual |

Students enter a monthly stipend. So does anyone with a **current** internship or apprenticeship. Everyone else enters annual CTC. The editor sends the period that matches that rule. Both the entered amount and the annual figure are stored.

`field_sources.currentSalaryInr` locks the current figure (`self_reported` or `legacy_profile`). Expected pay, notice period, and relocation are not overwritten by resume sync.

`PATCH /api/profile` with `currentSalary` calls `setCurrentAnnualSalary`. That writes annual current pay on the career profile and mirrors `user_profile.current_salary`. It does not write the legacy column on its own. The value is annual whole INR, including when the dashboard is showing a stipend.

Notice period (days, optional) and open-to-relocate (optional) are collected on the Intelligence page for **professionals only**.

## Skills, evidence, and locks

Skill names are trimmed and matched on a lowercased, whitespace-collapsed key. Category uses the existing `skill_category` enum. Level is `unspecified | beginner | intermediate | advanced | expert`.

`level_locked` starts false. Only an explicit level on `PUT /api/career-profile/skills` sets it. An evidence-only write unions evidence and does not change the level, the lock, or the row source. A new skill from that route is `self_reported`. Renaming or changing category also marks the row `self_reported`, without locking the level.

Evidence is a JSON list, capped at 12 items:

```ts
{
  kind: "resume_keyword" | "work" | "project" | "certification" | "academic" | "self_reported" | "verified";
  label: string;
  refId?: string;
  score?: number;       // verified only, 0–100
  verifiedAt?: string;  // verified only, ISO 8601
}
```

Resume import skips generic group names (`Languages`, `Tools`, …) and keeps the keywords. Prose matching ignores tokens of two characters or fewer, so “go to market” does not count as Go, and JavaScript does not count as Java.

Sync refreshes a level only when `level_locked` is false. It unions evidence, so a verified entry survives a resume refresh. It does not delete a resume-sourced skill that still has verified evidence, even if the resume no longer mentions it. The general skill route cannot write `kind: "verified"`.

`recordVerifiedSkill(userId, { skill, score, verifiedAt? })` upserts by normalised name, does not lock the level, and replaces any previous `verified` evidence with one item:

```ts
{ kind: "verified", label: "Verified on Zaprill", score, verifiedAt }
```

`POST /api/career-profile/skills/verify` is that method. Recruiter visibility is later. The label is stored now and shown on the Intelligence skill list. Level and verification do not change match percentage in this version.

`field_sources` on the header records who last set `segment`, `headline`, `location`, `yearsOfExperience`, and `currentSalaryInr`. Values are `inferred`, `resume`, `legacy_profile`, or `self_reported`. Sync will not overwrite `self_reported`.

Child rows use `source: "resume" | "self_reported"`.

- Sync refreshes resume-sourced academics, experience, skills, and targets in place (matched by resume item id, then by a content key) and deletes resume rows that disappeared, except verified skills as above.
- A self-reported academic, experience, or target with the same content key wins. The resume duplicate is dropped.

Years are stored as whole months and returned as a one-decimal year number.

## Career score

Deterministic. Computed on every profile read from the skill names, target titles, and the latest `resume_analysis.jobs`. Stored `matchPercentage` is ignored. `computeMatchScore`, `findMissingSkills`, and `aggregateSkillGaps` in `src/lib/match-engine.ts` do the comparison.

| Piece | Weight |
| --- | --- |
| Readiness | 0.75 |
| Completeness | 0.25 |

Completeness is 25 points for each signal that is present: segment, at least one target role, at least one skill, and current or expected pay (annual figure set). Maximum 100.

Per-role readiness is the mean `computeMatchScore` of analysis jobs whose titles match that target. Titles match as word sequences either way, or when at least half of the role's words (length greater than 2, ignoring and/the/for/with/from) appear in the job title. `engineer` is kept. `Go` does not match `Golang`, and `Java` does not match `JavaScript`.

Overall readiness is the mean of those role scores. The primary role is counted twice. Roles with no matching jobs are left out of that mean.

If no target matches any analysis job, readiness and skill gaps fall back to every job in the analysis. `intelligence.basis` is `target_roles`, `all_jobs`, or `none`.

Skill gaps are `aggregateSkillGaps` on the jobs used for that basis. Priority is high when the skill is missing from more than half of those jobs, medium above a quarter, otherwise low.

```
careerScore = readiness == null ? null : round(0.75 * readiness + 0.25 * completeness)
```

No analysis jobs means `careerScore` and `readiness` are null. Completeness is still returned. The dashboard says the score appears after an analysis. The role feed panel stays unbuilt.

## API

All routes require a session (`auth.api.getSession`). Responses are `{ profile: CareerProfileView }` or `{ error, issues? }`. The view type lives in `src/types/career-profile.ts`. `profile.intelligence` is the score block above.

| Method | Path | Behaviour |
| --- | --- | --- |
| `GET` | `/api/career-profile` | Returns the profile. The first read derives it from the primary resume (else the latest resume, else `user_profile.resume_raw`) and copies legacy annual salary when current pay is unlocked |
| `PUT` | `/api/career-profile` | Patches header fields. Sets those field sources to `self_reported`. Current pay writes `currentPayPeriod`, `currentPayInr`, the annual figure, and `user_profile.current_salary`. Expected pay is `expectedPayPeriod` plus `expectedMinInr` / `expectedMaxInr` |
| `POST` | `/api/career-profile/sync` | Re-derives. Optional `{ "refreshSegment": true }` |
| `PUT` / `DELETE` | `/api/career-profile/skills` | Upsert by id or normalised name. A `level` locks the level. Evidence alone does not. Delete with `?id=` |
| `POST` | `/api/career-profile/skills/verify` | `{ skill, score, verifiedAt? }`. Records `Verified on Zaprill`. Does not lock the level |
| `PUT` / `DELETE` | `/api/career-profile/academics` | Create or update by id. Delete with `?id=` |
| `PUT` / `DELETE` | `/api/career-profile/experience` | Create or update by id. Delete with `?id=` |
| `PUT` / `DELETE` | `/api/career-profile/targets` | Upsert by id or normalised title. The first target becomes primary if none is set. Delete with `?id=` |
| `PATCH` | `/api/profile` | `currentSalary` is annual CTC and is written only through `setCurrentAnnualSalary` |

`GET` materialises the row. It does not re-derive on every request after `lastDerivedAt` is set. Call sync when a resume changes. Onboarding syncs after a resume upload and before it asks for the segment, so the first derivation sees that resume.

Resume Builder should keep tailored resume copy on the resume document. Do not fork a second career profile per resume. Target roles for the person live here; a resume’s `target_role` is an input to sync, not a second source of truth.

Skill Coach should confirm a skill with `POST /api/career-profile/skills/verify`. Use `PUT /api/career-profile/skills` with `level` only when a person explicitly sets a level.

## Still open

- Academics are free text. A college directory waits on the colleges product.
- Which Greenhouse, Lever, and Ashby boards to read, and how verified skills surface to recruiters. Both are later. This version stores the verification and does not build the feed.
- The 2-year line counts contract and freelance with full-time. Say so if a later pass should count full-time titles only.
