# M10 — Deployment Agent

**Status:** Code merged, awaiting verification. **Scaffold (git + octokit calls real, gated by validation status).**
**Effort:** M.
**Owner:** Rinaldo.
**Branch:** `feature/m10-deployment-agent`.
**PR target:** `development`.

---

## Goal

Translate green validation into a PR, encoding `.claude/rules/git-workflow.md` verbatim. Refuse to deploy `needs_fixes`. Mark `human_review` PRs as draft. Flag pair-review-required for `staging`/`main`.

## Why

Without M10, the orchestrator is read-only: it plans, edits, validates — but a human still has to do `git push && gh pr create`. M10 closes that loop.

## Scope

In:

- `orchestrator/src/agents/deployment/{prompt.md, schema.ts, harness.ts, index.ts}`.
- Real git + octokit calls via M7's tool wrappers.
- Pre-flight refusals: refuses on `needs_fixes` validation, refuses on env branches, refuses dirty working tree.
- `tests/deployment.smoke.test.ts`.

Out:

- Wiring deployment into the workflow runner — happens after M11 governance is in place.
- Any actual merging — open PRs only; humans merge.

## Files in this PR

- `orchestrator/src/agents/deployment/{prompt.md, schema.ts, harness.ts, index.ts}` (4 new)
- `orchestrator/tests/deployment.smoke.test.ts` (new)
- `.claude/architecture/milestones/M10-deployment-agent.md` (this file)
- `.claude/architecture/milestones/README.md` (M10 stub trimmed)
- `.claude/architecture/ROADMAP.md` (status row updated)
- `.claude/context/OUTPUT-project-log.md` (entry appended)

## Pre-flight (user actions to mark M10 Done)

- [ ] Merge M0–M9.
- [ ] Set `GITHUB_TOKEN` env var (octokit needs it).
- [ ] `pnpm test` (deployment smoke tests pass).
- [ ] Manual smoke: from a feature branch with staged changes, call `runDeployment({ ... validationStatus: "pass", targetEnv: "development" })`. Verify a PR opens.
- [ ] Manual smoke: same but `targetEnv: "main"` → verify the response carries `pairReviewRequired: true` and the PR notes flag this.

## Acceptance criteria

- [ ] All 4 files exist; types compile.
- [ ] Refuses on env branches (`main`/`staging`/`development`) with a clear note.
- [ ] Refuses on `validationStatus === "needs_fixes"`.
- [ ] `human_review` validation → `action: "wait_for_human"`.
- [ ] Pair-review-required correctly inferred from `targetEnv`.
- [ ] PR merged to `development`.

## Risks

- **`GITHUB_TOKEN` scope.** Same OAuth scope guard that hit M3-M5 workflows can hit if the token doesn't have `repo` + `pull_request` permissions. Document in pre-flight.
- **Working tree assumption.** The harness assumes the caller has staged changes. If called outside a workflow runner context, defensive `commit(input.commitMessage)` may behave unexpectedly. M11's permissions can make this safer.
- **No actual merging.** Even with `pass` validation on a `development` PR, this scaffold opens but doesn't merge. Auto-merge for `development` is a future enhancement (post-M11), and even then is gated by user opt-in.
- **Branch hygiene.** Deployment refuses if you're on an env branch, but doesn't yet check if the local branch is up-to-date with origin. Add this in M11 close-out.

## Dependencies

- M7 + M8 + M9 merged.
- `GITHUB_TOKEN` set.
- `simple-git` + `@octokit/rest` resolved by `pnpm install`.

## Out of scope

- Auto-merge (deferred).
- M11 governance (separate milestone).
- Theme files.
