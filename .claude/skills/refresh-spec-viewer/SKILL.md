---
name: refresh-spec-viewer
description: "Regenerates the static HTML spec viewer at .claude/specs/_viewer/. Walks every spec file (project.md, theme.md, pages/*, sections/*), renders each to HTML with a 3-pane layout (tree / spec content / Figma panel), and derives 'Where used' for each section from the page specs' section[]. Output is read-only; opens via file:// in any browser. Run after writing or updating any spec."
user-invocable: true
---

# Skill: Refresh Spec Viewer

## Description

Generates `.claude/specs/_viewer/` — a static HTML viewer that mirrors the spec hierarchy with a 3-pane layout:

- **Left:** navigation tree (Project → Theme → Pages → Sections)
- **Middle:** rendered markdown body of the selected spec
- **Right:** Figma panel — node IDs, labels, last-synced dates, stale badges, "open in Figma" links

The viewer is **server-side rendered** (no client-side JS for markdown) so it opens cleanly via `file://` without a local dev server. Pure vanilla CSS, no framework. Regenerated on demand — always safe to delete and re-run.

## When to Use

- After any spec file is created or updated.
- After running `/onboard-figma` (Figma metadata changed).
- Before sharing the spec hierarchy with a stakeholder for visual review.

## Hard rules

- **Gate on at least one curated spec.** Halt if neither `project.md` nor `theme.md` exists, or if `pages/` and `sections/` are both empty.
- **Always overwrite the entire `_viewer/` folder.** The viewer is derived; preserving prior runs is meaningless. Delete first, then regenerate.
- **No copy duplication.** The viewer renders what the markdown says. It does not invent content. If a spec body has placeholder TODO text, that's what the viewer shows.
- **`Where used` is derived, not curated.** Computed at render time from every page spec's `sections[]`. Do not write it into section spec bodies.
- **Never block on missing thumbnails.** If `figma[].thumbnail` is `null`, render the metadata pane without an image (with a "thumbnail not cached" note). Do not halt.

## Inputs

- `.claude/specs/project.md` (singleton)
- `.claude/specs/theme.md` (singleton)
- `.claude/specs/pages/*.md`
- `.claude/specs/sections/*.md`
- `.claude/specs/_figma-index.json` (for richer Figma context per node)

## Outputs

- `.claude/specs/_viewer/index.html` — landing page (overview + counts + tree)
- `.claude/specs/_viewer/project.html`
- `.claude/specs/_viewer/theme.html`
- `.claude/specs/_viewer/pages/<slug>.html`
- `.claude/specs/_viewer/sections/<slug>.html`
- `.claude/specs/_viewer/styles.css`

The folder is gitignored — regenerable.

## Steps

### Step 1 — Gate

1. Verify `.claude/specs/project.md` OR `.claude/specs/theme.md` exists. If neither, halt and tell the user to run `/init-specs` + `/spec-theme`.
2. Verify the renderer script exists at `.claude/skills/refresh-spec-viewer/render.py`. If missing, halt — this skill ships its renderer.
3. Verify Python 3 is on PATH. Halt if not.

### Step 2 — Verify renderer dependencies

Confirm `python-markdown` and `PyYAML` are importable. The renderer uses both. If missing, the script will fail with a clear error pointing to `pip install markdown pyyaml`.

### Step 3 — Run the renderer

Execute `python3 .claude/skills/refresh-spec-viewer/render.py <repo-root>` from the repo root. The script:

1. Reads all spec files (`project.md`, `theme.md`, `pages/*.md`, `sections/*.md`).
2. Parses YAML frontmatter; extracts the markdown body below the second `---`.
3. Reads `_figma-index.json` for full Figma metadata (richer than what's in spec frontmatter).
4. Computes derived `where_used` map: `{section_slug: [page_slug, ...]}` from every page's `sections[]`.
5. Computes "stale" status on Figma references (`last_synced_at` older than 14 days = stale).
6. Renders each markdown body → HTML with `python-markdown` + extensions (tables, fenced_code, attr_list, toc).
7. Wraps each in a shared 3-pane layout template.
8. Writes per-spec HTML files into `_viewer/`.
9. Writes `index.html` (landing page with stats + tree) and `styles.css`.

### Step 4 — Print summary + suggest next

Print:

- File counts (project, theme, pages, sections, total HTML files written)
- Path to open: `open .claude/specs/_viewer/index.html`
- Suggest: review the viewer in a browser. After confirming, suggest next spec work (more pages/sections, or proceed to Phase 5 wiring).

## Important Notes

- **The renderer is the source of truth for the viewer's behavior** (`render.py`). The SKILL.md is the contract; the script is the implementation. Edits to layout / styling go in the script, not in this file.
- **No JavaScript in generated HTML.** Server-side rendering keeps `file://` access friction-free across browsers. If interactive features become valuable later (filtering, search), introduce them as a separate enhancement, not by adding an SPA layer.
- **Re-run safety:** the script wipes `_viewer/` before writing. Any manual edits to generated HTML are lost on re-run, by design — generated artifacts must never be hand-edited.
- **Markdown subset supported:** headings (h1-h6), paragraphs, ordered + unordered lists, tables, fenced code blocks, inline code, bold/italic, links, blockquotes. Anything outside this subset (custom HTML, raw JSX) is passed through.
- **Figma open-in-Figma links:** built from `file_key` + `node_id` per Figma URL convention `https://www.figma.com/design/<file_key>?node-id=<node_id_with_hyphen>`. Clicking opens the node directly in Figma desktop or web.

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# refresh-spec-viewer/SKILL.md — v1.0

# AI Shopify Developer — Spec Hierarchy (Phase 4)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
