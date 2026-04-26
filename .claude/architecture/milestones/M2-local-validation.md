# M2 — Local Validation Guardrails

**Status:** Code merged, awaiting verification (PR open).
**Effort:** S.
**Owner:** Rinaldo.
**Branch:** `feature/m2-local-validation` (stacked off `chore/m1-toolkit-quickstart`).
**PR target:** `development`.

---

## Goal

Establish a single, reproducible local-dev loop for this theme: theme-check passes, prettier formats consistently, and `shopify theme dev` boots against a named environment. Same commands work locally and in CI (M3 layers on top).

## Why

Today every change ships on local trust. theme-check has never run against this repo. Prettier has never normalized formatting. There's no `shopify.theme.toml` so `shopify theme dev` can't target environments by name.

This milestone is pre-CI: get the local-dev story right first, then M3 wires the same commands into GitHub Actions.

## Scope

In:

- `package.json` — scripts (`lint:theme`, `format`, `format:check`, `dev`, `preview`, `validate`), Node 20 engine pin, prettier + plugin devDeps. No runtime deps.
- `.theme-check.yml` — config tuned for FoxTheme, ignores `.claude/`, `.github/`, `orchestrator/`, `runbooks/`.
- `shopify.theme.toml` — `[environments.development|staging|production]` with TODO placeholders for store + theme IDs.
- `.shopifyignore` — exclude tooling, agent docs, orchestrator, CI from theme push.
- `.claude/architecture/local-dev.md` — quickstart.

Out:

- CI integration (M3).
- Lockfile (`package-lock.json` / `pnpm-lock.yaml`) — user runs `npm install` to generate after merge.
- Auth setup (`shopify auth login` is interactive).
- Lighthouse / accessibility tooling (deferred to M9).

## Files in this PR

- `package.json` (new)
- `.theme-check.yml` (new)
- `shopify.theme.toml` (new)
- `.shopifyignore` (new)
- `.claude/architecture/local-dev.md` (new)
- `.claude/architecture/milestones/M2-local-validation.md` (this file)
- `.claude/architecture/milestones/README.md` (M2 stub trimmed)
- `.claude/architecture/ROADMAP.md` (status row updated)
- `.claude/context/OUTPUT-project-log.md` (entry appended)

## Pre-flight (user actions to mark M2 Done)

- [ ] `npm install` to generate the lockfile.
- [ ] Fill in `shopify.theme.toml` with real store domain + theme IDs.
- [ ] `shopify auth login` (one-time per machine).
- [ ] `npm run lint:theme` — expect *some* errors/suggestions on first run; that's the baseline. File a follow-up ticket if a rule looks wrong, don't disable it without comment.
- [ ] `npm run dev` — should boot a localhost preview against the development theme.
- [ ] Commit the generated lockfile + filled `shopify.theme.toml` (or only `shopify.theme.toml` if the lockfile is gitignored elsewhere).

## Acceptance criteria

- [ ] All files in the PR list exist and parse (JSON/YAML/TOML valid).
- [ ] Prettier config doesn't mangle existing Liquid (validated by spot-checking `npm run format:check` on a known-good section).
- [ ] `.theme-check.yml` ignores hit the right paths (orchestrator/, .claude/, etc.).
- [ ] `local-dev.md` covers install → run → push.
- [ ] Project log entry appended.
- [ ] PR merged to `development`.

## Risks

- **theme-check defaults may flood with FoxTheme false positives.** Mitigation: `.theme-check.yml` includes a "Rules disabled with justification" section ready for additions; no rules are disabled day-1 because we don't know yet what fires. M3's first CI run surfaces them.
- **Prettier reformats existing files when run for the first time.** Mitigation: `format:check` is the CI-friendly variant (read-only). User may want to run `format` once on a dedicated commit to normalize the codebase before turning on CI.
- **TOML is the modern Shopify CLI config; older tutorials may still reference `shopify.theme.config.yml`.** Mitigation: spec links to current Shopify CLI docs; ignore older formats.
- **`shopify.theme.toml` with TODO placeholders will cause CLI errors until filled.** Mitigation: documented in pre-flight; CLI error messages name the missing field.

## Dependencies

- Node 20+ available locally (CI matrix in M3).
- Shopify CLI installed globally (`npm install -g @shopify/cli @shopify/theme`).
- Access to a Shopify dev theme.

## Out of scope

- CI workflow (M3).
- Auto-format pre-commit hook (deferred — would require Husky or similar; revisit if drift becomes a problem).
- Bundler / asset pipeline (this theme has none, intentionally).
