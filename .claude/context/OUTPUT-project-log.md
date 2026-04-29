[Do not write this manually. AI maintains this file automatically after every meaningful action.]

This is the project's persistent memory. AI reads it at the start of every session to restore context. It will contain:

- **Timestamped entries** — What was done and when
- **Decisions made** — What was decided and why, including alternatives that were considered
- **Architectural choices** — Technical decisions that affect the project long-term
- **Risks & open questions** — Things to watch out for in future development

---

## 2026-04-28 — M14 — Specs as planner input: resolver + ADR-011 + Figma MCP + hero demo

Pulled the M14 stub forward the same day the spec hierarchy shipped. Branch: `feature/m14-specs-as-planner-input` (stacked off `feature/m13-planner-architect-split`). The deliverable is the **by-reference contract** between the new `.claude/specs/` hierarchy and the M13 planner+architect agents — plus an end-to-end demo against the hero (Slideshow) section.

### What shipped

- **Spec resolver** at `orchestrator/src/agents/shared/resolveProjectContext.ts` — pure deterministic function. Maps a `FeatureRequest` to repo-relative paths: project + theme singletons, theme + figma analyses, page specs (via `targetPages` + title-substring fallback), section specs (via page frontmatter `sections[]` + alias map `hero/carousel/banner` → slideshow + word-boundary substring on the title). Capped at 5 section matches.
- **11 vitest cases** at `orchestrator/tests/resolveProjectContext.test.ts`. Runs against the live `.claude/specs/` tree — if a spec file gets renamed, the test fails with a clear pointer. Total suite now 36/36 passing.
- **ADR-011** at `.claude/architecture/adr/ADR-011-spec-hierarchy-as-planner-input.md`. Decision: by-reference (resolver returns paths; agent reads via `read_spec` tool; tool implementation deferred to M15). Bridge contract preserved — `TriagedFeatureRequestSchema` unchanged.
- **Figma MCP** registered in `.mcp.json` (`figma-developer-mcp@latest --stdio`, env-var `FIGMA_API_KEY`). Wired-but-not-exercised in M14; M14 demo doesn't require Figma round-trips. Required for the autonomous orchestrator (no IDE plugin).
- **Hero demo** at `.claude/features/feature-hero-test/` — `feature.md` (pause_on_hover brief) + sub-agent-captured `OUTPUT-planner-triage.md` + `OUTPUT-implementation-plan.md` + `RUN-NOTES.md`. Both outputs validate against M13 schemas.
- **M14 milestone stub** rewritten + ROADMAP M14 row updated to "In progress 2026-04-28". M15 row added for the deferred runtime work + ADR-012 stubbed.

### Demo outcome (the interesting part)

Used in-conversation Agent sub-agents as model surrogates (the `callPlannerModel`/`callArchitectModel` runtimes are still scaffolds — runtime wiring is M15). End-to-end:

1. **Planner triaged** the hero feature as **L2 ready** with 9 acceptance criteria, citing `slideshow.md` + `index.md` in `references[]`. Deterministic estimator re-derived 0.55 teamDays (0.5 baseline × 1.1 responsive multiplier).
2. **Architect read the live code** (not just specs) and found that `assets/slideshow-component.js` (a base/shared asset) needs editing for hover-pause to actually work — Swiper's `pauseOnMouseEnter` is unset and no `focusin/focusout` listeners exist. Per ADR-010's "respect the level signature" rule, it **emitted an `escalation` analysis PlanTask (L2 → L4)** instead of silently expanding write paths. The L4 followup plan is fully specced in `payload.recommendedFollowupPlanShape` (4 tasks: liquid + config + assets + validation).
3. **Latent bug surfaced** as a side effect: `motionReduced` isn't gating the autoplay branch in `slideshow-component.js` line 137. Out-of-scope for the hero feature; flagged as its own ticket.

Both outputs pass `PlannerOutputSchema.parse()` and `ArchitectOutputSchema.parse()` — bridge contract preserved.

### Decisions made

