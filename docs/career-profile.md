# Career profile

Shared contract for the person behind a Zaprill account. Resume Builder, Skill Coach, and the Intelligence Dashboard all read and write this aggregate. The resume remains a document. The career profile is the person.

Compensation is **annual INR**. The job feed is not part of this contract. Do not read Adzuna from here. The later feed will use public ATS boards (Greenhouse, Lever, Ashby).

## Tables

One profile per user. Child rows cascade from `career_profile` and from `user`.

| Table | What it stores |
| --- | --- |
| `career_profile` | Segment, headline, location, annual current/expected salary, experience in months, notice period, relocate flag, field provenance, resume the row was last derived from |
| `career_academic` | Institution, degree, field, dates, score text (CGPA or percentage), current flag |
| `career_experience` | Company, title, employment type, dates, summary, highlights |
| `career_skill` | One row per normalised skill name, with level, category, and evidence |
| `career_target_role` | Roles the member is aiming at. One primary |

`user_profile` stays the onboarding and legacy-resume row. `user_profile.current_salary` is the legacy mirror of current CTC. This profile does not copy phone, email, or the raw resume JSON.

Migration `0015_career_profile` is additive. It does not alter resume, analysis, or job tables. It is not applied by this change. Drizzle snapshots stop at `0012`; do not run `drizzle-kit generate` until those snapshots are reconciled, or it will try to recreate later tables.

## Segment

`student | fresher | professional | null`

Null means we do not know yet. Onboarding does not ask this question today, so the first sync infers it:

- No education and no work → `null`
- No full-time, contract, or freelance work, and education is still open → `student` (internships and part-time campus jobs stay here)
- No substantive work, education finished or only internships after college → `fresher`
- Substantive work and years under 1.5 → `fresher`
- Substantive work and years of 1.5 or more, or a full-time title with no dates → `professional`

A member who sets the segment through the API locks it. Later syncs keep that choice unless `POST /api/career-profile/sync` is called with `{ "refreshSegment": true }`.

## Skills, evidence, and locks

Skill names are trimmed and matched on a lowercased, whitespace-collapsed key. Category uses the existing `skill_category` enum. Level is `unspecified | beginner | intermediate | advanced | expert`.

Evidence is a JSON list, capped at 12 items:

```ts
{ kind: "resume_keyword" | "work" | "project" | "certification" | "academic" | "self_reported"; label: string; refId?: string }
```

Resume import skips generic group names (`Languages`, `Tools`, …) and keeps the keywords. Prose matching ignores tokens of two characters or fewer, so “go to market” does not count as Go, and JavaScript does not count as Java.

`field_sources` on the header records who last set `segment`, `headline`, `location`, `yearsOfExperience`, and `currentSalaryInr`. Values are `inferred`, `resume`, `legacy_profile`, or `self_reported`. Sync will not overwrite `self_reported`.

Child rows use `source: "resume" | "self_reported"`.

- Sync refreshes resume-sourced academics, experience, skills, and targets in place (matched by resume item id, then by a content key) and deletes resume rows that disappeared.
- A self-reported row with the same content key wins. The resume duplicate is dropped.
- `PUT` on a skill or target marks that row `self_reported`. Sync will not replace its level. It may still fill an `unspecified` level or an `other` category, and it unions new evidence onto the row.

Years are stored as whole months and returned as a one-decimal year number. When the resume has `totalYearsOfExperience > 0`, that value wins. Otherwise years are the calendar span from the earliest start to the latest end, which includes gaps between jobs.

## API

All routes require a session (`auth.api.getSession`). Responses are `{ profile: CareerProfileView }` or `{ error, issues? }`. The view type lives in `src/types/career-profile.ts`.

| Method | Path | Behaviour |
| --- | --- | --- |
| `GET` | `/api/career-profile` | Returns the profile. The first read derives it from the primary resume (else the latest resume, else `user_profile.resume_raw`) and copies legacy salary when current CTC is unlocked |
| `PUT` | `/api/career-profile` | Patches header fields. Sets those field sources to `self_reported`. Writing `currentSalaryInr` also updates `user_profile.current_salary` |
| `POST` | `/api/career-profile/sync` | Re-derives. Optional `{ "refreshSegment": true }` |
| `PUT` / `DELETE` | `/api/career-profile/skills` | Upsert by id or normalised name. Delete with `?id=` |
| `PUT` / `DELETE` | `/api/career-profile/academics` | Create or update by id. Delete with `?id=` |
| `PUT` / `DELETE` | `/api/career-profile/experience` | Create or update by id. Delete with `?id=` |
| `PUT` / `DELETE` | `/api/career-profile/targets` | Upsert by id or normalised title. The first target becomes primary if none is set. Delete with `?id=` |

`GET` materialises the row. It does not re-derive on every request after `lastDerivedAt` is set. Call sync when a resume changes.

Resume Builder should keep tailored resume copy on the resume document. Do not fork a second career profile per resume. Target roles for the person live here; a resume’s `target_role` is an input to sync, not a second source of truth.

Skill Coach should record confirmed skills through `PUT /api/career-profile/skills` so a later resume sync does not clobber the coach’s level.

The Intelligence page at `/intelligence` is a shell over `GET`, segment `PUT`, and `POST /sync`. Career score, readiness, skill gaps, and the role feed are named on the page and are not computed.

## Open questions

1. Is 1.5 years the right fresher line for India campus hiring, or should it be 2?
2. Who adds the student / fresher / professional question to onboarding? Until then, segment is inferred and can be corrected on the Intelligence page.
3. Should expected pay be a band (min/max) instead of one number? Students often think in monthly stipend, while CTC is annual.
4. `PATCH /api/profile` still writes only `user_profile.current_salary`. Sync copies that into the career profile when the salary field is unlocked. A profile edit after a member sets salary here will not move the career figure until sync, and a career figure marked `self_reported` will not move at all.
5. Should an evidence-only skill write stay `resume`-sourced instead of locking the level?
6. Academics are free text. A college directory is out of scope until the colleges product exists.
7. Notice period and willingness to relocate are on the model and not collected anywhere yet.
8. Scoring weights, and which Greenhouse/Lever/Ashby boards to read, belong to a later dashboard change.
