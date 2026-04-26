# M4 — Preview-URL Bot

**Status:** Code merged, awaiting verification (PR open). Workflow YAML staged (see M3).
**Effort:** M.
**Owner:** Rinaldo.
**Branch:** `feature/m4-preview-bot`.
**PR target:** `development`.

---

## Goal

Open a PR → 1–2 minutes later, a comment on the PR contains a working preview URL pointing at the dev theme with this branch's code pushed. Removes the manual "share Shopify URL by hand" toil.

## Why

Per-PR previews are the highest-leverage CI affordance for theme work. Reviewers can see the actual rendered change before reading any Liquid. Stakeholders can stage feedback without the dev manually pushing.

## Scope

In:

- `.claude/architecture/ci-staged/.github/workflows/deploy-dev-preview.yml` (workflow YAML; staged due to OAuth `workflow` scope — see M3).
- `.claude/architecture/preview-themes.md` — rotation policy, troubleshooting, upgrade path.
- `concurrency` group on the workflow so racing pushes cancel cleanly.
- PR-comment bot using `thollander/actions-comment-pull-request@v2` with a `comment_tag` for idempotency (one comment per PR, updated on each push).

Out:

- Per-author theme rotation — recycle one dev theme for now (see policy doc).
- Lighthouse run on the preview URL — M9 owns performance gating.
- Auto-cleanup of dev theme between PRs — Shopify doesn't expose a clean reset; documented in policy doc.

## Files in this PR

- `.claude/architecture/ci-staged/.github/workflows/deploy-dev-preview.yml` (new — staged)
- `.claude/architecture/preview-themes.md` (new)
- `.claude/architecture/milestones/M4-preview-bot.md` (this file)
- `.claude/architecture/milestones/README.md` (M4 stub trimmed)
- `.claude/architecture/ROADMAP.md` (status row updated)
- `.claude/context/OUTPUT-project-log.md` (entry appended)

## Pre-flight (user actions to mark M4 Done)

- [ ] Merge M0–M3.
- [ ] Activate M4 workflow alongside M3's via `git mv` from `ci-staged/` (or web UI).
- [ ] Verify the dev theme exists in Shopify admin and `SHOPIFY_DEV_THEME_ID` matches its ID.
- [ ] Open a no-op PR touching a theme path → expect a preview-URL comment within ~2 min.
- [ ] Push a second commit to the same PR → expect the comment to update (not duplicate).
- [ ] Open a second PR in parallel → confirm the dev theme reflects the second PR (recycling working).

## Acceptance criteria

- [ ] YAML parses (verified post-activation when GitHub Actions UI accepts it).
- [ ] `concurrency` group correctly named (`dev-preview-<PR-number>`).
- [ ] Workflow only runs on PRs touching theme paths or `shopify.theme.toml`.
- [ ] Comment uses `comment_tag: preview-url` so updates replace, not append.
- [ ] Policy doc covers single-theme rotation + when to upgrade.
- [ ] PR merged to `development`.

## Risks

- **Racing pushes against a single recycled theme.** Mitigated by `concurrency` group + `cancel-in-progress: true`.
- **Shopify CLI JSON shape may shift between releases.** Mitigated by `jq` fallbacks (`.theme.preview_url // .theme.previewUrl // empty`) and uploading raw output as an artifact for debugging.
- **PR comment bot version drift.** Pinned to `@v2` of `thollander/actions-comment-pull-request`; review when GitHub deprecates v2.
- **`--allow-live=false` is critical** — prevents accidental push to a published theme. Don't ever remove without an ADR.
- **Shopify's 19-unpublished-themes cap** — single recycled theme avoids hitting it. If we ever spawn-per-PR, add a janitor workflow to clean up.

## Dependencies

- M3 merged (provides secrets baseline + workflow scope unblock).
- `SHOPIFY_DEV_THEME_ID` set as a GitHub secret.
- Dev theme created in Shopify admin (unpublished).

## Out of scope

- Production deploy (M5).
- Lighthouse / accessibility tests on the preview URL (M9).
- Automated cleanup of the dev theme (no Shopify API for this; manual per policy doc).
- Per-author theme rotation (deferred — single dev today).