- **Mid-flight scope cut: SDK runtime wiring deferred to M15.** Original plan had M14 also wire `callPlannerModel`/`callArchitectModel` to the Anthropic Agent SDK. Advisor caught that this was scope creep over the M14 stub: the SDK uses Claude Code as a subprocess (subprocess auth, structured-output parsing, MCP wiring for two agents) and would have shipped untested in this environment. M14 instead validates the **shape** of the by-reference flow via sub-agent surrogates; M15 commits to the runtime with empirical signal in hand.
- **By-reference over by-value** for spec injection. Captured in ADR-011. Trade: extra tool round-trips per run, but bounded prompt cost as the hierarchy grows + agent decides what's relevant.
- **Resolver caps at 5 section matches.** Word-boundary substring on the title catches what's needed; the cap prevents prompt bloat from a sweeping title.
- **Hand-parsed YAML frontmatter** in the resolver — adding `js-yaml` would violate "Never Add dependencies without approval" in CLAUDE.md. The two shapes the spec-* skills emit (inline + block-list) are simple enough to parse with regex.
- **Architect routing for escalations: `targetAgent: validation`.** Debatable — could route back to the planner for re-triage, or to a dedicated escalation stage. Worth revisiting in M15. For now, `validation` is the most reasonable fit since the architect's `inspect-theme` evidence belongs there.

### Risks / open questions

- **Spec drift surfaced as a known unknown.** `slideshow.md`'s `## Visual behavior` line "Pauses on hover/focus" is aspirational, not factual. The architect caught it via live-code reading. A future `/validate-specs` skill (deferred) would surface this automatically. Until then, `last_curated` dates are the only drift signal.
- **Sub-agent surrogate ≠ runtime.** The demo proves the contract holds and prompts are well-formed, but a real pipeline run (M15) will use a different invocation path and may behave differently — particularly tool-use loops, multimodal image references, and structured-output enforcement.
- **Resolver false positives.** The page-frontmatter expansion surfaced 4 section specs (slideshow, product-tabs, collection-list, multicolumn) when only `slideshow` was relevant. Acceptable today; candidate for refinement once a pattern emerges in run logs.
- **`callPlannerModel`/`callArchitectModel` still throw at runtime.** TODO comments now point at M15 (open ADR-012 there). The CLI `pnpm run-feature` doesn't work end-to-end yet.
- **Figma MCP package canonicality.** `figma-developer-mcp` (community, by glips/Framelink) is the most established npm package; no official Figma MCP exists at present. Documented in ADR-011 and in `.mcp.json`. Swap if/when an official package lands.
- **Pre-existing tsconfig issue.** `pnpm lint` fails because `rootDir: "./src"` conflicts with `include: ["tests/**/*"]`. Pre-dates M14; affects all 7 test files. Vitest works (uses esbuild). Fix is its own micro-PR.

### Files touched (high-level)

Added: `orchestrator/src/agents/shared/resolveProjectContext.ts`, `orchestrator/tests/resolveProjectContext.test.ts`, `.claude/architecture/adr/ADR-011-spec-hierarchy-as-planner-input.md`, `.claude/features/feature-hero-test/{feature.md, OUTPUT-planner-triage.md, OUTPUT-implementation-plan.md, RUN-NOTES.md}`. Modified: `.mcp.json` (Figma MCP registered), `.claude/architecture/ROADMAP.md` (M14 row updated, M15 row + ADR-011 + ADR-012 entries added), `.claude/architecture/milestones/M14-specs-as-planner-input.md` (rewritten from stub), `orchestrator/src/agents/{planner,architect}/model.ts` (TODO comments now reference M15). Untouched: `orchestrator/src/types.ts` (M13 bridge contract preserved — `git diff main` is empty), all M13 schema/prompt files, `.claude/specs/*.md`, all specialist agents.

## 2026-04-28 — Layer 1 (Intent) build-out — spec hierarchy shipped (Phases 0–5)

Built the missing Layer 1 of the orchestration north star end-to-end. The system now generates, browses, and consumes a project-wide spec hierarchy that bridges the Shopify codebase and the Figma design source.

### What shipped

