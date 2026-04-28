---
kind: section
schema_version: 1
slug: "product-tabs"
file: "sections/product-tabs.liquid"
group: null
schema_name: "t:sections.product-tabs.name"
blocks: ["tab"]
presets_count: 1
max_blocks: null
enabled_on_groups: null
disabled_on_groups: ["header", "footer", "custom.overlay"]
figma: []
last_curated: 2026-04-28
---

# Section — Product Tabs

## Purpose

Featured products grouped under selectable tabs (e.g. "Best Sellers", "New Arrivals", "Trending"). Each tab maps to a Shopify collection. Sits high in the Home page stack as a primary discovery surface — visitors switch tabs without a page reload, browse curated subsets, click into PDP. Used on Home (early stack) and again later as `featured-products-tab` (separate section type for a second placement).

## Where used

[Derived by the viewer from page specs' `sections[]`. Do not list manually.]

## Schema settings (high-level)

- `color_scheme` (color_scheme) — section background/foreground tokens.
- `header_layout` (select) — heading + button placement (e.g. heading-left button-right).
- `heading` (inline_richtext), `heading_size` (select), `heading_tag` (select), `heading_highlight_style` (select).
- `limit` (range) — products per tab.
- `columns` (range) — desktop column count.
- `column_gap` (select), `row_gap` (select) — grid spacing.
- `grid_layout` (select) — grid vs. masonry style.
- `pcard_image_ratio` (select) — product card image aspect ratio.
- `columns_mobile` (select), `swipe_on_mobile` (checkbox) — mobile carousel-vs-stack toggle.
- `show_all_button_on_top` (checkbox), `button_label` (text), `button_link` (url), `button_style` (select) — "shop all" CTA.
- `tabs_nav_style` (select) — tab navigation visual style (pills, underline, etc.).
- `padding_top` / `padding_bottom` (range) — section spacing.
- `show_section_divider` (checkbox), `divider_width` (select) — between-section visual separator.
- `custom_class` (text).

## Visual behavior

- **Desktop:** heading + tabs nav + product grid (typically 4 columns). Tabs render side-by-side per `tabs_nav_style`. Switching tabs animates the grid swap (uses Sleek's `<tabs-component>` + `<tab-selector>` web components).
- **Mobile:** when `swipe_on_mobile: true`, products render as a horizontal swipeable carousel; otherwise stacked grid at `columns_mobile` columns. Tab nav typically scrolls horizontally if it overflows.
- **Lazy-load:** product cards defer image loading below-the-fold. The first tab's products may be eagerly loaded.
- **Empty tab:** if a collection is empty or unset, render an empty-state placeholder rather than collapsing the tab.

## Accessibility

- Tab navigation uses ARIA `role="tablist"` + `role="tab"` + `aria-selected` per Sleek's `<tabs-component>` convention.
- Arrow-key navigation between tabs (left/right).
- `aria-controls` links each tab to its corresponding panel.
- Product cards' price + title + image alt are individually focusable for screen readers.

## Blocks

### Block: tab

- **Purpose:** One tab in the tabs row, paired with one Shopify collection. Each tab specifies its display title and the collection it surfaces. `max_blocks` is unbounded — practical limit is what fits in the tab row visually (typically 3-6).
- **Figma sub-node:** Embedded in Home Page artboards (`pid87VYFva2zFBOXTChMVR:2:653` desktop, `pid87VYFva2zFBOXTChMVR:90:664` mobile). No standalone tab Figma component.
- **Settings:**
  - `title` (text) — tab label shown in the nav.
  - `collection` (collection) — the Shopify collection whose products fill this tab's grid.

## Notes

- **Theme convention:** uses Sleek's `<tabs-component>` + `<tab-selector>` custom elements — do NOT reimplement tab logic.
- **Section padding:** uses Sleek's `.section--padding` (see theme.md gotchas).
- **Cross-component events:** if a tab swap should notify other components (e.g. update an analytics event), use `FoxTheme.pubsub`, not document `CustomEvent`s (per theme.md gotcha).
- **Two appearances on Home:** Home page uses both `product-tabs` (early) and `featured-products-tab` (later) — they are distinct section types in this theme. `featured-products-tab` has its own spec (TBD).
