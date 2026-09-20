# GitHub project method (mandatory)

Every agent session that files bugs, tracks work, or finishes a fix MUST follow this. Title prefixes and issue comments are not a substitute for board Status.

**After every implementation, burn-in that change and harvest new defects onto this same board.** Do not skip that loop. Do not mark Done without it.

## Where work lives

| What | Where |
| --- | --- |
| Project board | https://github.com/users/zaprillcom-cpu/projects/1/views/1 |
| Project owner / number | user `zaprillcom-cpu`, project **#1** (`Zaprill App Project`) |
| Project node id | `PVT_kwHOEGyeI84BkCCb` |
| Issues (source of truth) | **`zaprillcom-cpu/zaprill-app`** |
| This git remote (test Vercel) | `sahil1330/zaprill-app` |

The board auto-adds new issues from `zaprillcom-cpu/zaprill-app` as **Todo**. Creating the issue is not the same as setting Status.

Do **not** file tracking issues only on `sahil1330/zaprill-app`. Code can land on the test repo; the card always belongs on the production tracking repo + board.

## Status is a project field

The board Status field is a Project v2 single-select. Putting `[Todo]` or `[In Progress]` in the issue title does **not** move the card.

| Field | id | Options |
| --- | --- | --- |
| Status | `PVTSSF_lAHOEGyeI84BkCCbzhi0Kpw` | Todo `f75ad846` · In progress `47fc9ee4` · Done `98236657` |
| Priority | `PVTSSF_lAHOEGyeI84BkCCbzhi0KwQ` | P0 `415a97f8` · P1 `87c5a04b` · P2 `4d7a283c` |

Note the Status option spelling: **`In progress`** (lowercase p).

### When to set which Status

- **Todo** — found, not started this session.
- **In progress** — you started implementing, investigating, or burn-in. Do not leave active work in Todo. New defects found in burn-in start here if you are fixing them now, otherwise Todo.
- **Done** — shipped **and** burn-in on that change passed (or explicitly closed as not planned). Core logic fixes that still need a production/Vercel check stay **In progress**.

Also set Priority when you create or pick up a card (P0 user-blocking, P1 logic/auth, P2 polish).

## Auth: two GitHub identities

This cloud VM has two `gh` accounts. **Active must be `sahil1330` for board writes.**

| Identity | What it can do | What it cannot |
| --- | --- | --- |
| `cursor[bot]` (default Cursor `gh`) | Read this test repo | Cannot see user project #1 (`Could not resolve to a ProjectV2`) |
| GitHub MCP as `sahil1330` | Create/comment issues on `zaprillcom-cpu/zaprill-app` | No Project v2 Status API |
| `gh` as **`sahil1330`** (PAT) | `gh project item-list` / `item-edit`, issues, everything the board needs | — |

### Persist login — never log out

If the user gives a PAT (classic scopes must include `project` and `repo`):

```bash
printf '%s' "$PAT" | gh auth login --hostname github.com --with-token
```

Then confirm:

```bash
gh api user --jq .login
# must print: sahil1330

gh auth status
# Active account: sahil1330
```

If `cursor` is active instead:

```bash
gh auth switch --user sahil1330
```

**Never run `gh auth logout`.** Do not delete `~/.config/gh/hosts.yml`. Do not wipe the token from the gh credential store after using it. The user has instructed agents to stay logged in as this account for the board.

Do not commit the PAT, put it in `.env*`, or echo it back in chat, commits, issue bodies, or docs.

## Required workflow

1. **Check login** at the start of tracking work: `gh api user --jq .login` is `sahil1330`. If not, switch or ask for a PAT and persist it.
2. **Create the issue** on `zaprillcom-cpu/zaprill-app` (GitHub MCP `issue_write` or `gh issue create --repo zaprillcom-cpu/zaprill-app`). Include a real description, acceptance, and suggested Status/Priority.
3. **Confirm it is on the board** (`gh project item-list 1 --owner zaprillcom-cpu`). Auto-add usually places it in Todo within seconds. If it is missing, add it:

   ```bash
   gh project item-add 1 --owner zaprillcom-cpu --url https://github.com/zaprillcom-cpu/zaprill-app/issues/N
   ```