- **7 new skills** under `.claude/skills/`:
  - `onboard-figma` — design-side counterpart to `onboard-theme`. Walks the Figma file via Figma MCP, skips Archive, applies a Ready-for-Dev filter (with archive-fallback), produces `.claude/context/OUTPUT-initial-figma-analysis.md` + seeds `.claude/specs/_figma-index.json`.
  - `init-specs` — bootstraps `.claude/specs/` tree (gates on both onboard outputs).
  - `spec-theme` — derives `.claude/specs/theme.md` from the theme analysis + filesystem counts (thin pointer, not a duplicate).
  - `spec-project` — interactive 3-round Q&A → `.claude/specs/project.md`.
  - `spec-page` — reads `templates/<slug>.json` `order[]`, links Figma viewport frames, scaffolds `pages/<slug>.md`.
  - `spec-section` — parses `sections/<slug>.liquid` `{% schema %}`, produces `sections/<slug>.md` with **inline `### Block:` H3s** (no `/blocks/` folder in this theme).
  - `refresh-spec-viewer` — server-side renders all spec markdown to a static HTML 3-pane viewer at `.claude/specs/_viewer/` (gitignored). Vendored Python script at `.claude/skills/refresh-spec-viewer/render.py` using `python-markdown` + `PyYAML`.

- **Spec artifacts produced for the Rhythm Rocks project:**
  - `.claude/specs/project.md` — Rhythm Rocks (4 in-scope, 5 out-of-scope, 3-environment branching by role: customers/QA+PM/devs+agents)
  - `.claude/specs/theme.md` — Sleek v2.2.0 (10 critical gotchas, full inventory snapshot)
  - `.claude/specs/pages/index.md` — Home (18-section stack, 12 sections still missing specs)
  - `.claude/specs/sections/{slideshow,product-tabs,collection-list,multicolumn}.md`
  - `.claude/specs/_figma-index.json` — 15 nodes (12 page-kind + 3 component-kind), 2 entries linked to `pages/index`

- **Existing skills wired** (Phase 5):
  - `scope-feature/SKILL.md` Inputs section now reads project + theme + matched page/section specs + figma analysis.
  - `plan-feature-implemenation/SKILL.md` same wiring.
  - `start-feature/skill.md` adds a new Step 4 to auto-link relevant specs into freshly-created feature folders.
  - `.claude/CLAUDE.md` got a "Specs — `.claude/specs/`" section explaining the hierarchy + onboard chain.

- **Roadmap updated:** ROADMAP.md adds an L1+ row (this work) and an M14 stub. M14 spec at `.claude/architecture/milestones/M14-specs-as-planner-input.md` describes wiring specs into the autonomous orchestrator's Planner once a real feature has run end-to-end.

### Decisions made

- **One Shopify template = one page spec.** Both viewports' Figma references go in the same file's `figma[]` array (with `viewport: desktop|mobile`). Viewport-level differences live in the body's "Responsive notes" section. This aligns specs with the implementation unit (a single rendering template).
- **Block specs are nested inline** as `### Block: <name>` H3 sections under `## Blocks` in section spec bodies. Driven by the theme having no `/blocks/` folder (blocks live in `{% schema %}` inline).
- **Bootstrap-once + manual curation.** A future `/validate-specs` skill (out of scope) will detect drift between specs and code. For now `last_curated` dates make staleness visible.
- **Static HTML viewer over Polaris web app or Figma plugin** — shipped value first; an interactive UI can layer on top later if useful. Viewer renders server-side (Python markdown lib) so it opens via `file://` with no dev server.
- **Dev-Mode "Ready for Dev" detection used a fallback.** The Figma Plugin API didn't expose `devStatus` on this file (no SECTION nodes; PAGE nodes lack the property; FRAME nodes throw "not yet supported"). Recorded as `dev_ready_source: "fallback-non-archive"` on every index entry so the limitation is transparent. Re-runs will pick up native Dev Mode flags if/when the file restructures.
- **Inline copy stays out of specs.** Locale JSON files own all text. Section specs reference `t:` keys by name only.
- **"Each viewport is a page" in the index, but one spec per template.** Resolved a tension in the user's earlier instruction — the figma-index records 12 page-kind entries (desktop + mobile + filter states + mega-menu states); the page spec FILES align with implementation reality (one file per Shopify template).
- **Inventory snapshot at curation time, not at runtime.** `theme.md` carries `inventory:` counts in frontmatter, stamped with `last_curated`. The filesystem is checked at curation; drift over time is the cost of snapshotting. Trade-off chosen because runtime counts make for noisy diffs.

### Risks / open questions

