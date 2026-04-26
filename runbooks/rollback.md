# Runbook — Rollback a Bad Production Deploy

> The production theme is broken. Get it back to known-good state in under 5 minutes.

---

## Decision tree

```
Is the live store visibly broken?
├── YES → Use Path A (publish emergency theme; ~30 seconds)
│         Then file the revert PR (Path B) at your leisure.
│
└── NO, but a bug is real, just not visible/critical
          → Use Path B (Git revert + re-deploy; ~10 minutes)
```

## Path A — Instant rollback via emergency theme

(Requires `pre-launch-backup.md` having been followed before the deploy.)

1. **Shopify admin** → Online Store → Themes.
2. Find the most recent `Emergency YYYY-MM-DD — pre-deploy #N`.
3. **Actions** → **Publish**.
4. **Verify** in an incognito window: the issue is gone.
5. Notify any affected stakeholders (Slack, email).

The live store is now safe. Proceed to Path B in parallel to fix the underlying cause.

## Path B — Git revert + re-deploy

For non-customer-facing issues, or as the follow-up after Path A:

1. Identify the bad commit on `main`: `git log --oneline -10`.

2. Open a revert branch:

   ```bash
   git checkout main
   git pull
   git checkout -b revert/<short-description>
   git revert <bad-sha>  # Or `git revert <bad-sha-1>..<bad-sha-N>` for a range.
   git push -u origin revert/<short-description>
   ```

3. **Open a PR** `revert/<short-description> → main`.

4. **Pair-review** per `.claude/rules/git-workflow.md` (required for `main`). Even in an emergency, get a second look.

5. **Merge.** This triggers `deploy-production.yml`, which:
   - Runs theme-check + format-check (validates the revert is clean).
   - Pushes to the production theme.
   - Records the deploy in the GitHub Actions summary.

6. **Verify live store** is back to expected state.

7. **Delete the emergency theme** (if Path A was used and ≥24h has passed).

8. **Post-mortem.** Append to `.claude/context/OUTPUT-project-log.md`:
   - Timestamped entry titled "Rollback — <date>"
   - Symptom (what broke)
   - Cause (root cause if known, hypothesis otherwise)
   - Detection (how it was caught — user report? monitoring? eyeballed?)
   - Resolution (which path; how long it took)
   - Prevention (what we'll do differently — e.g. add a theme-check rule, more QA, smoke test)

## Path C — Re-publish a previous theme version (Shopify-native)

If the emergency theme path isn't available (forgot to make a backup, or deployment workflow somehow auto-deleted it):

1. Admin → Online Store → Themes → "View older versions" (if the feature is enabled on your plan).
2. Find a version dated *before* the bad deploy.
3. **Restore.** Slower (~5 minutes), but built into Shopify.

This path is less reliable for theme content drift (settings/content edits made between the bad deploy and now will be lost). Prefer Path A if available.

## What NOT to do

- ❌ Edit code directly in the live theme to "patch" the issue. Drifts the live theme away from the Git source of truth.
- ❌ Force-push to `main`. Breaks history for everyone.
- ❌ Skip the validate job (`needs: validate` in `deploy-production.yml`) by forcing a re-run with the bad commit.
- ❌ Push the broken commit's parent's parent (random "go back further") without understanding what's between them.

## Pre-mortem checklist (during a healthy week)

Run quarterly:

- [ ] Pre-launch backup procedure tested end-to-end.
- [ ] Path A executed in staging — duplicate, publish, verify.
- [ ] Path B executed in staging — revert PR, re-deploy.
- [ ] Workflow secret `SHOPIFY_CLI_THEME_TOKEN` rotated within 90 days.
- [ ] CODEOWNERS list still accurate.
- [ ] Branch protection still requires the validation jobs.

## See also

- [`runbooks/pre-launch-backup.md`](./pre-launch-backup.md) — backup before every deploy.
- [`runbooks/orchestrator-rollback.md`](./orchestrator-rollback.md) — different runbook for orchestrator-driven (M7+) changes.
- [`.claude/rules/git-workflow.md`](../.claude/rules/git-workflow.md) — branch + PR rules.
