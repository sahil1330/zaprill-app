# GitHub project method (mandatory)

Every agent session that files bugs, tracks work, or finishes a fix MUST follow this. Title prefixes and issue comments are not a substitute for board Status.

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
- **In progress** — you started implementing, investigating, or burn-in. Do not leave active work in Todo.
- **Done** — shipped **and** verified (or explicitly closed as not planned). Core logic fixes that still need a production/Vercel check stay **In progress**.

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

5. **While you work**, keep the card **In progress**. Comment burn-in / commit SHAs on the issue.
6. **When finished**, set **Done** (and close the issue if nothing remains). Do not leave shipped work in Todo.
7. **Code** may be pushed to `sahil1330/zaprill-app` `main` (test Vercel). Say so on the issue. Do not imply it is on `app.zaprill.com` unless it is.

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

## Related product repos

- Tracking + board: https://github.com/zaprillcom-cpu/zaprill-app
- Test Vercel remote (this workspace): https://github.com/sahil1330/zaprill-app
- Marketing site (not the board default): https://github.com/zaprillcom-cpu/zaprill-marketing-website