- **Spec/code drift.** No automated drift detection yet. Sections' `.liquid` schemas can be edited independently of their spec files. Mitigation: future `/validate-specs` skill (deferred).
- **Thumbnails are not yet cached locally.** The `thumbnail` field in `_figma-index.json` is `null` on every entry. Phase 0 deferred binary-write via the MCP since `get_screenshot` returns inline image data and the path to write PNGs from MCP responses isn't trivial. The viewer renders a "thumbnail not cached" placeholder. Resolve when re-running the viewer needs visual fidelity (use_figma's `node.screenshot()` returns inline images that could be written via a renderer-side helper).
- **Mega-menu states classified as page-kind in the index but conceptually section states.** All 5 ship inside `sections/header.liquid`. The `header` section spec is not yet written — `linked_specs[]` will tie all 5 to it once `/spec-section header` runs.
- **12 sections from the Home page stack still need specs.** `highlight-text-with-image`, `products-bundle`, `card-images`, `feature-list`, `rich-text`, `custom-content`, `image-with-text`, `products-showcase`, `scrolling-promotion`, `featured-products-tab`, `testimonials`, `collapsible-tabs`. Tracked in the in-session task list as a roadmap item.
- **PDP, Collection, header section group not yet specced.** Next priorities for spec coverage. The PDP focus is `98:11` (Add to Bag); `120:40` (Select this Ring) is excluded. Mobile collection canonical is `98:2066`; `98:2619` excluded.
- **M14 trigger is empirical, not calendar-based.** Don't wire specs into the autonomous Planner until a real feature has run end-to-end through `/scope-feature` → `/plan-feature-implemenation` → ship and exposed a measurable benefit (e.g. "the planner missed a critical gotcha because it didn't read theme.md"). See M14 stub for criteria.

### Files touched (high-level)

Added: 7 new skill folders under `.claude/skills/`, `.claude/specs/` tree (project, theme, pages/index, 4 sections, templates, figma index, viewer), `.claude/context/OUTPUT-initial-figma-analysis.md`, `.claude/architecture/milestones/M14-specs-as-planner-input.md`. Modified: `.gitignore` (viewer + thumbnails), `.claude/CLAUDE.md`, `.claude/architecture/ROADMAP.md`, `scope-feature/SKILL.md`, `plan-feature-implemenation/SKILL.md`, `start-feature/skill.md`. Untouched: M13 orchestrator code, `.mcp.json`, `OUTPUT-initial-theme-analysis.md`.

## 2026-04-27 — M13 — Phase-2 split (Planner ≠ Architect) + L1–L6 feature levels

- **Branch `feature/m13-planner-architect-split`** (stacked off `feature/m11-governance`). Pulled forward from M12 by user direction — not by ADR-006's prompt-bloat / multi-store / observation-pattern triggers. Motivation is **role-language separation**: planner speaks NL with PM-technical fluency (no file paths or class names); architect speaks senior-developer (concrete paths, Liquid objects, CSS classes). See [ADR-010](../architecture/adr/ADR-010-planner-architect-split.md). ADR-006 marked Superseded.
- **New bridge type `TriagedFeatureRequest`** in `orchestrator/src/types.ts`. Carries either `{ status: "ready", level, estimatedEffort, acceptanceCriteria, references }` or `{ status: "held", heldReason, missingInputs }`. `RunFeatureResult` is a discriminated union — held requests short-circuit before the architect.
- **L1–L6 levels defined by file-glob signatures** (not prose) in `orchestrator/src/agents/level.ts`. L1 = JSON/customizer, L2 = liquid edit, L3 = new section (`section-*` prefix), L4 = base CSS/JS additions, L5 = new templates/layout, L6 = held/out-of-scope. Both prompts inject the level table at load time via `{{LEVEL_TABLE}}` substitution — single source of truth, no drift.
- **Deterministic `estimateTeamDays(level, factors)`** in `orchestrator/src/agents/planner/estimate.ts`. Multipliers compose multiplicatively, **uncapped** by design (variantCount>3 ×1.25, copyDensity=high ×1.15, novelComponent ×1.4, responsive ×1.1). Model proposes factors, harness produces the number. Reproducible across runs; recalibration is a single-file edit.
- **`permissions.yml` agent count: 6 → 7** (added `planner` + `architect` as separate read-only entries; both retain broad theme read access). M11's acceptance line patched accordingly.
- **Architect schema rejects held inputs via `.refine()`** — defense in depth on top of the workflow runner short-circuit. Smoke test asserts the rejection message.
- **Scaffold-only.** Both `model.ts` files throw "not yet implemented at runtime"; M14 wires the Anthropic Agent SDK + multimodal image content blocks for image references in `.claude/features/<id>/reference/`.
- **Decisions / alternatives considered:**
  - **Path B (new M13 milestone) over Path A (rebase M7).** Atomic supersede preserves honest history (ADR-006 was the right Phase-1 call; ADR-010 captures the deliberate move). Avoids cascading rebase across 5 stacked branches.
  - **Deterministic estimator over model-judgment.** "Auto-calculated based on team-equivalent effort" implies determinism. Heuristic table is recalibratable; model judgment is not reproducible.
  - **Two agents, not three.** Considered Planner → Triage → Architect; rejected as adding hand-off without proportional benefit. Triage fits inside the planner.
  - **Architect handles all ready levels (including L1).** L1 trivially passes through — no fast-path for customizer-only changes — to keep one routing rule and consistent observation attribution.
