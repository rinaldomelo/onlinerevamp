---
name: onboard-figma
description: "Setup (run once). Analyzes the project's Figma file — pages, components, design tokens — using the Figma MCP. Skips the Archive page and includes only pages/sections marked Ready for Dev. Writes a structured report to OUTPUT-initial-figma-analysis.md and seeds .claude/specs/_figma-index.json + cached thumbnails. Run at the start of every new project, after onboard-theme."
user-invocable: true
---

# Skill: Onboard Figma

## Description

Run this skill once at the start of every new Shopify theme project, after `onboard-theme`. It performs a full analysis of the project's Figma design source, then writes:

1. `.claude/context/OUTPUT-initial-figma-analysis.md` — the design-side companion to the theme analysis
2. `.claude/specs/_figma-index.json` — a node registry consumed by all `spec-*` skills
3. `.claude/specs/_assets/figma/*.png` — cached thumbnails for the static spec viewer

This is the **design-side counterpart to `onboard-theme`**. Together they form the prerequisite gate for every spec skill (`init-specs`, `spec-project`, `spec-theme`, `spec-page`, `spec-section`, `refresh-spec-viewer`).

## When to Use

- First time working on a new project, after the Figma file has been organized for development handoff.
- When the Figma file has been substantially restructured (new pages, archived pages, dev-status changes).
- If `OUTPUT-initial-figma-analysis.md` is missing, stale (>30 days), or the user explicitly asks to re-run.
- Re-running is **idempotent** — existing `linked_specs[]` entries in `_figma-index.json` are preserved; `last_synced_at` is bumped.

## Hard rules

- **Skip the `Archive` page** (case-insensitive match: `archive`, `Archive`, `[Archive]`, `📦 Archive`, `ARCHIVE`, etc. — normalize before comparing).
- **Include only pages/sections marked "Ready for Dev"** via Figma's native Dev Mode flag. See Step 4 for detection.
- **Halt with a clear error** if zero pages qualify as Ready for Dev — empty design source breaks downstream specs.
- **Never inline copy/translations into the analysis** — locale JSON files in the theme are the source of truth for text. The Figma analysis documents structure and intent only.

## Inputs

- **Figma file URL** — provided by the user in conversation. If not provided, ask for it before starting.
- Existing `.claude/specs/_figma-index.json` if present (preserve `linked_specs[]` entries on re-run).

## Outputs

- `.claude/context/OUTPUT-initial-figma-analysis.md`
- `.claude/specs/_figma-index.json`
- `.claude/specs/_assets/figma/<file_key>-<node_id>.png` (one per included page + per top-level component)

## Steps

### Step 1 — Parse the Figma URL

Extract `fileKey` and (optional) `nodeId` from the URL. Per Figma MCP docs:

- `figma.com/design/:fileKey/:fileName?node-id=:nodeId` → use `fileKey`; in `nodeId` swap `-` for `:` (e.g. `159-10` → `159:10`).
- `figma.com/design/:fileKey/branch/:branchKey/:fileName` → use `branchKey` as `fileKey`.

If the URL points to a specific node, treat that node as the entry point but still walk to the file root to enumerate all pages.

Record:

- `file_key`
- `file_name` (from URL slug; will be replaced by canonical name from MCP if available)
- `original_url` (the full URL the user provided)

### Step 2 — Verify prerequisites

- Confirm `.claude/context/OUTPUT-initial-theme-analysis.md` exists. If missing, stop and tell the user to run `/onboard-theme` first — the analyses are paired and downstream skills require both.
- Create `.claude/specs/` and `.claude/specs/_assets/figma/` if they don't exist (with empty `.gitkeep` placeholders). This skill seeds these directories ahead of `init-specs` so thumbnails have somewhere to land.
- If `.claude/specs/_figma-index.json` exists, load it and remember every `linked_specs[]` array — these must be preserved on re-run.

### Step 3 — Enumerate pages

Call `mcp__plugin_figma_figma__get_metadata` for the file. Get the full page list with each page's name, node_id, and (if available) `devStatus`.

For each page record: `name`, `node_id`, `devStatus` (raw), `child_count`.

### Step 4 — Filter pages

Apply the two filters in order:

**Filter A — Skip Archive.** Normalize each page name: lowercase, strip emoji, strip surrounding brackets/parentheses, trim. If the normalized name equals `archive` (or starts with `archive ` / `archive-` / `archive_`), skip the page and record it under `excluded` with reason `"archive"`.

