---
kind: theme
schema_version: 1
base_theme:
  name: "Sleek"
  version: "2.2.0"
  vendor: "FoxEcom"
inventory:
  templates: 23
  sections_liquid: 79
  section_groups: 3
  snippets: 110
  assets: 125
  locales: 52
  blocks_folder: false
extension_approach: "Heavily customized FoxEcom theme. Global `window.FoxTheme` JS namespace, ~67 custom elements, Tailwind-flavored utility CSS (.f-grid, .sm:f-grid-N-cols) layered over BEM components, and RGB-triplet CSS variables consumed via rgb(var(--color-X))."
critical_gotchas:
  - "Section padding pattern: use shared `.section--padding` + inline `--section-padding-top` / `--section-padding-bottom` style. Do NOT generate `.section-{{ section.id }}-padding` blocks."
  - "Use existing custom elements before writing new ones: <motion-element>, <modal-component>, <drawer-component>, <basic-modal>, <accordion-details>, <accordion-group>, FoxTheme.Carousel (Swiper), <tabs-component> + <tab-selector>."
  - "Cross-component events use `FoxTheme.pubsub`, not document CustomEvents."
  - "Colors: always wrap with `rgb(var(--color-X))` or `rgba(var(--color-X), alpha)`. The CSS vars hold R,G,B triplets, not full color values."
  - "Root rem is 10px (1rem = 10px). Divide pixel values by 10 for rem, or use `| divided_by: 10.0`."
  - "Two-context color schemes: outer/inner pattern uses `section_color_scheme` (outer) + `color_scheme` (inner). Add `color-inherit` class when equal."
  - "When adding settings with new translation keys, update locale schema files (`*.schema.json`), not just the runtime `*.json`."
  - "Section groups (header/footer/overlay) live in three .json files. New sections opt out via `disabled_on: { groups: [...] }`."
  - "Don't change `window.FoxTheme.settings.themeName === 'Sleek'`."
  - "Breakpoint inconsistency: legacy CSS mixes 750/1024/1200 with Tailwind-style 640/768/1024/1280/1536. New code should align with the latter."
references:
  analysis: ".claude/context/OUTPUT-initial-theme-analysis.md"
  figma_analysis: ".claude/context/OUTPUT-initial-figma-analysis.md"
last_curated: 2026-04-28
---

# Theme — Sleek v2.2.0 (FoxEcom)

> **Conventions live in `.claude/context/OUTPUT-initial-theme-analysis.md`.** This file is a stable, top-of-funnel pointer. Do not duplicate the analysis here — link to it.

## CSS

See analysis · grid system (`.f-grid`, `.f-flex`, `.f-masonry` with `.f-grid-{1-12}-cols` + responsive `.sm:`/`.md:`/`.lg:`/`.xl:`/`.xxl:` variants), breakpoints (legacy 750/1024/1200 + Tailwind-style 640/768/1024/1280/1536), page-width, color variables (RGB triplets), spacing patterns, naming convention, root rem (10px).

## JavaScript

See analysis · base files (`theme.js`, `vendor.js` — DO NOT MODIFY), ~67 existing custom elements, FoxTheme.pubsub event bus, third-party libraries (Swiper, etc.), script loading patterns.

## Liquid + Schema

See analysis · section wrapper pattern, `.section--padding` approach (NOT the bootcamp `section-{{ section.id }}-padding` pattern), standard schema settings, snippet patterns, translation approach, block patterns (defined inline since this theme has no `/blocks/` folder).

## Critical gotchas

- **Section padding pattern:** use shared `.section--padding` + inline `--section-padding-top` / `--section-padding-bottom` style. Do **NOT** generate `.section-{{ section.id }}-padding` blocks.
- **Use existing custom elements before writing new ones:** `<motion-element>`, `<modal-component>`, `<drawer-component>`, `<basic-modal>`, `<accordion-details>`, `<accordion-group>`, `FoxTheme.Carousel` (Swiper), `<tabs-component>` + `<tab-selector>`.
- **Cross-component events use `FoxTheme.pubsub`**, not document CustomEvents — ad-hoc events won't be picked up by existing components.
- **Colors:** always wrap with `rgb(var(--color-X))` or `rgba(var(--color-X), alpha)`. The CSS vars hold R,G,B triplets, not full color values.
- **Root rem is 10px.** Divide pixel values by 10 for rem (or use Liquid filter `| divided_by: 10.0`).
- **Two-context color schemes:** sections with outer + inner backgrounds use `section_color_scheme` (outer) + `color_scheme` (inner). Add `color-inherit` class when both are equal.
- **Locale schema files:** when adding settings with new translation keys, update `*.schema.json` siblings (e.g. `en.default.schema.json`), not just runtime `*.json`. Unresolved `t:` keys appear as literal strings in the editor.
- **Section groups (header/footer/overlay)** live in three `.json` files (`header-group.json`, `footer-group.json`, `overlay-group.json`). Most content sections opt out via `disabled_on: { groups: ["footer", "header", "custom.overlay"] }`.
- **Don't change `window.FoxTheme.settings.themeName === 'Sleek'`** — some scripts branch on it.
- **Breakpoint inconsistency:** legacy component CSS mixes 750/1024/1200 with the Tailwind-style 640/768/1024/1280/1536. New code should align with `768 / 1024 / 1280 / 1536` to match utility classes.

## What this theme does NOT have

- **No `/blocks/` folder** — block types are defined inline in section `{% schema %}`.
- **No Theme App Extensions** — all functionality lives in this theme repo.
- **No Figma Variables, no text styles, no effect styles, no spacing tokens** — see `OUTPUT-initial-figma-analysis.md`. Only color paint styles (Black/Blue ramps + Accent + Text) exist in Figma. Theme CSS variables remain the authoritative typography + spacing source.
