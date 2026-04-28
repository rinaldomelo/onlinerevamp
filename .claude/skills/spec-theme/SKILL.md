---
name: spec-theme
description: "Derives the theme spec from OUTPUT-initial-theme-analysis.md plus runtime filesystem counts. Writes .claude/specs/theme.md as a thin pointer to the analysis — no duplication of conventions, just frontmatter snapshot of inventory + critical gotchas + base-theme metadata. Run after /init-specs."
user-invocable: true
---

# Skill: Spec Theme

## Description

Generates `.claude/specs/theme.md` from `OUTPUT-initial-theme-analysis.md`. The output is intentionally thin — a stable, top-of-funnel pointer that downstream specs and feature work can reference. The detailed conventions stay in the analysis doc; this spec just snapshots inventory counts, base-theme metadata, and critical gotchas in a structured frontmatter so other tools can read them programmatically.

## When to Use

- After `/init-specs` has scaffolded the specs folder.
- Whenever the theme analysis is regenerated and you want the spec snapshot to refresh (just rerun this skill — it's safe to overwrite if the body is still a thin pointer).

## Hard rules

- **Gate on both onboards.** Refuse to run if either `.claude/context/OUTPUT-initial-theme-analysis.md` or `.claude/context/OUTPUT-initial-figma-analysis.md` is missing.
- **Do not duplicate the analysis.** The body of `theme.md` must remain a pointer. Frontmatter snapshots numbers; body links to sections of the analysis. Never inline grid system, breakpoints, naming conventions, etc. — those live in the analysis.
- **Snapshot inventory counts at curation time.** Use `ls` against the repo to count `templates/*.json`, `sections/*.liquid`, `sections/*.json` (section groups), `snippets/*.liquid`, `assets/*`, `locales/*.json`, and detect the `blocks/` folder. Stamp `last_curated` with today's date. Drift from the analysis (which may be days old) is captured by the timestamp.
- **Preserve the user's edits in the body.** If `theme.md` already exists and the body has been edited beyond the canonical pointer scaffold, abort and tell the user to either commit their edits or reset the file before re-running.

## Inputs

- `.claude/context/OUTPUT-initial-theme-analysis.md` (parsed for: theme name, version, vendor, critical gotchas, extension approach)
- Filesystem counts under repo root: `templates/`, `sections/`, `snippets/`, `assets/`, `locales/`, `blocks/`
- `.claude/specs/_templates/theme.template.md` (the scaffold)

## Outputs

- `.claude/specs/theme.md`

## Steps

### Step 1 — Gate

1. Check both onboard outputs exist. If either missing, stop and tell the user which onboard skill to run.
2. Check `.claude/specs/_templates/theme.template.md` exists. If missing, stop and tell the user to run `/init-specs` first.

### Step 2 — Read the theme analysis

Read `.claude/context/OUTPUT-initial-theme-analysis.md`. Extract:

- **Theme name, version, vendor** from the H1 line and the Summary section (e.g. "Sleek v2.2.0 by FoxEcom" → name=`Sleek`, version=`2.2.0`, vendor=`FoxEcom`).
- **Extension approach** — one-sentence summary of how the theme is extended (e.g. "Sections + scoped web components, custom JS namespace `window.FoxTheme`, Tailwind-flavored utility CSS").
- **Critical gotchas** — items called out as "Critical gotcha", "Important gotcha", or "watch out" in the Recommendations / Summary sections. Capture each as a one-line bullet.
- **`/blocks/` folder presence** — note from the analysis (`File Structure Overview`) whether the theme has a `/blocks/` folder.

### Step 3 — Count inventory from the filesystem

Run from repo root:

- `templates: ls templates/*.json | wc -l`
- `sections_liquid: ls sections/*.liquid | wc -l`
- `section_groups: ls sections/*.json | wc -l`
- `snippets: ls snippets/*.liquid | wc -l`
- `assets: ls assets/* | wc -l`
- `locales: ls locales/*.json | wc -l`
- `blocks_folder: [ -d blocks ] && echo true || echo false`

Use these as the authoritative counts. They override anything stated in the analysis (which may be days old).

### Step 4 — Render `theme.md`

Use `_templates/theme.template.md` as the scaffold. Fill in frontmatter:

```yaml
kind: theme
schema_version: 1
base_theme:
  name: "<theme name>"
  version: "<version>"
  vendor: "<vendor>"
inventory:
  templates: <int>
  sections_liquid: <int>
  section_groups: <int>
  snippets: <int>
  assets: <int>
  locales: <int>
  blocks_folder: <true|false>
extension_approach: "<one sentence>"
critical_gotchas:
  - "<bullet 1>"
  - "<bullet 2>"
references:
  analysis: ".claude/context/OUTPUT-initial-theme-analysis.md"
  figma_analysis: ".claude/context/OUTPUT-initial-figma-analysis.md"
last_curated: <YYYY-MM-DD>
```

Body stays a thin pointer:

```markdown
# Theme — <name> v<version>

> **Conventions live in `OUTPUT-initial-theme-analysis.md`.** This file is a stable, top-of-funnel pointer. Do not duplicate the analysis here — link to it.

## CSS

See analysis · grid system, breakpoints, page-width, color variables, spacing patterns, naming convention.

## JavaScript

See analysis · base files, existing custom elements, event patterns, third-party libraries, script loading.

## Liquid + Schema

See analysis · section wrapper pattern, padding approach, standard schema settings, snippet patterns, translation approach, block patterns.

## Critical gotchas

[bullets pulled from frontmatter — same content, repeated for human-scan readability]

## What this theme does NOT have

[list — examples below; only include what's actually true for this theme]

- (if applicable) No `/blocks/` folder — blocks defined inline in section `{% schema %}`
- (if applicable) No Theme App Extensions
- (if applicable) No design tokens in Figma — see `OUTPUT-initial-figma-analysis.md`
```

### Step 5 — Write + verify

1. Write to `.claude/specs/theme.md`.
2. Print: file path, frontmatter snapshot, and a one-line summary of what changed (counts vs. previous if file existed).
3. Suggest next: `/spec-project` (interactive Q&A for the project spec).

## Important Notes

- **This spec is a derivation, not a new source of truth.** If the theme analysis is wrong, fix the analysis (or rerun `/onboard-theme`), then rerun this skill.
- **Inventory drift is normal.** Counts here may differ from counts elsewhere in the analysis if files have been added/removed since the analysis was generated. The `last_curated` timestamp tells you how stale the snapshot is.
- **No `OUTPUT-` prefix.** This file is a curated spec, not an analysis output, so it lives at `.claude/specs/theme.md` (not `OUTPUT-theme.md`).

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# spec-theme/SKILL.md — v1.0

# AI Shopify Developer — Spec Hierarchy (Phase 1)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