- **Risks / watch-outs:**
  - **Prompt template drift** between planner and architect — mitigated by shared `level.ts` + `{{LEVEL_TABLE}}` substitution. If a future edit forgets to call `renderLevelTableMarkdown()`, the model gets a literal placeholder.
  - **Estimator calibration** is a guess until 5–10 real runs accumulate. Risk: estimates feel off. Mitigation: deterministic = recalibration is one constant edit.
  - **Architect's level-signature respect is prompt-enforced, not runtime-enforced.** A misbehaving architect could emit out-of-level write paths; M11 file-glob policy still catches these at write time. Promoting to runtime enforcement is M13.1.
  - **Held-state UX is synchronous** — caller blocks until human provides missingInputs. Deferred queue persistence to a later milestone.
- **Open follow-ups (not blocking M13):** held-state persistence to `.claude/features/<id>/HELD.md`; level→glob enforcement in `policy.ts` (M13.1); auto-re-triage on architect escalation; multimodal image content block transmission (M14); `/scope-feature` and `/plan-feature-implemenation` adopting L1–L6.

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

## 2026-04-26 — M11 — Governance + observability (scaffold)

- Branch `feature/m11-governance`. Files: `.claude/architecture/permissions.yml`, ADR-007 (permissions), ADR-008 (observability logs), `orchestrator/src/orchestrator/{policy.ts, logger.ts}`, `.claude/logs/{.gitignore, runs/.gitkeep}`, `runbooks/orchestrator-rollback.md`, smoke test, M11 spec, minimatch dep added.
- Centralized policy via YAML — every agent's write_globs + global_forbidden defined once. `policy.ts::ensureCanWrite()` gates writes; throws `PolicyViolationError` on mismatch.
- JSONL audit logging at `.claude/logs/runs/<plan-id>.jsonl` — gitignored, append-only, per-plan. logger.ts is the single write point.
- Rollback runbook covers 4 scenarios: bad PR, policy violation, credential leak, infinite loop.
- Decision (ADR-007): policy is YAML, not code. Defense-in-depth = harness regex + central enforcement.
- Decision (ADR-008): JSONL, no SaaS, 90-day retention, gitignored. js-yaml swap deferred (inline parser sufficient for current YAML shape).
- Watch-outs: `ensureCanWrite` not yet plumbed into every `writeTheme` (post-merge follow-up); secret redaction tests pending; manual log rotation.

## 2026-04-26 — M10 — Deployment agent (scaffold)

- Branch `feature/m10-deployment-agent`. Files: `orchestrator/src/agents/deployment/{prompt.md, schema.ts, harness.ts, index.ts}` + smoke test + M10 spec.
- Encodes `.claude/rules/git-workflow.md` verbatim. Refuses on env branches, refuses on `needs_fixes` validation, marks `human_review` as `wait_for_human`.
- Pair-review-required inferred from `targetEnv ∈ {staging, main}` and surfaced in the response.
- Real git + octokit calls via M7 tool wrappers. `GITHUB_TOKEN` required at runtime.
- Watch-outs: scaffold doesn't auto-merge anything; even on `pass` + `development`, only opens a PR. Auto-merge is a deferred enhancement post-M11.

## 2026-04-26 — M9 — Validation agent (scaffold)

