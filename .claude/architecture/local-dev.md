# Local Development Quickstart — Online Revamp

> Get a local Shopify theme dev loop running, plus theme-check + prettier.
>
> **Prerequisite:** Node 20+, the Shopify CLI installed (`npm install -g @shopify/cli @shopify/theme`), and access to a development theme on the Shopify store.

---

## One-time setup

1. **Install dev dependencies:**

   ```bash
   npm install
   ```

   (Installs prettier + the Shopify Liquid prettier plugin. theme-check ships with the Shopify CLI itself.)

2. **Fill in `shopify.theme.toml`:**

   Replace the `TODO-*` placeholders with the actual store domain (e.g. `online-revamp.myshopify.com`) and theme IDs from the Shopify admin (Online Store → Themes → … → "Edit code" URL contains the ID).

3. **Authenticate the Shopify CLI:**

   ```bash
   shopify auth login
   ```

   First-time use opens a browser. Subsequent commands are auto-authed for ~14 days.

## Day-to-day commands

### Run a live preview against the dev theme

```bash
npm run dev
```

(equivalent to `shopify theme dev --environment=development`)

This boots a localhost preview that hot-reloads on file changes. The preview proxies the store, so customer/order/product data is real (read-only).

### Run theme-check

```bash
npm run lint:theme
```

Runs against `.theme-check.yml`. Errors fail the run. Suggestions are informational. Use `npm run lint:theme:auto-correct` for safe auto-fixes (review the diff before committing).

### Format files

```bash
npm run format          # rewrites
npm run format:check    # CI-style check, exits non-zero on diff
```

Prettier is configured for JSON, CSS, Markdown, YAML, and Liquid (via `@shopify/prettier-plugin-liquid`). Liquid uses double quotes; JSON/CSS/MD use single.

### Push to a specific environment

```bash
shopify theme push --environment=development --unpublished --json
shopify theme push --environment=staging --unpublished --json
shopify theme push --environment=production --allow-live
```

Note: production push from a local machine is not the standard flow once M5 ships — production deploys go through the GitHub Actions workflow.

## What's excluded from the push

`.shopifyignore` excludes:

- `.claude/`, `.github/`, `orchestrator/`, `runbooks/` — tooling and architecture
- `node_modules/`, `package.json`, lockfiles
- `.theme-check.yml`, prettier config
- Editor/OS artifacts (`.DS_Store`, `.vscode/`)

If you add a new top-level folder that should NOT ship to Shopify, add it to `.shopifyignore`.

## When something fails

- **`shopify auth login` opens but doesn't return:** the redirect to `localhost` may be blocked. Use `--store=<domain>` flag instead, then re-authenticate via Theme Access (admin → apps → Theme Access).
- **theme-check explodes on FoxTheme conventions:** see the comments in `.theme-check.yml`. Disable specific rules with documented justification rather than running with `--no-config`.
- **`shopify theme dev` won't boot:** verify the dev theme ID in `shopify.theme.toml` matches a real, unpublished theme in the admin. CLI errors will mention the wrong ID by name.
- **Prettier formats something you didn't expect:** check `prettier.overrides` in `package.json`. Liquid + JSON differ on quote style intentionally.

## Going further

- M3 wires `npm run lint:theme` into GitHub Actions; same command works locally and in CI.
- M4 wires `shopify theme push --environment=development` into per-PR previews.
- M7+ orchestrator agents call `shopify theme check` programmatically through the validation skill.
