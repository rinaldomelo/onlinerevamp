# Runbook — Pre-launch Theme Backup

> Run **before every merge to `main`** once the production site is live. Today (pre-launch) this runbook is a no-op — toggle "Required" when go-live happens.

---

## Status

**Status:** Optional (pre-launch). Toggle to **Required** at go-live.

## Why

Once the live store is taking traffic, every production deploy carries risk: a bad merge can break checkout, kill SEO, or surface a bug to real customers. Shopify keeps theme version history but recovering through it is slow.

A pre-deploy duplicate of the live theme means:

- Rollback in **<5 minutes** (publish the duplicate, problem gone).
- A frozen reference for "what was live just before this deploy."
- A fallback if Shopify's theme history loses anything.

## Procedure (5 minutes, before merging to `main`)

1. **Open Shopify admin** → Online Store → Themes.

2. **Find the live theme** at the top of the page (the published one).

3. **Actions** → **Duplicate**.

4. **Rename the duplicate** following the convention:

   ```
   Emergency YYYY-MM-DD — pre-deploy <PR number>
   ```

   Example: `Emergency 2026-04-26 — pre-deploy #42`

5. **Verify the duplicate exists** in the unpublished themes list.

6. **Now merge the PR** to `main`. The production deploy workflow runs.

7. **After deploy is verified green**, leave the emergency theme in place for at least 24 hours. After 24h, delete it (or archive — see "Cleanup" below).

## Rollback (when the deploy goes wrong)

1. Admin → Online Store → Themes → find `Emergency YYYY-MM-DD — pre-deploy #N`.

2. **Actions** → **Publish**. Live store snaps back to the pre-deploy state instantly.

3. Open a `revert: <issue>` PR against `main` to roll the Git history back too.

4. After revert merges + re-deploys, the emergency theme can be deleted.

5. Post-mortem: append an entry to `.claude/context/OUTPUT-project-log.md` noting what failed and how it was caught.

## Cleanup

Shopify caps unpublished themes at 19. Old emergency themes burn that cap fast.

- **Keep the most recent 5 emergency themes.**
- After each successful deploy, delete the oldest emergency theme older than 7 days.
- Theme cleanup is manual — no Shopify API for bulk delete. Schedule a weekly check during the post-launch period.

## Automation possibilities (deferred)

- Shopify Admin GraphQL API supports `themeDuplicate` and `themeDelete`. A CI step could automate this.
- Trade-off: complexity vs. solo-dev workflow. Manual is fine until weekly theme cleanup becomes a chore.
- Revisit when post-launch traffic shows we need it.

## When to delete this runbook

This runbook stays relevant until Shopify ships native pre-deploy snapshots (no current ETA). Mark "deprecated" in the heading and link to whatever replaces it.

## See also

- [`runbooks/rollback.md`](./rollback.md) — generic rollback procedure for non-emergency cases.
- [`.claude/architecture/ci-secrets.md`](../.claude/architecture/ci-secrets.md) — environment protection setup.
- [ADR-003](../.claude/architecture/adr/ADR-003-shopify-cli-deploy.md) — why this is necessary (CLI push, no Shopify-side rollback automation).