**Filter B — Ready for Dev (native Dev Mode flag).** For each remaining page:

1. **Page-level dev status** — if MCP metadata exposes a page-level `devStatus.type === "READY_FOR_DEV"` (or equivalent boolean), the page is included as-is.
2. **Section-level dev status** — Figma Dev Mode's "Ready for Dev" flag typically sits on **sections** inside a page, not on the page itself. If no page-level flag exists, walk the page's top-level children and look for any section/frame with `devStatus.type === "READY_FOR_DEV"`. Include the page if at least one ready section is found, and record which sections are ready (used in Step 5).
3. **Fallback — none of the above.** If MCP doesn't expose `devStatus` on either level, halt and tell the user the file's Dev Mode metadata isn't reachable; ask them to confirm whether to fall back to naming conventions or fix the file.

If filtering succeeds but **zero pages** qualify, halt with: `No pages marked Ready for Dev. Mark the relevant pages/sections in Figma Dev Mode and re-run.`

Record the included pages with their ready-sections list. Record excluded pages under `excluded` with reasons (`archive` or `not-ready`).

### Step 5 — Walk included pages

For each included page (or each Ready-for-Dev section within a page if the page itself isn't dev-ready):

1. Call `get_metadata` on the page/section node to enumerate top-level frames and components.
2. Classify each top-level child as one of:
   - **page** — the root of a template-level layout (e.g. a desktop home page artboard)
   - **component** — a reusable component or component instance (these become candidates for section specs)
   - **frame** — a non-component frame (decorative, scratch, or supporting work)
3. Record each child's `node_id`, `name`, `kind`, `parent_page_name`, and inferred kind.

Only `page` and `component` kinds are kept in the index. `frame` kinds are noted in the analysis doc under "frames not promoted" but not indexed (avoids polluting `_figma-index.json`).

### Step 6 — Cache thumbnails

For each indexed node (every `page` and `component`):

- Call `mcp__plugin_figma_figma__get_screenshot` with the node_id.
- Save the PNG to `.claude/specs/_assets/figma/<file_key>-<node_id_slug>.png` where `<node_id_slug>` replaces `:` with `-` (filesystem-safe).
- Store the relative path in the index entry's `thumbnail` field.

If a screenshot fails, record `thumbnail: null` and continue — the viewer handles missing thumbnails gracefully.

### Step 7 — Pull design tokens

Call `mcp__plugin_figma_figma__get_variable_defs` for the file. Capture:

- **Color variables** — name, value, mode (light/dark if defined)
- **Typography styles** — name, font family, size, weight, line height
- **Spacing variables** — name, value
- **Effect/shadow variables** — name, value (if present)

These go into the analysis doc's "Design Tokens" section. They do **not** go into `_figma-index.json`.

### Step 8 — Component deep-dive (selective)

For each component-kind node in the index, call `mcp__plugin_figma_figma__get_design_context` to get a richer description (variants, props, code-connect mappings if any). Capture a one-line summary per component and an inferred mapping to a Shopify section (e.g. "this component looks like a candidate for `sections/slideshow.liquid`"). The mapping is a hint — `spec-section` confirms it later.

Skip this step for `page`-kind nodes (they're full layouts, not reusable components).

### Step 9 — Write `_figma-index.json`

Build the index keyed by `<file_key>:<node_id>`:

```json
{
  "<file_key>:<node_id>": {
    "file_key": "...",
    "node_id": "...",
    "label": "Slideshow — Component",
    "kind": "page" | "component",
    "page_name": "Home — Desktop",
    "dev_ready": true,
    "thumbnail": "_assets/figma/<file_key>-<node_id_slug>.png",
    "last_synced_at": "YYYY-MM-DD",
    "linked_specs": []
  }
}
```

**Re-run idempotency:** for each key already present in the loaded index, copy the existing `linked_specs[]` array verbatim into the new entry. New keys start with `linked_specs: []`. Removed keys (nodes that no longer exist in Figma or are no longer dev-ready) are dropped — but log them in the analysis doc's "Removed since last sync" section.

Write the index to `.claude/specs/_figma-index.json` (pretty-printed JSON, 2-space indent, keys sorted alphabetically for readable diffs).

### Step 10 — Write the analysis output

Write `.claude/context/OUTPUT-initial-figma-analysis.md` using the structure below. Be concrete: real names, real node IDs, real token values. No placeholders.

## Output Structure

Write the following to `.claude/context/OUTPUT-initial-figma-analysis.md`:

```markdown
# Figma Analysis — [File Name]

Generated: [date]
Source: [original_url]
File key: [file_key]

## Summary

[2-3 sentence overview: what the Figma file contains, how many dev-ready pages, dominant design language, key components.]

## File Metadata

- **File key:** [file_key]
- **File name:** [canonical name from MCP]
- **Last modified in Figma:** [if exposed by MCP, else "not available"]
- **Total pages discovered:** [N]
- **Pages included (Ready for Dev):** [N]
- **Pages excluded (Archive):** [N]
- **Pages excluded (not Ready for Dev):** [N]

## Pages Included

For each included page:

### [Page Name]

- **Node ID:** `[file_key]:[node_id]`
- **Thumbnail:** `_assets/figma/<file_key>-<node_id_slug>.png`
- **Dev-ready scope:** [whole page | section: <section name>, section: <section name>, ...]
- **Top-level layouts (page-kind):** [list with node IDs]
- **Top-level components (component-kind):** [list with node IDs]
- **Frames not promoted:** [count + brief note]

## Pages Excluded

| Page Name | Reason | Notes |
|---|---|---|
| Archive | archive | Skipped per onboarding rule |
| [name] | not-ready | No Ready-for-Dev sections found |

## Top-Level Components Inventory

For each component in the index (component-kind nodes):

### [Component Name]

- **Node ID:** `[file_key]:[node_id]`
- **Found on page:** [page name]
- **Variants/props:** [from get_design_context]
- **Inferred Shopify section candidate:** [e.g. `sections/slideshow.liquid` — or "no clear match" if unsure]
- **One-line purpose:** [short description]

## Design Tokens

### Colors

| Variable | Value | Mode | Notes |
|---|---|---|---|
| ... | ... | ... | ... |

### Typography

| Style | Family | Size | Weight | Line height |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

### Spacing

| Variable | Value |
|---|---|
| ... | ... |

### Effects / Shadows

[If present, table; else "none defined".]

## Notes for the Spec Phase

[Free-form section. Examples of useful notes:
- "Home page in Figma maps cleanly to templates/index.json — 5 sections in a stack."
- "The 'Hero Carousel' component variants suggest the existing `sections/slideshow.liquid` will need a new block type for video slides."
- "Color tokens use a 2-mode system (light/dark) that the theme's CSS variables don't yet support."
- "Components with 'WIP' in their name should be treated as dev-ready but flagged for follow-up."
- Anything that will help spec-page / spec-section make better decisions.]

## Removed Since Last Sync

[Only on re-runs. List nodes that were in the previous index but are no longer Ready for Dev or no longer exist in Figma. One line each: <file_key>:<node_id> — <previous label> — <reason: "no longer dev-ready" | "deleted from Figma">.]

## Recommendations

[Anything notable:
- Inconsistencies in the Figma file (mixed naming, mixed dev-status conventions)
- Components that look like they should be merged
- Pages that look like they should be archived
- Gaps between the design and what the theme can express today
- Design tokens that don't yet have CSS variable equivalents in the theme]
```

## Important Notes

- **Always read the file via Figma MCP** — never assume page names or component structure from the URL or filename alone.
- **The Archive filter is non-negotiable** — even if the user has WIP work in Archive, that work doesn't ship to dev. Do not include it.
- **The Ready-for-Dev filter uses native Dev Mode** — do not fall back to naming conventions silently. If Dev Mode metadata isn't reachable, halt and ask.
- **Thumbnails are gitignored** — the viewer regenerates them. The index file IS committed.
- **`linked_specs[]` is sacred** — these are populated by `spec-page` / `spec-section` later. Re-running this skill must preserve them for keys that survive the re-index.
- **No frame promotion without intent** — `frame`-kind children are noted but not indexed. If a frame should be a component, the user fixes that in Figma, then re-runs this skill.

## Suggest Next

After successful run, suggest:

> Figma onboard complete. Next: run `/init-specs` to bootstrap the `.claude/specs/` folder, then `/spec-theme` (the first verifiable spec) and `/spec-project` (interactive Q&A).

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# onboard-figma/SKILL.md — v1.0

# AI Shopify Developer — Spec Hierarchy (Phase 0)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
