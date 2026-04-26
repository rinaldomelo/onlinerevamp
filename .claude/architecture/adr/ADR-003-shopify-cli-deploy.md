# ADR-003 — Use Shopify CLI Push (Not GitHub Integration) for Deploys

- **Status:** Accepted
- **Date:** 2026-04-25
- **Deciders:** Rinaldo (solo dev)
- **Implements:** Milestones M4, M5
- **Related:** `.claude/rules/git-workflow.md` (3-env promotion flow)

---

## Context

There are two supported ways to deploy a Shopify theme from a Git repo:

1. **GitHub Integration** — connect a Shopify store to a GitHub repo + branch via the Shopify Admin. Pushes to the connected branch auto-sync to the theme. Zero CI required.
2. **Shopify CLI push** — `shopify theme push --theme <id>` from a CI runner. Requires a CI Theme Token and the CLI installed. Full control over when, what, and where.

The current state: this repo has `main` / `staging` / `development` branches per `.claude/rules/git-workflow.md`. We need:

- Per-PR preview pushes to a dev theme (M4).
- Production push on merge to `main` (M5).
- Optionally: `staging` branch → staging theme push.

GitHub Integration is the path-of-least-resistance for solo devs without CI. Shopify CLI requires more setup but gives us:

- Conditional deploy (push only when tests pass).
- Multiple environments per repo.
- Deterministic auth via tokens (no oauth dance per machine).
- Build steps before push (we don't have them today, but might in M2+).
- The ability to run theme-check / smoke tests *between* the merge and the live push.

## Decision

**Use Shopify CLI push from GitHub Actions for all environment promotions.** Do not connect the store to GitHub Integration.

Concretely:

- **M4** — `deploy-dev-preview.yml` runs `shopify theme push --theme $SHOPIFY_DEV_THEME_ID --allow-live=false --json` per PR; parses preview URL; comments on PR.
- **M5** — `deploy-production.yml` runs on push to `main`, after theme-check + smoke tests pass, runs `shopify theme push --theme $SHOPIFY_PROD_THEME_ID --allow-live`.
- Future `deploy-staging.yml` (likely between M4 and M5, or as a stub) handles `staging` branch → staging theme.
- Secrets: `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_CLI_THEME_TOKEN`, `SHOPIFY_DEV_THEME_ID`, `SHOPIFY_STAGING_THEME_ID`, `SHOPIFY_PROD_THEME_ID`.
- Auth via [`SHOPIFY_CLI_THEME_TOKEN`](https://shopify.dev/docs/themes/tools/cli/environments) — generated once from a [Theme Access](https://apps.shopify.com/theme-access) app password and stored as a GitHub repo secret.

## Consequences

**Positive:**

- Validation gate enforced: a green main isn't enough — theme-check + Lighthouse must pass *in CI* before the production push fires. GitHub Integration would push regardless.
- Per-PR preview comes for free — GitHub Integration can't do per-PR; you'd need a separate dev theme branch convention that gets messy fast.
- Multi-store scaling is trivial later — each store/theme is just another secret + workflow stanza.
- Tokens, not OAuth → CI is reproducible and not tied to a specific human's session.
- Matches the pattern shown in the reference doc (§11.3, §11.4).

**Negative:**

- Higher upfront cost than GitHub Integration. M3–M5 are the price.
- Token management: rotation, revocation, secret hygiene. Mitigated by using a single `SHOPIFY_CLI_THEME_TOKEN` scoped narrowly + GitHub repo secrets.
- If the dev store changes, every workflow's secret list needs updating. Use a dedicated `.env.example` (M3) to keep the canonical list.
- Slight drift risk if Shopify CLI changes flags between releases. Mitigation: pin CLI version in `package.json` (M2) once we have one.

**Neutral:**

- This decision is reversible. If CLI-based deploy turns out to be more friction than value, we can connect GitHub Integration on top of (or replacing) the CI workflows. ADR-supersedes flow handles this.

## Alternatives considered

| Alternative | Why rejected |
|---|---|
| **GitHub Integration only** | Loses the validation gate. A red theme-check would still ship to production. |
| **GitHub Integration for prod, CLI for dev preview** | Two systems to maintain. The infrastructure cost of CLI is a one-time setup; once paid, using it everywhere is cheaper than running both. |
| **Direct CLI push from local machine** | Already what we do today and is exactly what M3+ replaces. Doesn't scale, doesn't gate. |
| **Theme Kit (legacy)** | Deprecated by Shopify in favor of CLI. Don't.

## Migration path (if we ever supersede this)

If GitHub Integration becomes the better trade-off (e.g., team grows and per-PR preview cost becomes onerous; or Shopify changes auth model):

1. Connect store to repo from the Shopify Admin (production theme → `main`).
2. Disable `deploy-production.yml`.
3. Keep `deploy-dev-preview.yml` for PR previews — Integration doesn't cover this.
4. Document the swap in a follow-up ADR.

## Verification (CI deploy is "working")

(Verified in M4 and M5, not M0.)

- M4: Opening a PR pushes the branch to `$SHOPIFY_DEV_THEME_ID` and comments a working preview URL within ~2 minutes.
- M4: Closing the PR does **not** auto-clean the dev theme (cap at 19 unpublished themes is managed by recycling, not auto-delete — see M4 spec).
- M5: A merge to `main` triggers `deploy-production.yml` which runs theme-check first, then pushes only on green.
- M5: Reverting a problematic merge to `main` (and re-running the workflow) restores the previous theme version within 5 minutes.
