---
name: spec-page
description: "Scaffolds a page (template) spec at .claude/specs/pages/<slug>.md. Reads templates/<slug>.json, extracts order[] as the canonical section stack, links Figma viewport frames from _figma-index.json (desktop + mobile), and prompts the user for purpose + responsive notes + UX notes. One spec per Shopify JSON template — both viewports' Figma references go in the same file."
user-invocable: true
---

# Skill: Spec Page

## Description

Generates a page-level spec for one Shopify JSON template. Slug = template filename minus `.json` (dot-form preserved — e.g. `product.1-column.json` → slug `product.1-column`). The spec captures: the canonical section stack (read from the template's `order[]` array, which is authoritative), the Figma viewport references (one per viewport — typically desktop + mobile), and the page's purpose / responsive behavior / UX notes.

One spec file represents **one Shopify template**. Both desktop and mobile Figma frames belong to the same spec via the `figma[]` array; viewport-specific design intent goes in the body's "Responsive notes" section. This keeps page specs aligned with implementation reality (one template renders both viewports) while preserving each viewport's design source in the index.

## When to Use

- After `/init-specs`, `/spec-theme`, and `/spec-project` are done.
- When you want to spec a specific template (e.g. `index`, `product`, `collection.banner-top`, `page.about`).
- Re-running on an already-specced page is supported but will prompt before overwriting body content.

## Hard rules

- **Gate on both onboards.** Refuse to run if either `OUTPUT-initial-theme-analysis.md` or `OUTPUT-initial-figma-analysis.md` is missing.
- **`templates/<slug>.json` must exist.** If not, halt and tell the user — page specs only exist for real templates.
- **`order[]` is authoritative.** The spec's `sections[]` array mirrors `order[]` exactly, in the same sequence, with the same multiplicity (rich-text appearing twice in `order[]` produces two entries in `sections[]`). Never invent or reorder sections.
- **Map order[] entries → section types.** Each entry in `order[]` is a section instance ID (e.g. `slideshow_q3U4Jn`). Resolve it via `template.sections[entry].type` to get the section type slug (e.g. `slideshow`). The spec records the type, not the instance ID — instances are template-internal and unstable across edits.
- **Don't auto-cascade into spec-section.** If referenced sections lack their own spec yet, **list them** and prompt the user per-section ("Scaffold `slideshow`? [y/n/skip-all]") rather than running spec-section automatically.
- **Update `linked_specs[]` in `_figma-index.json`** for each Figma node referenced by this page spec.

## Inputs

- `.claude/context/OUTPUT-initial-theme-analysis.md` (existence check)
- `.claude/context/OUTPUT-initial-figma-analysis.md` (existence check)
- `templates/<slug>.json` (parsed for `order[]` + section types)
- `.claude/specs/_figma-index.json` (filtered by user-supplied or inferred page/viewport identifiers)
- `.claude/specs/_templates/page.template.md` (the scaffold)
- `.claude/specs/sections/*.md` (existence check — flag missing sections)

## Outputs

- `.claude/specs/pages/<slug>.md`
- Updates `.claude/specs/_figma-index.json` `linked_specs[]` for every Figma node attached to this page spec.

## Steps

### Step 1 — Gate + intake

1. Verify both onboard outputs exist.
2. Verify `<slug>` arg was provided. If not, ask the user which template to spec and list available `templates/*.json` filenames as suggestions.
3. Verify `templates/<slug>.json` exists. If not, halt.
4. Verify `_figma-index.json` exists. If not, halt and tell the user to run `/onboard-figma`.

### Step 2 — Read the template

1. Parse `templates/<slug>.json`.
2. Extract `order[]`.
3. For each entry, resolve `sections[entry].type` to get the section type slug.
4. Build the canonical sequence: `[{ instance_id, type }, …]`.

### Step 3 — Resolve Figma viewport references

1. Filter `_figma-index.json` for entries that look like they belong to this page. Two strategies:
   - **By page name match** — entries whose `page_name` or `label` aligns with the slug (e.g. slug `index` → entries with "Home Page" in their label).
   - **By user input** — show all `kind: page` entries grouped by `page_name`, ask the user which ones belong to this template.
2. The user confirms the mapping. Default expectation: one entry per viewport (desktop + mobile). If only one viewport exists in Figma, note it; do not invent the missing one.

### Step 4 — Detect missing section specs

For each section type referenced in `order[]`, check whether `.claude/specs/sections/<type>.md` exists.

- If **all exist**: note this and proceed to Step 5.
- If **some missing**: list them and prompt:
  > Sections referenced by `<slug>` that don't yet have specs: <list>. Want me to scaffold them now via `/spec-section`? [y for each / skip / skip-all]
  Default: skip-all (the user runs `/spec-section <name>` themselves later). Do NOT block page-spec generation on missing section specs — the page spec stands on its own.

### Step 5 — Ask for narrative content

In one combined turn, ask:

1. **Purpose** — what this page exists to do, one paragraph. Pre-fill a draft from the slug + section stack to save typing (e.g. for `index`: "The Home page introduces the brand and routes visitors to top-level shopping surfaces. Stack covers hero, featured products, collection routing, and trust/proof.").
2. **Responsive notes** — desktop vs. mobile differences specific to this page. Optional. Capture per-viewport intent (e.g. "Slideshow goes full-bleed on desktop; mobile uses content-position-mobile override").
3. **UX notes** — above-the-fold expectations, performance targets (LCP), conversion-critical elements, edge cases. Optional.

### Step 6 — Render + write

1. Render the page spec from `_templates/page.template.md`. Frontmatter:

   ```yaml
   kind: page
   schema_version: 1
   slug: "<slug>"
   template: "templates/<slug>.json"
   figma:
     - file_key: "..."
       node_id: "..."
       label: "..."
       viewport: "desktop"
       thumbnail: "..."        # null until viewer phase
       last_synced_at: "..."
     - file_key: "..."
       node_id: "..."
       label: "..."
       viewport: "mobile"
       thumbnail: "..."
       last_synced_at: "..."
   sections:                   # in order[] sequence; type only, no instance IDs
     - "<type-1>"
     - "<type-2>"
     - "..."
   missing_section_specs: ["<type-N>", ...]   # types from order[] without a spec yet — empty list if all specced
   last_curated: <YYYY-MM-DD>
   ```

2. Body covers: Purpose, Section stack (UX-level — numbered list with one-line role notes), Responsive notes, UX notes.

3. Write `.claude/specs/pages/<slug>.md`.

4. **Update `_figma-index.json`**: for each Figma node referenced, append `pages/<slug>` to its `linked_specs[]` (deduplicated).

### Step 7 — Print summary + suggest next

- Print: file path, section count from order[], Figma viewport count, count of missing section specs.
- Suggest: `/spec-section <type>` for the first missing section, or `/refresh-spec-viewer` once a few page+section specs exist.

## Important Notes

- **One file per Shopify template.** Even if the project decided "each viewport is a page", that classification lives in `_figma-index.json` (where each viewport has its own indexed entry). The spec FILE represents the implementation unit (the Shopify template), with both viewports' Figma sources nested in `figma[]`.
- **`order[]` reflects the current template state**, which may include sections that the design wants to remove or replace. Note such gaps in "Open questions" of the body, but don't drop sections from the stack — the spec describes what's there, not what we wish were there.
- **Section types, not instance IDs.** Instance IDs (`slideshow_q3U4Jn`) are auto-generated and change between edits. The spec records the stable type (`slideshow`).
- **Re-runnable.** Re-running with the same slug detects an existing file. If body has been edited beyond the canonical scaffold, ask the user before overwriting.

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# spec-page/SKILL.md — v1.0

# AI Shopify Developer — Spec Hierarchy (Phase 3)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
