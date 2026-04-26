[Do not write this manually. AI maintains this file automatically after every meaningful action.]

This is the project's persistent memory. AI reads it at the start of every session to restore context. It will contain:

- **Timestamped entries** — What was done and when
- **Decisions made** — What was decided and why, including alternatives that were considered
- **Architectural choices** — Technical decisions that affect the project long-term
- **Risks & open questions** — Things to watch out for in future development

---

## 2026-04-25 — Onboarded theme: Sleek v2.2.0 by FoxEcom

Ran `/onboard-theme` and generated `OUTPUT-initial-theme-analysis.md`. Key takeaways for future feature work:

- **Section padding deviates from bootcamp template.** This theme uses a single shared `.section--padding` class that reads `--section-padding-top` / `--section-padding-bottom` from inline styles. Do NOT generate per-section `.section-{{ section.id }}-padding { ... }` style blocks — use the shared class.
- **Global JS namespace:** `window.FoxTheme` (config, utils, a11y, pubsub, Carousel/Swiper wrapper, routes, settings, strings). Reuse before writing new helpers.
- **Pub/sub events** are defined at `FoxTheme.pubsub.PUB_SUB_EVENTS` — use these for cart/variant/facet/quantity events, not ad-hoc `CustomEvent`.
- **~67 custom elements** already exist (modals, drawers, cart, product-form, accordion, tabs, motion, parallax, etc.). Inventory in the analysis file.
- **CSS:** RGB-triplet color vars consumed with `rgb(var(--color-X))`. Root font-size `62.5%` → `1rem = 10px`. Tailwind-style utilities with prefixes `sm/md/lg/xl/xxl` (640/768/1024/1280/1536).
- **Schema convention:** standard 22-setting order ending with `padding_top/padding_bottom/show_section_divider/divider_width/custom_class`. Almost every section has presets and uses `disabled_on: { groups: [footer, header, custom.overlay] }`.
- **Translations:** All schema labels use `t:` keys; 50 locales present.

Open items:
- `.claude/context/client-notes.md` is empty.
- `.claude/context/reference/` does not exist yet — no design assets or brand references to reason about.

## 2026-04-25 — Initial GitHub push + git workflow defined

- **Repo created and pushed:** `https://github.com/rinaldomelo/onlinerevamp` (currently public, will flip to private later — reminder routine `trig_01J4JivG4bbvof1mUKeFHDB1` fires 2026-05-09 to nag). `gh` configured as the git credential helper under user `rinaldomelo`. Initial commit on `main` contains the Sleek v2.2.0 theme + `.claude/` scaffolding.
- **Long-lived branches created from `main`:** `development` (integration) and `staging` (pre-prod QA). Both pushed to origin. All three environments now exist on the remote.
- **Git workflow rule formalized** in `.claude/rules/git-workflow.md` (auto-injected, replaced the prior 4-line stub). The rule: PRs always go *from feature branch* to a target environment — never `development → staging` or `staging → main`. Pair review required for `staging` and `main`; `development` review is recommended only. Why: keeps environments isolated, lets features promote independently, makes rollback a single-PR revert.
- **Decisions / alternatives considered:**
  - File location: chose to replace the auto-injected `.claude/rules/git-workflow.md` rather than create a separate `context/` doc, so the workflow is always loaded into session context.
  - Emergency theme backup before merging to `main` was deferred — site is pre-launch so a Shopify Admin theme duplicate isn't useful yet. Documented as a single-line "pre-launch note" in the workflow file to revisit at go-live.
- **Risks / watch-outs:**
  - Repo is public with a commercial third-party theme (Sleek/FoxEcom). Time-bound risk until the scheduled visibility flip.
  - No branch protection rules configured on GitHub. Pair-review enforcement currently relies on convention only — consider enabling required reviews on `staging` and `main` once the team is set up.
  - No CI/CD wired up yet; nothing prevents direct push to `main`/`staging` from a local machine. Worth revisiting when feature work starts.

## 2026-04-25 — Feature: dark-mode-shell (homepage + header + footer)

