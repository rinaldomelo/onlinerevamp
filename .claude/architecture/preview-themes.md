# Preview Theme Policy — Online Revamp

> How per-PR previews work, the dev-theme rotation strategy, and what to do when something gets stuck.

---

## How previews work

When a PR opens or pushes a new commit (touching theme paths), GitHub Actions runs `deploy-dev-preview.yml`:

1. Checks out the PR branch.
2. Installs Shopify CLI.
3. Runs `shopify theme push --theme $SHOPIFY_DEV_THEME_ID --path . --allow-live=false --json`.
4. Parses the preview URL from the CLI output.
5. Posts (or updates) a PR comment tagged `preview-url` with the URL.
6. Saves the raw CLI JSON output as a workflow artifact for debugging.

The `concurrency` group cancels in-flight pushes when a new commit lands on the same PR, so the dev theme always reflects the latest commit (no racing pushes).

## Theme rotation strategy — single dev theme, recycled

Shopify caps unpublished themes at **19 per store**. Strategies:

- **Spawn-per-PR** — each PR gets its own theme. Hits the cap fast on busy repos. Hard to clean up.
- **Recycle one shared dev theme** ✅ — every PR pushes to the same `SHOPIFY_DEV_THEME_ID`. Simple. Trade-off: you only see the most recent PR's preview.
- **Per-author rotation** — one theme per contributor. Safer for parallel review on a small team. Requires the workflow to look up the author and pick the right secret. Defer until we're more than one dev.

**We use option 2** — recycle one dev theme. The `concurrency` group prevents two PRs from racing each other; the *most recent push wins*. If a reviewer needs to see two PRs side-by-side, push them sequentially.

## When something gets stuck

| Symptom | Likely cause | Fix |
|---|---|---|
| Workflow fails at "Push branch to dev theme" with auth error | `SHOPIFY_CLI_THEME_TOKEN` missing or revoked | Re-set the secret per `ci-secrets.md`; rotation procedure |
| Workflow fails at "Extract preview URL" with "No preview URL" | Shopify CLI output format changed (rare) | Check the `shopify-push-output` artifact; update the `jq` extraction in the workflow |
| Preview comment doesn't post | `pull-requests: write` permission missing | Check workflow's `permissions:` block |
| Preview comment posts but the URL 404s | Theme is in a weird state in admin | Manually reset: open admin → Themes → `<dev theme>` → "Customize" once. CLI push the next time. |
| Two PRs both look like the same preview | Recycling is working as designed | Push the older PR again to refresh; or switch to per-author rotation |

## When to upgrade rotation

Move to per-author rotation when **at least one** is true:

- More than 1 active dev with parallel PRs in review.
- Reviewer time is wasted because previews keep getting overwritten.
- A specific feature needs long-running QA on a stable theme.

Per-author rotation requires:
- One unpublished theme per contributor in the admin.
- Per-user secret: `SHOPIFY_DEV_THEME_ID_<USERNAME>`.
- Workflow logic to pick the right ID by `github.event.pull_request.user.login`.

Document the upgrade in a follow-up ADR.

## Cleanup

The dev theme accumulates settings drift over time as merchants tweak content directly in admin and PRs push new code. To reset:

1. Admin → Online Store → Themes.
2. Find the dev theme. Use "Actions" → "Duplicate" to back up.
3. "Actions" → "Edit code" → no manual changes (let CI repopulate).
4. Trigger a re-push by closing/reopening any open preview PR.

## See also

- [`.claude/architecture/ci-secrets.md`](./ci-secrets.md) — secrets catalog.
- [`shopify.theme.toml`](../../shopify.theme.toml) — env stanzas.
- [ADR-003](./adr/ADR-003-shopify-cli-deploy.md) — why CLI push.