4. **Set Status (and Priority) with `item-edit`.** Look up the item id from `item-list`, then:

   ```bash
   PROJECT_ID=PVT_kwHOEGyeI84BkCCb
   STATUS_FIELD=PVTSSF_lAHOEGyeI84BkCCbzhi0Kpw
   PRIORITY_FIELD=PVTSSF_lAHOEGyeI84BkCCbzhi0KwQ

   gh project item-edit \
     --id PVTI_... \
     --project-id "$PROJECT_ID" \
     --field-id "$STATUS_FIELD" \
     --single-select-option-id 47fc9ee4   # In progress
   ```

5. **While you work**, keep the card **In progress**.
6. **After each implementation, burn-in and harvest** (required; see below). Comment results and commit SHAs on the issue.
7. **When finished**, set **Done** only after burn-in for that change passed (and close the issue if nothing remains). Do not leave shipped work in Todo.
8. **Code** may be pushed to `sahil1330/zaprill-app` `main` (test Vercel). Say so on the issue. Do not imply it is on `app.zaprill.com` unless it is.

## Burn-in and defect harvesting (required)

This is part of the GitHub project method, not optional QA. The product owner’s standing instruction: after each implementation, run burn-in, harvest defects onto the board, and keep using the app.

### Burn-in (after every fix, before moving on)

Use the changed flow yourself. Prefer the running app (Playwright, API with session cookies, or browser) over “the code looks right.”

Minimum per change:

1. Exercise the **happy path** you just shipped (e.g. new user Home, onboarding upload, Analyze, builder save).
2. Exercise the **edge that used to fail** (the original bug).
3. If the change touches resumes or jobs, run **both**:
   - demo PDF upload (`Sahil_Mane_Resume_v4` or equivalent in the session uploads), and
   - resume builder (blank draft must not complete onboarding; saved content may).
4. If the change touches auth/onboarding, hit **new user** and **completed user** (no CTA flash, no infinite skeleton).
5. Comment the issue with pass/fail, what you ran, and the commit SHA. Keep the card **In progress** until that comment exists.

Local Next + the injected Neon DB is valid burn-in for this test repo. A checklist card for the **test Vercel** deploy is still required when user-facing logic shipped (`sahil1330/zaprill-app` `main`, not `app.zaprill.com` unless said).

Do **not** set Status to **Done** if you only compiled or linted.

### Defect harvesting (during and after burn-in)

Anything new you hit while using the app is a board item. Do not swallow it in a comment on the parent issue.

1. File a **new issue** on `zaprillcom-cpu/zaprill-app` (repro, impact, acceptance).
2. Confirm it landed on project #1.
3. Set Status: **In progress** if you start fixing it in this session; **Todo** if you must park it.
4. Set Priority (P0 user-blocking, P1 logic, P2 polish).
5. After you patch it, **burn-in that patch too** (this section repeats). Harvest again if the new run surfaces another bug.

Example from this project: fixing skill-gap loss, then job search burn-in produced fake skills `r` and `go` from English prose → new issue → In progress → fix → re-run search/gaps until those tokens were gone.

Harvested defects stay visible on the board. Do not only mention them in a Google Doc or chat.

## Commands cheat sheet

```bash
# identity
gh api user --jq .login
gh auth switch --user sahil1330

# board
gh project list --owner zaprillcom-cpu
gh project field-list 1 --owner zaprillcom-cpu --format json
gh project item-list 1 --owner zaprillcom-cpu --limit 50 --format json

# add + status
gh project item-add 1 --owner zaprillcom-cpu --url ISSUE_URL
gh project item-edit --id ITEM_ID --project-id PVT_kwHOEGyeI84BkCCb \
  --field-id PVTSSF_lAHOEGyeI84BkCCbzhi0Kpw \
  --single-select-option-id f75ad846    # Todo
# In progress = 47fc9ee4
# Done        = 98236657
```

## Failure modes we already hit

- Filing issues but never setting Status → every card stuck in Todo. **This is a process bug.** Always `item-edit`.
- Using Cursor `gh` / `cursor[bot]` → GraphQL `Could not resolve to a ProjectV2 with the number 1`. Switch to `sahil1330`.
- Logging out after a PAT was provided → the next agent cannot move cards. **Do not log out.**
- Tracking only in this test repo → the owner will not see it on the product board.
- Shipping without burn-in, or burying a new bug in a parent-issue comment → **process bug**. File a card, set Status, burn-in the patch.

## Related product repos

- Tracking + board: https://github.com/zaprillcom-cpu/zaprill-app
- Test Vercel remote (this workspace): https://github.com/sahil1330/zaprill-app
- Marketing site (not the board default): https://github.com/zaprillcom-cpu/zaprill-marketing-website
