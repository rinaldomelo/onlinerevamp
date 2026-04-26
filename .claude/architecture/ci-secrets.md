# CI Secrets — Online Revamp

> Canonical list of GitHub repo secrets used by the CI workflows. Rotation procedure included.

---

## Secrets the CI uses

| Secret | Used by | What it is | How to obtain |
|---|---|---|---|
| `SHOPIFY_CLI_THEME_TOKEN` | M3, M4, M5 workflows | Theme Access app password (read/write theme) | [Theme Access app](https://apps.shopify.com/theme-access) → install → generate for dev store |
| `SHOPIFY_STORE_DOMAIN` | M3, M4, M5 workflows | `online-revamp.myshopify.com` (no protocol) | Shopify admin URL bar |
| `SHOPIFY_DEV_THEME_ID` | M4 workflow (dev preview) | Numeric theme ID, unpublished | Admin → Online Store → Themes → "Edit code" URL contains `/themes/<id>/` |
| `SHOPIFY_STAGING_THEME_ID` | (future staging workflow) | Numeric theme ID, unpublished | Same as above for staging theme |
| `SHOPIFY_PROD_THEME_ID` | M5 workflow (production deploy) | Numeric theme ID, *published* | Same as above for live theme |

## Setting secrets

Local CLI (preferred — fast, no UI):

```bash
gh secret set SHOPIFY_CLI_THEME_TOKEN --repo rinaldomelo/onlinerevamp
gh secret set SHOPIFY_STORE_DOMAIN --repo rinaldomelo/onlinerevamp --body "online-revamp.myshopify.com"
gh secret set SHOPIFY_DEV_THEME_ID --repo rinaldomelo/onlinerevamp --body "1234567890"
gh secret set SHOPIFY_PROD_THEME_ID --repo rinaldomelo/onlinerevamp --body "1234567891"
```

Or via the GitHub UI: Settings → Secrets and variables → Actions → New repository secret.

## Verifying secrets

```bash
gh secret list --repo rinaldomelo/onlinerevamp
```

Lists names + last-updated dates. Values are not retrievable (by design).

## Rotation

Rotate `SHOPIFY_CLI_THEME_TOKEN` every 90 days, or immediately if leaked:

1. Theme Access app → revoke the current password.
2. Generate a new one.
3. `gh secret set SHOPIFY_CLI_THEME_TOKEN --repo rinaldomelo/onlinerevamp` with the new value.
4. Re-run a recent workflow to confirm CI still works.
5. Commit-log the rotation to the project log.

Theme IDs don't expire but change if a theme is replaced. Update the secret + the relevant `shopify.theme.toml` placeholder simultaneously.

## Branch protection (set after M3 merges)

After M3's `theme-check.yml` workflow appears in the Actions tab, configure branch protection so the workflow is required:

1. GitHub → Settings → Branches → Add rule.
2. Branch name pattern: `main`. Required status checks: `theme-check / theme-check`, `theme-check / format-check`. Require linear history.
3. Repeat for `staging`.
4. (Optional) Same for `development` if pair review becomes required there.

This is admin-UI only; the CLI equivalent (`gh api`) works but is harder to audit.

## Environment protection (set after M5 merges)

Production deploy uses GitHub Environments for an extra approval gate. After M5's `deploy-production.yml` lands:

1. Settings → Environments → New environment → `production`.
2. Required reviewers: `@rinaldomelo` (solo dev approves themselves; once the team grows, list the team).
3. Wait timer: 5 minutes (lets you abort a bad merge).
4. Deployment branch rule: only `main`.

## Watch-outs

- `SHOPIFY_CLI_THEME_TOKEN` is broad — read+write on the dev store. Don't reuse for other repos.
- A leaked token must be revoked at the Theme Access app, not just at GitHub. Removing the GitHub secret doesn't invalidate the underlying credential.
- Don't put secrets in workflow YAML or commit messages. The `gh secret set` flow is the canonical path.
- `.env.example` is committed; `.env` is `.gitignored` (M2's `.shopifyignore` excludes it from theme push too).

## See also

- [`.env.example`](../../.env.example) — variable template.
- [`shopify.theme.toml`](../../shopify.theme.toml) — env stanzas.
- [ADR-003](./adr/ADR-003-shopify-cli-deploy.md) — why CLI push, not GitHub Integration.
