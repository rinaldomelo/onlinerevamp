# M5 — Production Deploy Guardrails

**Status:** Code merged, awaiting verification (PR open). Workflow YAML staged.
**Effort:** M.
**Owner:** Rinaldo.
**Branch:** `feature/m5-prod-deploy`.
**PR target:** `development`.

---

## Goal

A green merge to `main` lands on the production theme — but only after theme-check + format-check pass *in CI* and the GitHub `production` Environment's wait-timer + reviewer gate clears. Rollback is documented and rehearsable in under 5 minutes.

## Why

M3 gates PRs. M4 previews them. M5 is the last mile: actual production. Without this milestone, "merge to main" still requires a manual `shopify theme push --allow-live` — slow, error-prone, ungate-able.

## Scope

In:

- `.claude/architecture/ci-staged/.github/workflows/deploy-production.yml` — two-job workflow: `validate` (theme-check + format-check), then `deploy` (Shopify CLI push to prod, gated by GitHub `production` Environment).
- `runbooks/pre-launch-backup.md` — duplicate live theme as `Emergency YYYY-MM-DD — pre-deploy #N` before each merge to main, post-launch.
- `runbooks/rollback.md` — three rollback paths (instant theme republish, Git revert + re-deploy, Shopify-native version restore).
- M5 milestone spec.

Out:

- The GitHub Environment itself (admin UI; documented in `ci-secrets.md`).
- Required reviewer config (admin UI).
- Lighthouse / performance gating (M9).
- Automated emergency-theme cleanup (manual until traffic warrants).

## Files in this PR

- `.claude/architecture/ci-staged/.github/workflows/deploy-production.yml` (new — staged)
- `runbooks/pre-launch-backup.md` (new)
- `runbooks/rollback.md` (new)
- `.claude/architecture/milestones/M5-prod-deploy.md` (this file)
- `.claude/architecture/milestones/README.md` (M5 stub trimmed)
- `.claude/architecture/ci-staged/README.md` (M5 entry marked shipped)
- `.claude/architecture/ROADMAP.md` (status row updated)
- `.claude/context/OUTPUT-project-log.md` (entry appended)

## Pre-flight (user actions to mark M5 Done)

- [ ] Merge M0–M4.
- [ ] Activate this workflow YAML alongside M3 + M4's via `git mv`.
- [ ] Set GitHub secret `SHOPIFY_PROD_THEME_ID` (the live theme's ID).
- [ ] **Configure GitHub Environment `production`** (Settings → Environments → New):
  - Required reviewers: `@rinaldomelo` (solo dev approves themselves).
  - Wait timer: 5 minutes.
  - Deployment branch rule: only `main`.
- [ ] Add branch protection on `main`: require `validate / theme-check`, `validate / format-check`, plus 1 review.
- [ ] **Test rollback in staging FIRST** (use Path A from `runbooks/rollback.md` against the staging theme). Record date in project log.
- [ ] Once site is live: every merge to `main` follows `pre-launch-backup.md`. Until then, that runbook is "informational."

## Acceptance criteria

- [ ] YAML parses post-activation.
- [ ] `validate` job runs theme-check + format-check; `deploy` depends on `validate` succeeding.
- [ ] `deploy` job uses `environment: production` to gate on the env's reviewer + wait timer.
- [ ] `--allow-live` flag IS present on the prod push (different from M4's `--allow-live=false`).
- [ ] Both runbooks have step-by-step procedures with expected timings.
- [ ] PR merged to `development`.

## Risks

- **`--allow-live` will publish a broken commit if the validate job is bypassable.** Mitigation: GitHub's `needs: validate` is hard-coupled — `deploy` cannot skip ahead. Don't `workflow_dispatch` deploy without validate succeeding too.
- **GitHub Environment misconfiguration.** Common error: forgetting to set "deployment branch rule" → any branch could push. Mitigation: pre-flight checklist explicitly lists this.
- **Auto-cancellation of in-flight prod deploys is OFF (`cancel-in-progress: false`).** Two rapid merges to `main` will queue, not race. Trade-off accepted — better to deploy each commit than cancel one mid-flight.
- **Emergency theme cleanup is manual.** Hits the 19-theme cap if neglected. Mitigated by quarterly "pre-mortem checklist" in `rollback.md`.
- **Pre-launch period nuance.** Until go-live, `pre-launch-backup.md` is a no-op; flip to "Required" at go-live.

## Dependencies

- M3 merged (theme-check workflow + secrets + CODEOWNERS).
- M4 merged (preview workflow — same secrets, same CLI install pattern).
- Production theme exists in admin and is the published one.
- GitHub repo's "Environments" feature available (free for public repos; included in paid plans for private).

## Out of scope

- Lighthouse / a11y gates (M9).
- Automated emergency-theme cleanup (deferred).
- Multi-store production deploys (single store today).
- Promotion from `staging` to production via PR (separate workflow; not yet planned).
