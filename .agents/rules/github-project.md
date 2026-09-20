---
trigger: always_on
description: Mandatory GitHub Project v2 workflow for Zaprill. Create issues on zaprillcom-cpu/zaprill-app, set board Status with gh as sahil1330, never log out.
---

# GitHub project method

Read and follow [.agents/GITHUB_PROJECT.md](../GITHUB_PROJECT.md) before filing, triaging, or updating work.

Hard rules:
- Tracking repo: `zaprillcom-cpu/zaprill-app`. Board: https://github.com/users/zaprillcom-cpu/projects/1/views/1
- This workspace (`sahil1330/zaprill-app`) is the test Vercel repo, not the board owner.
- `[Todo]` in an issue title is not board Status. You must set the project Status field.
- Cursor `gh` defaults to `cursor[bot]` and cannot see the board. Use account `sahil1330`.
- Never run `gh auth logout`. If a PAT is provided, persist it with `gh auth login --with-token` and leave it logged in.
- GitHub MCP can create issues; it cannot set Project v2 Status. Use `gh project item-edit` for Status.
- After every implementation: burn-in the change and harvest new defects as their own board cards (see GITHUB_PROJECT.md). Do not set Done without burn-in.