- Branch `feature/m9-validation-agent`. Files: `orchestrator/src/agents/validation/{prompt.md, harness.ts, schema.ts, index.ts}` + smoke test + M9 spec.
- Three-tier model: Toolkit (stubbed), theme-check (real shell-out, parses JSON output), Lighthouse (stubbed).
- Decision rule: `pass` when all tiers green; `needs_fixes` for tier-1/-2 errors; `human_review` for ambiguous cases or when any tier is unavailable. Never silently skip — that's the load-bearing safety property.
- Routing logic returns empty `[]` today; real routing lands when M8 model calls return file-level errors we can match.
- Watch-outs: Toolkit availability check happens at runtime (no compile-time guarantee). If Shopify CLI is missing, theme-check falls through to `human_review` rather than reporting fake `pass`.

## 2026-04-26 — M8 — Specialist agents (liquid / config / assets)

- Branch `feature/m8-specialist-agents` (stacked off M7). Files: 9 in `orchestrator/src/agents/{liquid,config,assets}/{prompt,harness,index}.ts/md` + `orchestrator/src/orchestrator/dispatch.ts` + workflow-runner update + specialists.smoke.test.ts + M8 spec.
- Each specialist has a file-glob policy enforced procedurally (regex globs in harness). M11 will centralize via `permissions.yml`.
- Workflow runner now calls `dispatchTask` per PlanTask. Specialists return scaffold observations (`success: false`, "not yet implemented at runtime"). The dispatch path is real; the model calls aren't.
- Smoke tests verify policy refusal — e.g. liquid agent given `assets/foo.css` returns `success: false` with "File-glob policy violation."
- `dispatch.ts` uses TypeScript exhaustiveness check (`_exhaustive: never`) so adding a new `targetAgent` enum value forces a dispatch branch.
- Watch-outs: scaffold returns `success: false` for the user — don't read M8's "merged" status as "feature builds work end-to-end." M9–M11 are still required.

## 2026-04-26 — M7 — Planner+Architect agent (scaffold)

- Branch `feature/m7-planner-architect` (stacked off M6). Files: `.mcp.json`, `orchestrator/{package.json, tsconfig.json, README.md, src/types.ts, src/tools/*, src/orchestrator/*, src/agents/planner-architect/*, src/index.ts, tests/}`, ADR-006, M7 spec.
- **Scaffold only.** `pnpm install` not run. `tsc` not run. `vitest` not executed. Specifically `tools/shopify-dev-mcp.ts::createShopifyDevMcpClient` and `agents/planner-architect/model.ts::callPlannerArchitectModel` throw "not implemented yet." User accepts trade-off per /loop framing.
- Pattern B (Toolkit MCP) activated by `.mcp.json` at repo root — interactive Claude Code sessions will now ALSO reach the Toolkit through the MCP server in addition to the Pattern A plugin.
- Combined planner-architect agent per ADR-006 (Phase-1 recommendation from source doc §5.2). Split criteria documented: ≥2 of {prompt > 6k tokens, multi-theme conflicts, persistent attribution problems, Theme App Extension feature}.
- Decision: orchestrator lives in `orchestrator/` at repo root (not separate repo per ADR-005 / decisions in M0). Excluded from theme push via `.shopifyignore` (added in M2).
- Watch-outs: package version drift (Anthropic Agent SDK in flux); MCP cold-start latency (revisit if > 5s); prompt drift (monitor for M12 split-trigger).

## 2026-04-26 — M6 — Tier-2 custom skills

- Branch `feature/m6-tier2-skills` (stacked off M5). Files: 6 `.claude/skills/<skill>/SKILL.md` (inspect-theme, edit-liquid-section, edit-config-json, edit-assets, run-validation, manage-feature-branch) + M6 spec.
- Each SKILL.md mirrors the existing `scope-feature/SKILL.md` format. Documents inputs, process, output, file-glob policy hint (M11 enforces).
- Decision: skills are documents, not code. M7+ agents will be the consumers that turn description into action. No code in M6.
- Boundary rule (per ADR-004): if Shopify Toolkit ships a skill that does X, don't write a Tier-2 wrapper that duplicates X. Tier-2 only wraps Toolkit when adding orchestration logic around it (e.g. `run-validation` aggregates Toolkit + theme-check + Lighthouse).
- Watch-outs: skills cite FoxTheme conventions (rgb-triplet color vars, `1rem = 10px`, breakpoints) — refresh when theme is vendor-updated. Until M11 enforces file-glob policy, the boundary is convention-only.

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
