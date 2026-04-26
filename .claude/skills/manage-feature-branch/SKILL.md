# Skill: Manage Feature Branch

## Description

Tier-2 orchestration skill. Encodes the 3-environment promotion flow from `.claude/rules/git-workflow.md` into a single callable procedure: create a feature branch, commit, push, open a PR to the right base, post a preview-URL placeholder. Used by the orchestrator's `deployment-agent` (M10) and by humans-in-Claude-Code as a one-shot "ship this" command.

## When to Use

- A feature is ready to be opened as a PR.
- A bug fix needs to be landed via the formal flow rather than a direct push.
- The orchestrator has finished its specialist edits + validation passed.

Don't use this for:

- Direct push to `main` / `staging` / `development` (not allowed by the rule).
- Force-pushes or amends.
- Cross-branch merges (`development → staging`, etc — also forbidden).

## Inputs

- `feature_id` (string, required) — `dark-mode-shell`, `new-hero`, etc. Becomes the branch name component.
- `target_env` (`development` | `staging` | `main`, default `development`).
- `commit_message` (string, required) — full subject + body following Conventional Commits.
- `pr_title` (string, required).
- `pr_body` (string, required) — Markdown.
- `is_revert` (boolean, default `false`) — enables the `revert/<id>` branch prefix instead of `feature/`.

## Process

1. **Pre-flight checks.**
   - Working tree clean? If not, refuse with "uncommitted changes."
   - On a feature branch? If on `main`/`staging`/`development`, refuse — must start from a feature branch (or fresh from `main`).
   - Target env is one of the three.
2. **Branch naming.**
   - Default: `feature/<feature_id>`. Revert: `revert/<feature_id>`. Hotfix: `hotfix/<feature_id>` (if you wire that flag in).
   - If branch already exists locally, fail loudly.
3. **Branch from the right base.**
   - For `target_env == 'main'`: branch from `main`.
   - For `staging` or `development`: branch from `main` (clean base) per workflow rule (PRs always feature → env, never env → env).
4. **Apply changes** (assumes the caller has staged them already).
5. **Commit** with the provided message.
6. **Push** with `-u` to set upstream.
7. **Open PR** with `gh pr create --base <target_env>`.
8. **Post a comment placeholder** for preview URL — the actual URL comes from M4's preview workflow once active.
9. **For target_env == 'staging' or 'main':** flag that pair review is required per `git-workflow.md`.
10. **Return** structured observation with PR URL.

## Output

```markdown
# Feature Branch Managed — <feature_id>

## Branch
- Created: \`<branch-name>\`
- Pushed to origin: yes
- Tracks: \`origin/<branch-name>\`

## Commit
- SHA: \`<sha>\`
- Message: <subject line>

## PR
- URL: <gh pr URL>
- Base: \`<target_env>\`
- State: open

## Pair-review status
- Required: <yes/no>
- Reviewers requested: <list>

## Next steps
- <one-liner per next action>
```

## Important Notes

- **Never push to `main`/`staging`/`development` directly.** Refuse the operation; recommend opening a PR instead.
- **Never force-push** unless `--force-with-lease` is explicitly requested AND the branch isn't shared. (Matches `.claude/CLAUDE.md` no-go rule.)
- **Never use `--no-verify`** to bypass hooks.
- **Pair-review enforcement is convention-only** today (no GitHub branch protection until M3 lands and M5 enables Environments). The skill flags it; it doesn't block.
- **For `revert/`-prefixed branches**, link the PR body back to the offending commit/PR for traceability.
- **Pre-launch backup** (per `runbooks/pre-launch-backup.md`) is the user's manual action when target_env is `main` post-launch — surface a reminder in the PR body.
- File-glob policy (M11): this skill only invokes Git/GitHub CLIs; it does NOT modify theme files. The agent that calls this skill is responsible for staging changes first.

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# manage-feature-branch/SKILL.md — v1.0 (M6)