- **What was built:** Site shell renders in dark mode by default — black background, white text, white-bg buttons with black labels. Branch `feature/dark-mode-shell`, commit `4bf14df`, PR #1 to `development` (https://github.com/rinaldomelo/onlinerevamp/pull/1).
- **Files touched (4):** `templates/index.json` (37 `color_scheme` / `section_color_scheme` values), `sections/header-group.json` (main header), `sections/footer-group.json` (footer), `sections/footer.liquid` (schema default).
- **Key decision — reuse `scheme-inverse` instead of defining a brand-tuned dark scheme.** `scheme-inverse` already exists in `config/settings_data.json` (`bg #000000 / text #ffffff / button #ffffff / button_label #000000`) and was already used by one homepage block. Reassigning every section's `color_scheme` to it is a pure-config change — no new scheme, no CSS overrides, no JS. Trade-off accepted: pure-black palette vs. softer brand-tuned dark (e.g. `#0F1115` bg). Revisit if the brand wants something less stark.
- **Skipped formal feature scaffolding.** No `feature.md`, no `OUTPUT-implementation-plan.md`, no `OUTPUT-qa-debugging.md` — this was a small reassignment, not a new component build. The feature branch itself is the rollback "backup." Don't treat this as the standard pattern: future features that build new components/JS should still go through `/start-feature` → `/scope-feature` → `/plan-feature-implemenation`.
- **Permanent dark mode, not user-toggleable.** No JS toggle, no system-pref detection, no persistence. v1 = brand identity is dark.
- **Out of scope (potential follow-ups, captured here so they don't get lost):**
  - `.btn--white` in `assets/theme.css` is hardcoded `#fff` — does not respect any scheme. Confirmed visually fine on dark for now; revisit if any usage looks wrong.
  - Slideshow `image_overlay_opacity` values were tuned for light backgrounds — confirmed visually OK at QA, leaving as-is.
  - Product / collection / cart / blog templates still render light. They'll look jarring next to a dark homepage. Plan a follow-up feature `dark-mode-templates` to extend the shell-wide treatment.
- **Risks / watch-outs:**
  - Pure-black backgrounds can read as too stark for image-heavy sections — keep an eye during photography swaps.
  - Footer schema default is now `scheme-inverse`, so any future `/start-feature` that re-instantiates the footer will default to dark. If the brand ever moves back to a light footer, that default needs to flip back too.

## 2026-04-25 — Architecture: M0 — agentic orchestration roadmap drafted

- **What was built:** Long-form architecture roadmap landing the agentic Shopify-theme-system design from `~/Downloads/shopify-agentic-theme-system_1.md` into this repo. New folder `.claude/architecture/` contains `ROADMAP.md` + 5 ADRs + 2 milestone specs + an index. Branch `chore/architecture-m0`, PR target `development`.
- **Files added (9):** `.claude/architecture/ROADMAP.md`, `adr/ADR-001..ADR-005-*.md`, `milestones/README.md`, `milestones/M0-architecture-prep.md`, `milestones/M1-toolkit-mcp-wiring.md`. Plus this log entry.
- **Key decisions (now Accepted ADRs):**
  - **ADR-001** Adopt Shopify AI Toolkit via Pattern A (Claude Code plugin install in M1). Pattern B (programmatic MCP) deferred to M7 — no consumer for it before then. Pattern C (vendoring) skipped entirely.
  - **ADR-002** When M7 lands, declare `@shopify/dev-mcp` in repo-root `.mcp.json`. Don't add the file before there's a consumer — dead config rots.
  - **ADR-003** Use Shopify CLI push from GitHub Actions for *all* env promotions (dev preview / staging / prod). Reject GitHub Integration because it can't gate on theme-check / Lighthouse before the push.
  - **ADR-004** Two-tier skills: Tier 1 = Shopify AI Toolkit (don't reimplement); Tier 2 = `.claude/skills/` (our orchestration). Existing 4 skills are already Tier 2 — no rename or restructure needed.
  - **ADR-005** Orchestrator is TypeScript on Node 20 + Anthropic Agent SDK + pnpm. Code lives at top-level `orchestrator/`, excluded from Shopify push via `.shopifyignore`. Theme repo and orchestrator stay in the *same* repo until M12 (criteria-based split).
- **Roadmap shape:** 13 milestones (M0–M12). M0 = this. M1–M5 = pure DevOps (no LLM in the loop): Toolkit plugin, local validation, CI, preview-URL bot, prod deploy guardrails. M6 = Tier-2 skills evolution. M7–M10 = Agent SDK orchestrator (planner+architect, then specialists, then validation, then deployment). M11 = governance/observability/audit logs. M12 = conditional Phase-2 split + Theme App Extension support, only when criteria met.
- **Out of scope (recorded so they don't get lost):**
  - Migration platform from source doc §15.5 (WooCommerce/Wix/Wordpress → Shopify) is *not* on this roadmap. Gets its own when prioritized.
  - ADR-006..ADR-009 are deferred to their owning milestones (M7, M11, M11, M12 respectively). Don't pre-write them.
  - Vendoring the source doc into `.claude/architecture/source/` skipped this round; reference path stays at `~/Downloads/shopify-agentic-theme-system_1.md`. Add the vendored copy in a follow-up if other contributors join.
- **Sequencing principle (the load-bearing one):** Cheapest-and-highest-leverage first. Validation/CI infra (M1–M5) before any agent layer (M7+), because *agents without automated validation are worse than no agents at all.*
- **Risks / watch-outs:**
  - Doc rot. Mitigation: every milestone closes by flipping its row in `ROADMAP.md` to `Done` and appending a project-log entry — same protocol the dark-mode and new-hero features already follow.
  - Architecture astronaut risk. Mitigation: only 5 ADRs in M0, only the forks that actually block M1. Rest deferred.
  - Plugin install (M1) is per-machine. If a future contributor joins, they re-run `m1-toolkit-quickstart.md`. Mitigation: documented and linked from `CLAUDE.md` in M1.
  - `.mcp.json` at repo root (added in M7) will *also* affect interactive Claude Code sessions. Document the behavior change in the M7 spec when written.

## 2026-04-26 — M5 — Production deploy guardrails

- Branch `feature/m5-prod-deploy` (stacked off M4). Files: `ci-staged/.github/workflows/deploy-production.yml`, `runbooks/pre-launch-backup.md`, `runbooks/rollback.md`, M5 spec.
- Two-job workflow: `validate` (theme-check + format-check) → `deploy` (Shopify CLI push to prod). `deploy` gated by GitHub `production` Environment (5-min wait timer + required reviewer), `--allow-live` flag explicit.
- `concurrency: deploy-production`, `cancel-in-progress: false` — prod pushes are serialized, never racing.
- Rollback strategy: 3 paths documented. Path A (republish emergency theme) = ~30s; Path B (Git revert + re-deploy) = ~10min; Path C (Shopify-native version restore) = fallback.
- `pre-launch-backup.md` is informational pre-launch; flip to Required when site goes live.
- Watch-outs: GitHub Environment misconfiguration (forgetting deployment branch rule) is a common gotcha — pre-flight calls it out. Auto-cancel is OFF for prod deploys; rapid merges queue.

## 2026-04-26 — M4 — Preview-URL bot

- Branch `feature/m4-preview-bot` (stacked off M3). Files: `.claude/architecture/ci-staged/.github/workflows/deploy-dev-preview.yml`, `.claude/architecture/preview-themes.md`, M4 spec.
- Workflow runs on PR open/sync/reopen + paths-filtered to theme files. Pushes to dev theme via Shopify CLI, posts/updates a `comment_tag: preview-url` comment on the PR.
- `concurrency: dev-preview-<PR>` + `cancel-in-progress: true` → dev theme always reflects the most recent commit, no racing pushes.
- Decision: recycle single dev theme (not spawn-per-PR) — Shopify caps unpublished themes at 19; per-author rotation deferred until > 1 active dev.
- Workflow YAML staged at `ci-staged/` (same OAuth scope blocker as M3); user activates via `git mv` after `gh auth refresh`.
- Watch-outs: `--allow-live=false` flag is critical; CLI JSON shape may shift (mitigated by `jq` fallbacks + raw-output artifact).

## 2026-04-26 — M3 — CI foundation

- Branch `feature/m3-ci-foundation` (stacked off M2). Files: `.github/workflows/theme-check.yml`, `.env.example`, `.github/CODEOWNERS`, `.claude/architecture/ci-secrets.md`, M3 spec.
- Workflow runs `shopify theme check` + `npm run format:check` on every PR touching theme paths. Hard-fails (`continue-on-error: false`).
- Secrets catalog: `SHOPIFY_CLI_THEME_TOKEN`, `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_DEV_THEME_ID`, `SHOPIFY_STAGING_THEME_ID`, `SHOPIFY_PROD_THEME_ID`. Set via `gh secret set` per pre-flight.
- Branch protection + GitHub Environments are admin-UI only; documented in `ci-secrets.md` rather than auto-configured.
- Watch-outs: first CI run will likely be red until the codebase is normalized via prettier; expected. theme-check baseline noise is expected too — disable rules only with documented justification.

## 2026-04-26 — M2 — Local validation guardrails

- Branch `feature/m2-local-validation` (stacked off M1). Files: `package.json`, `.theme-check.yml`, `shopify.theme.toml`, `.shopifyignore`, `.claude/architecture/local-dev.md`, M2 spec.
- `package.json` has scripts only — no runtime deps. theme-check ships with Shopify CLI; prettier + Liquid plugin are devDeps the user installs once.
- `.theme-check.yml` starts with default rule severities; "Rules disabled with justification" section prepared for additions when M3's first CI run surfaces FoxTheme false positives. No disables day-1.
- `shopify.theme.toml` env stanzas have TODO placeholders for store domain + theme IDs — user fills in pre-flight.
- `.shopifyignore` excludes `.claude/`, `.github/`, `orchestrator/`, `runbooks/`, lockfiles, prettier config, OS artifacts.
- Watch-outs: prettier first-run will reformat existing Liquid; recommend a dedicated normalize commit before CI hard-fails on `format:check`. theme-check baseline is unknown until first run — expect noise, document patterns before disabling rules.

## 2026-04-26 — M1 — Toolkit quickstart skeleton

- Branch `chore/m1-toolkit-quickstart` (stacked off M0). Files: `.claude/architecture/m1-toolkit-quickstart.md` with TODO markers + `CLAUDE.md` Shopify-Dev-MCP section updated with a pointer to the quickstart.
- Plugin install (`/plugin marketplace add ... && /plugin install ...`) is interactive in Claude Code and cannot be run autonomously. Skeleton lands in this PR; user fills in smoke-test outputs after installing.
- Decision (per ADR-001): Pattern A only in M1; Pattern B (`.mcp.json` + programmatic MCP client) deferred to M7.
- Watch-outs: skill names may drift between Toolkit releases; quickstart links to the canonical README rather than redocumenting the skill set.

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# OUTPUT-project-log.md — v1.0

# AI Shopify Developer Bootcamp

# by Coding with Jan

# https://codingwithjan.com

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
