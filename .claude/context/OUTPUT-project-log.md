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

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# OUTPUT-project-log.md — v1.0

# AI Shopify Developer Bootcamp

# by Coding with Jan

# https://codingwithjan.com

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
