# Figma Analysis — Rhythm Rocks Website Design

Generated: 2026-04-28
Source: https://www.figma.com/design/pid87VYFva2zFBOXTChMVR/Rhythm-Rocks-Website-Design?node-id=159-10
File key: `pid87VYFva2zFBOXTChMVR`

## Summary

Single-file Shopify theme design covering Home, Product Collection, PDP, and Mega Menu surfaces. The file is small (4 pages, 18 indexed top-level nodes) and uses a 25-color palette of Black/Blue ramps + an Accent + a Text token. There are no Figma Variables, no text styles, and no effect styles — all typography and shadows are loose values on individual nodes. Both desktop (1440px) and mobile (390px) artboards exist for the Home and Product Collection surfaces.

## File Metadata

- **File key:** `pid87VYFva2zFBOXTChMVR`
- **Canonical Figma file name:** `Document` (the file's internal name was never set — the URL slug "Rhythm-Rocks-Website-Design" is the user-facing label)
- **Total pages discovered:** 4
- **Pages included (Ready for Dev):** 3
- **Pages excluded (Archive):** 1
- **Pages excluded (not Ready for Dev):** 0
- **Indexed nodes:** 15 (12 page-kind, 3 component-kind)
- **Excluded per project decision:** 3 (V2 home frame `17:1023`, PDP/Select this Ring `120:40`, mobile collection alt `98:2619`)
- **Skipped top-level nodes:** 2 (1 stray `TEXT`, 1 pasted screenshot `RECTANGLE`)
- **Page-kind heuristic:** every full-width frame (1440 desktop or 390 mobile) with height ≥600 is a page. Viewport variants (desktop + mobile of the same template) count as separate pages.

### Important caveat — Dev Mode status

The skill spec calls for filtering by Figma's native **Dev Mode "Ready for Dev"** flag. On this file:

- `PAGE` nodes have no `devStatus` property at all (Plugin API throws `TypeError`).
- `FRAME` nodes throw `"in get_devStatus: get node.devStatus is not yet supported"` — the Plugin API does not surface `devStatus` for frames.
- The file uses **zero `SECTION` nodes** (the Figma node type that does carry a readable `devStatus`).

The green `</>` Dev Mode badge visible in the file UI confirms Dev Mode is **active**, but the per-node Ready-for-Dev flag isn't reachable via the Plugin API surface available to MCP. After surfacing this to the user, we proceeded with the **fallback rule: treat every non-Archive page as Ready for Dev**. The index records `dev_ready_source: "fallback-non-archive"` on every entry to make this explicit. Re-run with a different surface (e.g. Figma REST API) once available, or restructure the file to use `SECTION` nodes if per-frame granularity becomes important.

## Pages Included

### Home Page

- **Page ID:** `pid87VYFva2zFBOXTChMVR:0:1`
- **Top-level child count:** 5
- **Page-kind nodes (full-viewport layouts):**
  - `2:653` — **Home Page (Desktop)** · 1440 × 11285
  - `90:664` — **Home Page (Mobile)** · 390 × 13037
- **Component-kind nodes:**
  - `19:2142` — **V2 Diamond Search** · 1319 × 444 (homepage diamond-finder feature; likely candidate for a custom section)
- **Excluded per project decision:**
  - `17:1023` — **V2** · 1440 × 1214 (ambiguous label; deferred)
- **Skipped:**
  - `89:54` (TEXT, "© 2024 Rhythm Rocks…") — loose footer copyright text, not a layout

### Product Collection & PDP

- **Page ID:** `pid87VYFva2zFBOXTChMVR:98:2`
- **Top-level child count:** 9
- **Page-kind nodes (full-viewport layouts + filter states):**
  - `98:11` — **PDP / Add to Bag (Desktop)** · 1440 × 7661
  - `98:760` — **Product Collection V1 (Desktop)** · 1440 × 5950
  - `98:2066` — **Product Collection (Mobile)** · 390 × 7290 — *canonical mobile layout*
  - `98:1409` — **Product Collection / Filters (Desktop)** · 1440 × 927 — *page state, filters open*
  - `98:1920` — **Product Collection / Filters (Mobile)** · 390 × 857 — *page state, filters drawer*
- **Component-kind nodes:**
  - `176:288` — **Tooltip** · 355 × 132
  - `107:263` — **Banner** · 820 × 271
- **Excluded per project decision:**
  - `120:40` — **PDP / Select this Ring** · 1440 × 1618 (deferred — first pass focuses on Add-to-Bag)
  - `98:2619` — **Product Collection (Mobile, 9231h)** · 390 × 9231 (longer alt of `98:2066`; canonical is the shorter one)

### Mega Menu

- **Page ID:** `pid87VYFva2zFBOXTChMVR:98:3192`
- **Top-level child count:** 6 (5 indexed pages, 1 skipped pasted screenshot rectangle)
- **Page-kind nodes (mega-menu states — each connects to a top-level navigation category):**
  - `98:3196` — **Mega Menu / Engagement Rings** · 1440 × 800
  - `98:3568` — **Mega Menu / Fine Jewelry** · 1440 × 800
  - `98:3351` — **Mega Menu / Wedding Bands** · 1440 × 800
  - `98:3635` — **Mega Menu / Education** · 1440 × 800
  - `98:3442` — **Mega Menu / Diamonds** · 1440 × 800
- **Implementation note:** all 5 ship inside the existing `sections/header.liquid` mega-menu mode. Interface comes first; menu-item content/data wiring is a follow-up since the source navigation may not exist yet.
- **Skipped:**
  - `159:10` (RECTANGLE, "Screenshot 2025-06-02…") — pasted reference image, not a design element

## Pages Excluded

| Page Name | Page ID | Reason | Notes |
|---|---|---|---|
| Archive | `10:2` | archive | Skipped per onboard-figma rule. Top-level child count was 5 — not enumerated. |

## Top-Level Components Inventory

For each component-kind node, an inferred Shopify section candidate based on naming. These are **hints for `spec-section`**, not commitments — the user confirms each mapping during spec-section curation.

| Node ID | Name | Page | Inferred Shopify candidate | Notes |
|---|---|---|---|---|
| `19:2142` | V2 Diamond Search | Home Page | `sections/diamond-search-*.liquid` (custom — no clear match in stock theme) | Domain-specific; new section likely needed |
| `17:1023` | V2 | Home Page | unclear | Ambiguous label — clarify during spec-section |
| `176:288` | Tooltip | PDP | `snippets/tooltip.liquid` (or inline component) | Small reusable UI; probably a snippet, not a section |
| `107:263` | Banner | PDP | `sections/banner-*.liquid` or `sections/announcement-bar.liquid` | Confirm banner type during spec-section |
| `98:1409` | Product Collection/Filters (Desktop) | PDP | `sections/main-collection-filters.liquid` (or theme-specific equivalent) | Likely paired with the Product Collection layout |
| `98:1920` | Product Collection/Filters (Mobile) | PDP | same as desktop counterpart, mobile responsive | Document as the same section spec; flag responsive behavior |
| `98:3196`–`98:3635` | Mega Menu (5 states) | Mega Menu | `sections/header.liquid` (mega-menu blocks) | All five frames are states of one section — should produce ONE section spec with 5 referenced Figma nodes |

## Design Tokens

### Colors (25 paint styles)

**Black ramp (12 tokens):**

| Token | Hex |
|---|---|
| `Black/50` | `#f6f6f6` |
| `Black/100` | `#e7e7e7` |
| `Black/200` | `#d1d1d1` |
| `Black/300` | `#b0b0b0` |
| `Black/400` | `#888888` |
| `Black/500` | `#6d6d6d` |
| `Black/600` | `#5d5d5d` |
| `Black/700` | `#4f4f4f` |
| `Black/800` | `#454545` |
| `Black/900` | `#3d3d3d` |
| `Black/Base` | `#151515` |
| `White` | `#ffffff` |

**Blue ramp (12 tokens):**

| Token | Hex |
|---|---|
| `Blue/50` | `#f2f9fd` |
| `Blue/100` | `#e4f2fa` |
| `Blue/200` | `#c2e5f5` |
| `Blue/300` | `#87ceeb` |
| `Blue/Base` | `#50b9e0` |
| `Blue/500` | `#2aa0cd` |
| `Blue/600` | `#1b81ae` |
| `Blue/700` | `#17678d` |
| `Blue/800` | `#175775` |
| `Blue/900` | `#184962` |
| `Blue/950` | `#102f41` |

**Semantic / accent (2 tokens):**

| Token | Hex |
|---|---|
| `Accent` | `#f18e53` (orange — primary brand accent) |
| `Text` | `#151515` (alias of Black/Base) |

### Typography

**Zero local text styles defined.** Type sizes, weights, and line heights are loose values on individual text nodes. The theme's existing CSS variables (per `OUTPUT-initial-theme-analysis.md`) are the authoritative source for typography until/unless these are formalized in Figma.

### Spacing

**Zero spacing variables defined.** Spacing exists only as auto-layout gaps and absolute coordinates on individual nodes. Map theme padding ranges (per the section-id padding pattern) directly from frame-level measurements when curating section specs.

### Effects / Shadows

**Zero effect styles defined.** Shadows, blurs, and overlays are inline on nodes if used at all.

### Variables

**Zero local Figma Variables.** Tokens above are paint *styles*, not variables. The theme has no formal multi-mode token system in Figma yet — light/dark mode would need to be set up first if desired.

## Notes for the Spec Phase

- **Mega Menu = single section spec.** The 5 Mega Menu/* frames are states of one section (the theme header's mega-menu mode). `spec-section header` should reference all 5 Figma nodes as variants/states, not produce 5 separate specs.
- **Mobile collection has two candidates.** `98:2066` (390×7290) and `98:2619` (390×9231) are both labeled "Product Collection". Likely one is the canonical mobile collection page and the other is a longer scroll variant or work-in-progress. Confirm during `spec-page collection` which is the source of truth.
- **PDP has two states.** `98:11` (Add to Bag) and `120:40` (Select this Ring) are likely the same template in two interaction states (default vs. ring-builder flow). `spec-page product` should treat these as variants of one page spec, not two separate templates — unless Shopify uses two distinct templates for them.
- **"V2" frame is ambiguous.** `17:1023` named simply "V2" with no further context. Treat as a candidate for follow-up clarification before committing to a section spec.
- **No design tokens in Figma yet.** Only color paint styles exist. Until Figma Variables are set up, the theme's existing CSS custom properties (per `OUTPUT-initial-theme-analysis.md`) are authoritative for spacing, typography, and breakpoints.
- **Naming uses category prefixes.** `PDP/`, `Product Collection/`, `Mega Menu/`. This is consistent enough to use as a routing hint in the spec phase.
- **No formal component definitions.** Every "component" indexed here is a top-level FRAME, not a Figma `COMPONENT` or `COMPONENT_SET`. There are no variants, no instances, no design-system reuse. Components are visually copied between artboards. This means each frame stands alone — there's no reusable component master to track.

## Removed Since Last Sync

(First sync — no removed nodes.)

## Recommendations

- **Set up Dev Mode `SECTION` nodes** in the Figma file so future runs can read per-frame `devStatus`. Today's fallback (treat all non-Archive as ready) is fragile if more pages get added.
- **Promote loose frames to Figma Components.** Tooltip, Banner, Product Collection/Filters, and Mega Menu states are good candidates for Figma `COMPONENT_SET`s with variants. This would make `spec-section` mappings tighter and enable Code Connect later.
- **Define text + spacing styles in Figma.** Even a minimal H1/H2/H3/Body + 4/8/16/24/32 spacing scale would dramatically improve fidelity tracking between code and design.
- **Consolidate the two mobile Product Collection layouts.** Pick one as canonical and archive the other (move it into the Archive page).
- **Rename `17:1023 "V2"`.** A single-letter label gives no information for downstream specs.
- **Set the Figma file's internal name** (currently "Document"). Useful when the file is referenced by name in stakeholder discussions.
- **Thumbnail caching is a viewer-phase concern.** The `_figma-index.json` records `thumbnail: null` on every entry. The `refresh-spec-viewer` skill (Phase 4) will figure out how to persist Figma screenshots locally — likely by capturing PNGs via `use_figma`'s `node.screenshot()` and writing them to `.claude/specs/_assets/figma/` from a Node-side helper. Resolved once that skill is built.
