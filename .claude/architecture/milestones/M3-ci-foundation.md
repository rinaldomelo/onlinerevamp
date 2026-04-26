# M3 — CI Foundation

**Status:** Code merged, awaiting verification (PR open).
**Effort:** M.
**Owner:** Rinaldo.
**Branch:** `feature/m3-ci-foundation`.
**PR target:** `development`.

---

## Goal

First PR-level automation. theme-check + prettier check run on every PR touching theme paths, gating merges. Secrets baseline documented. Branch protection rules ready to enable on `main` and `staging`.

## Why

Until this milestone, every change ships on local trust. M2 made `npm run lint:theme` and `npm run format:check` available locally; M3 makes them mandatory in CI. This is the 0→1 step from "we hope it's clean" to "it's verified before merge."

## Scope

In:

- `.github/workflows/theme-check.yml` — runs `shopify theme check` + `npm run format:check` on every PR touching theme paths or workflow itself.
- `.env.example` — canonical env-var list.
- `.github/CODEOWNERS` — solo dev for now; documents intent.
- `.claude/architecture/ci-secrets.md` — secrets catalog + rotation runbook.
- M3 milestone spec.

Out:

- Deploy workflows (M4 dev preview; M5 production).
- Lighthouse / performance CI (deferred to M9).
- Branch protection rule creation — admin UI; documented in `ci-secrets.md` for the user to set after merge.
- GitHub Environments — M5.

## Files in this PR

- `.claude/architecture/ci-staged/.github/workflows/theme-check.yml` (new — see "Workflow staging" note below)
- `.claude/architecture/ci-staged/README.md` (new — explains the staging pattern)
- `.env.example` (new)
- `.github/CODEOWNERS` (new — `CODEOWNERS` is allowed without `workflow` OAuth scope)
- `.claude/architecture/ci-secrets.md` (new)
- `.claude/architecture/milestones/M3-ci-foundation.md` (this file)
- `.claude/architecture/milestones/README.md` (M3 stub trimmed)
- `.claude/architecture/ROADMAP.md` (status row updated)
- `.claude/context/OUTPUT-project-log.md` (entry appended)

### Workflow staging note

The `theme-check.yml` workflow file ships in `.claude/architecture/ci-staged/.github/workflows/` (not directly in `.github/workflows/`) because the agent's GitHub OAuth token lacks the `workflow` scope. After the user runs `gh auth refresh -h github.com -s workflow`, the staged file gets `git mv`'d into place and pushed in a follow-up commit. See `.claude/architecture/ci-staged/README.md` for both the auth-refresh path and a manual web-UI alternative.

## Pre-flight (user actions to mark M3 Done)

- [ ] Merge M0 / M1 / M2 first.
- [ ] `gh secret set SHOPIFY_CLI_THEME_TOKEN --repo rinaldomelo/onlinerevamp` (paste Theme Access password).
- [ ] `gh secret set SHOPIFY_STORE_DOMAIN --repo rinaldomelo/onlinerevamp --body "online-revamp.myshopify.com"` (use real domain).
- [ ] `gh secret set SHOPIFY_DEV_THEME_ID …` (preflight for M4).
- [ ] `gh secret set SHOPIFY_PROD_THEME_ID …` (preflight for M5).
- [ ] Trigger a no-op PR to confirm the workflow runs and is green (or red with documented baseline).
- [ ] Configure branch protection on `main` and `staging` requiring `theme-check / theme-check` + `theme-check / format-check`. See `ci-secrets.md` for the steps.
- [ ] Update ROADMAP M3 row to `Done`.

## Acceptance criteria

- [ ] Workflow YAML parses (GitHub Actions UI shows it without warnings).
- [ ] Pushing this PR triggers the workflow (will run on the workflow file change itself).
- [ ] If theme-check finds errors on the existing repo, those are captured as a baseline; rules disabled in `.theme-check.yml` only with documented justification.
- [ ] `.env.example` lists every secret the workflows reference.
- [ ] `ci-secrets.md` rotation procedure is followable.
- [ ] PR merged to `development`.

## Risks

- **First-run noise.** theme-check on a 50+ section, FoxTheme codebase will likely surface warnings. Decide per-rule: tune `.theme-check.yml` (add a justified disable) or fix the offending code. Don't blanket-disable.
- **`format:check` on a never-formatted codebase will fail.** Mitigation: M2's pre-flight recommends running `npm run format` once on a normalize commit before this CI is required. If that's skipped, expect the first M3 CI run to be red — that's expected.
- **`continue-on-error: false` is intentional.** A red theme-check should block merge, not warn. Adjust *only* with documented justification.
- **CODEOWNERS triggers auto-review-request on every PR.** With one owner that's noise. Acceptable for now; revisit when the team grows.

## Dependencies

- M2 merged (provides `package.json`, `.theme-check.yml`, prettier config).
- Shopify Theme Access app installed on the dev store.
- GitHub repo secrets set per pre-flight.

## Out of scope

- Deploy workflows (M4, M5).
- Performance/accessibility CI (M9).
- Branch protection automation — admin UI only.
- Secret rotation cron — manual quarterly, documented in `ci-secrets.md`.
