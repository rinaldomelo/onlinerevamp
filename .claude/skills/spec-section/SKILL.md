---
name: spec-section
description: "Scaffolds a section spec at .claude/specs/sections/<slug>.md from sections/<slug>.liquid. Parses the {% schema %} block, extracts settings (high-level) + block types, links Figma component nodes from _figma-index.json, and prompts the user for purpose + visual behavior + accessibility notes. Block specs are nested inline as ### Block: <name> H3s under ## Blocks (theme has no /blocks/ folder)."
user-invocable: true
---

# Skill: Spec Section

## Description

Generates a section-level spec for one Shopify section type. Slug = liquid filename minus `.liquid` (e.g. `sections/slideshow.liquid` → slug `slideshow`). Section-group JSONs (`header-group.json`, `footer-group.json`, `overlay-group.json`) get standalone specs too — slug = filename minus `.json`.

The spec captures purpose, where it's used (derived by viewer at render time, not listed manually), high-level schema settings (name + type, NOT full schema detail), visual behavior, accessibility expectations, and **block types as nested `### Block:` H3 sections under `## Blocks`**. The theme has no `/blocks/` folder — block types are defined inline in `{% schema %}` and document inline in the section spec.

## When to Use

- After `/spec-page` flagged the section as missing.
- When you want to spec a specific section directly (e.g. `/spec-section slideshow`).
- Re-running on an already-specced section is supported but will prompt before overwriting body content.

## Hard rules

- **Gate on both onboards.** Refuse to run if either `OUTPUT-initial-theme-analysis.md` or `OUTPUT-initial-figma-analysis.md` is missing.
- **The source `.liquid` (or `.json` for groups) must exist.** Halt if not — section specs only exist for real sections.
- **Settings are HIGH-LEVEL.** Capture name + type only (e.g. `heading: text`, `image: image_picker`, `padding_top: range`). Do NOT inline every nested option. The full schema lives in the `.liquid` file — the spec describes intent.
- **Inline copy is forbidden in specs.** If the schema's defaults contain copy (titles, button labels, descriptions), do NOT copy that text into the spec. Reference translation keys by name only (e.g. "uses `t:sections.slideshow.cta`").
- **Block types as inline H3s.** Each block type from the schema's `blocks[]` array becomes one `### Block: <name>` under `## Blocks` in the body. Frontmatter's `blocks[]` is a flat array of block-type names for index-ability.
- **No "Where used" section content.** The section "Where used" header stays in the body but its content is derived by the viewer from `pages/*.md`. Do not list pages manually.

## Inputs

- `.claude/context/OUTPUT-initial-theme-analysis.md` (existence check)
- `.claude/context/OUTPUT-initial-figma-analysis.md` (existence check)
- `sections/<slug>.liquid` (or `sections/<slug>.json` for groups) — parsed for `{% schema %}`
- `.claude/specs/_figma-index.json` (for matching Figma component nodes)
- `.claude/specs/_templates/section.template.md` (the scaffold)
- (Optional) `mcp__shopify-dev-mcp__validate_theme` — run on the schema if it looks unusual

## Outputs

- `.claude/specs/sections/<slug>.md`
- Updates `.claude/specs/_figma-index.json` `linked_specs[]` for every Figma node attached to this section spec.

## Steps

### Step 1 — Gate + intake

1. Verify both onboard outputs exist.
2. Verify `<slug>` arg was provided. If not, ask the user which section to spec; suggest names of sections referenced by curated page specs that lack a section spec.
3. Verify the source file exists:
   - First check `sections/<slug>.liquid`.
   - If absent, check `sections/<slug>.json` (section-group case). If found, set `group: <slug>` in frontmatter and treat group sections + blocks accordingly.
   - If neither exists, halt.

### Step 2 — Parse the schema

For `.liquid` sections:

1. Read the file. Locate the `{% schema %} … {% endschema %}` block. Parse the JSON inside it.
2. Extract:
   - `name` (display name in editor)
   - `tag`, `class` (HTML tag + class)
   - `settings[]` — capture each as `{ id, type, label }`. Drop `default`, `info`, `options[]`, `placeholder`. The spec is high-level.
   - `blocks[]` — capture each block type's `type`, `name`, and its own `settings[]` (same high-level rule).
   - `presets[]` — note presence + count, but don't include preset content.
   - `enabled_on` / `disabled_on` — note any group restrictions (header/footer/overlay).
