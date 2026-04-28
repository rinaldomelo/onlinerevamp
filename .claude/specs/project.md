---
kind: project
schema_version: 1
store:
  name: "Rhythm Rocks"
  myshopify: null
  prod_theme_id: null
why: "Phase 1 of an agentic theme-build workflow: produce a complete, durable specification of the project from the existing Sleek v2.2.0 base theme + the Rhythm Rocks Figma file. Customization scope is whatever's needed to honor the Figma design within the constraints of the base theme. Complexity, viability, and approach for any specific change are evaluated later, in the feature phase, by specialized agents."
scope:
  in:
    - "All public-facing pages represented in Figma (Home, Product Collection, PDP, Mega Menu)"
    - "Both desktop and mobile viewports as separate page specs"
    - "Filter states (filters open/drawer) as page states of the Product Collection"
    - "Mega-menu interface for 5 top-level categories (data wiring deferred)"
  out:
    - "Pages or sections not represented in Figma — fall back to the Sleek base theme defaults"
    - "Checkout customizations (Plus required)"
    - "Backend integrations and customer-account customizations"
    - "PDP / Select this Ring variant (deferred; Add-to-Bag PDP is the first pass)"
    - "Inline copy in specs — translation keys + locale JSON files own all text"
locales:
  primary: "en-US"
  count: 52
  policy: "Specs track structure only. Translations live in /locales — referenced by t: key, never inlined."
figma_sources:
  - label: "Rhythm Rocks Website Design"
    file_key: "pid87VYFva2zFBOXTChMVR"
    url: "https://www.figma.com/design/pid87VYFva2zFBOXTChMVR/Rhythm-Rocks-Website-Design"
    pages_included: 12
environments:
  main:
    role: "Production / published theme. Customer-facing."
    audience: "End customers."
  staging:
    role: "Pre-prod review."
    audience: "QA team, project manager."
  dev:
    role: "Integration playground for builders + specialized agents."
    audience: "Development team and the orchestration agents."
links:
  client_notes: ".claude/context/client-notes.md"
  theme_analysis: ".claude/context/OUTPUT-initial-theme-analysis.md"
  figma_analysis: ".claude/context/OUTPUT-initial-figma-analysis.md"
  figma_index: ".claude/specs/_figma-index.json"
  project_log: ".claude/context/OUTPUT-project-log.md"
last_curated: 2026-04-28
---

# Project — Rhythm Rocks

## Why we're customizing

Phase 1 of an agentic theme-build workflow. The goal of this spec hierarchy is to **fully specify** the project — what the store is, what the theme provides, which pages and sections need to exist, and how each one should behave. *How* and *whether* any specific change ships happens later, in the feature phase, where specialized agents (Planner, Architect, Implementation, Validation) evaluate each request against the specs.

Customization level is **driven by Figma**: anywhere the design is silent, the Sleek base theme's defaults stand. We do not redesign blindly. Anywhere the design is explicit, the spec captures the design intent for downstream agents to implement.

## Stakeholders (by role)

- **End customers** — see only `main` (the published theme).
- **QA team + Project manager** — review on `staging` before promotion to `main`.
- **Development team + agents** — iterate on `dev`. This is where builders and the specialized agents from M7+ (Planner, Architect, Liquid/Config/Assets, Validation, Deployment) operate.

## Environments → branches

Three branches, each connected to a separate Shopify theme. Branches are the source of truth — there is no fixed `prod_theme_id`.

| Branch | Shopify theme | Audience |
|---|---|---|
| `main` | Published | Customers |
| `staging` | Review | QA + PM |
| `dev` | Playground | Developers + agents |

Promotion follows `.claude/rules/git-workflow.md`: PRs land directly from feature branches into the target environment (no `dev → staging → main` cascade).

## Decisions made

- **Spec-first, not feature-first.** This phase fully specifies; it does not plan implementations. Feasibility, complexity, and L1–L6 level triage happen in the feature phase via the M13 Planner.
- **Branches > pinned theme IDs.** The 3-environment flow handles deploy targeting; the spec doesn't pin a numeric production theme ID.
- **Figma-driven scope.** Customization is whatever the Figma design requires. Anything not in Figma falls back to the Sleek default template.
- **Each viewport is a page.** Desktop + mobile of the same template are distinct page specs in `.claude/specs/pages/`. Filter states and mega-menu states also count as page-level specs.
- **Inline copy stays out of specs.** Locale JSON files own all text. Section specs reference `t:` keys by name only.
- **Dev-ready filter is a fallback.** The Plugin API didn't expose `devStatus` on this file's frames/pages, so we treat all non-Archive pages as ready (recorded as `dev_ready_source: "fallback-non-archive"` in the index). Revisit if/when SECTION nodes with Dev Mode flags get added.

## Open questions / next-action priorities

These are surfaced here so downstream `spec-page` and `spec-section` work has clear priorities.

- **Mobile Product Collection.** Use `98:2066` (the shorter, canonical layout). The longer `98:2619` alt is excluded.
- **V2 frame on Home (`17:1023`).** Deferred; revisit if a use becomes clear.
- **PDP focus.** First pass is Add-to-Bag (`98:11`). The "Select this Ring" variant (`120:40`) is deferred.
- **Mega Menu data wiring.** All 5 categories share the same `sections/header.liquid` mega-menu mode. The 5 frames specify the **interface**; the underlying navigation menu items in Shopify Admin may not exist yet — interface ships first, data wiring follows.
- **Two-mobile-collection question.** Resolved (`98:2066` chosen). Recorded above for traceability.

## In scope

- All public-facing pages represented in Figma (Home, Product Collection, PDP, Mega Menu)
- Both desktop and mobile viewports as separate page specs
- Filter states (filters open / drawer) as page-state specs of the Product Collection
- Mega-menu interface for 5 top-level categories (data wiring deferred)

## Out of scope

- Pages or sections not represented in Figma — fall back to the Sleek base theme defaults
- Checkout customizations (Plus required)
- Backend integrations and customer-account customizations
- PDP / Select this Ring variant (deferred; Add-to-Bag PDP is the first pass)
- Inline copy in specs — translation keys + locale JSON files own all text