3. If parsing fails (malformed schema), halt with a clear error and suggest running `mcp__shopify-dev-mcp__validate_theme`.

For `.json` section groups:

1. Read the file.
2. Capture `type`, `name`, `sections{}` (which sections are slotted into this group), and `order[]`.
3. Frontmatter `group: <slug>`; `blocks[]` empty (groups don't define blocks at this level — block types live in the slotted sections).

### Step 3 — Match Figma component nodes

1. Filter `_figma-index.json` for entries that look like they map to this section. Heuristics:
   - Label substring match (e.g. slug `slideshow` matches "Slideshow", "Hero Slideshow")
   - Recorded `notes` mentioning the slug (e.g. mega-menu states all note "implements within `sections/header.liquid`")
   - User-supplied node IDs
2. Show candidates to the user. They confirm which nodes belong. Multiple nodes per spec are fine (e.g. `header.liquid` may link 5 mega-menu states + the base header frame).

### Step 4 — Ask for narrative content

In one combined turn:

1. **Purpose** — what this section exists to do, one paragraph. Pre-fill a draft from the schema's `name` field to save typing.
2. **Visual behavior** — desktop vs. mobile differences, animations, interactions, edge cases. Optional but encouraged.
3. **Accessibility** — keyboard nav, reduced-motion, focus management, ARIA expectations. Optional.
4. **Per-block notes** — for each block type, ask one question: purpose + matching Figma sub-node (if any). Keep these short.

### Step 5 — Render + write

Frontmatter:

```yaml
kind: section
schema_version: 1
slug: "<slug>"
file: "sections/<slug>.liquid"        # or "sections/<slug>.json" for groups
group: null                            # or the group slug
schema_name: "<from schema>"
blocks: ["<type-1>", "<type-2>"]       # flat type names
presets_count: <int>
enabled_on_groups: ["header", ...]     # or null
disabled_on_groups: [...]              # or null
figma:
  - file_key: "..."
    node_id: "..."
    label: "..."
    role: "primary" | "state" | "variant" | "responsive"
    thumbnail: "..."
    last_synced_at: "..."
last_curated: <YYYY-MM-DD>
```

Body:

```markdown
# Section — <Display Name>

## Purpose

<paragraph>

## Where used

[Derived by the viewer from page specs' `sections[]`. Do not list manually.]

## Schema settings (high-level)

- `<id>` (`<type>`) — <label>
- ...

## Visual behavior

<paragraph(s)>

## Accessibility

<bullets>

## Blocks

### Block: <type-1>
- **Purpose:** <one line>
- **Figma sub-node:** `<file_key>:<node_id>` (or "no direct match")
- **Settings:**
  - `<id>` (`<type>`) — <label>
  - ...

### Block: <type-2>
...
```

For section groups, replace `## Schema settings` and `## Blocks` with `## Sections slotted in` (list from the group's `sections{}`).

Write `.claude/specs/sections/<slug>.md`.

### Step 6 — Update index + suggest next

1. For each Figma node referenced, append `sections/<slug>` to its `linked_specs[]` in `_figma-index.json` (deduplicated).
2. Print: file path, settings count, block count, Figma node count.
3. Suggest: next priority section from the missing-specs list, or `/refresh-spec-viewer` once enough are specced.

## Important Notes

- **Validation is optional but recommended for unusual schemas.** If the section uses uncommon patterns (custom_css, dynamic blocks, deprecated settings), call `mcp__shopify-dev-mcp__validate_theme` to surface issues early.
- **Block specs are inline.** This is intentional — the theme has no `/blocks/` folder. Promoting block specs to separate files is a future-phase decision (see project plan, "Hybrid" option deferred).
- **Group sections (header/footer/overlay) get standalone specs.** Their `figma[]` may include multiple states (e.g. `header.liquid` references all 5 mega-menu states + the base header frame).
- **Settings drift is expected.** If a `.liquid` schema is edited after the spec is written, the spec doesn't auto-refresh. A future `/validate-specs` skill will detect drift; for now, `last_curated` makes staleness visible.

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# spec-section/SKILL.md — v1.0

# AI Shopify Developer — Spec Hierarchy (Phase 3)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
