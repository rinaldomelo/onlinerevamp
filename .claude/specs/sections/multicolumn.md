---
kind: section
schema_version: 1
slug: "multicolumn"
file: "sections/multicolumn.liquid"
group: null
schema_name: "t:sections.multicolumn.name"
blocks: ["column"]
presets_count: 1
max_blocks: null
enabled_on_groups: null
disabled_on_groups: ["footer", "header", "custom.overlay"]
figma: []
last_curated: 2026-04-28
---

# Section — Multicolumn

## Purpose

General-purpose multi-column block used for value props, USPs, brand pillars, or any "N items in a row" pattern. On Home, typically renders as 3-4 columns of feature props (e.g. "Lifetime Trade-Up", "Free Resizing", "Conflict-Free Diamonds"). One of the highest-frequency reusable sections — used in many places across the theme.

## Where used

[Derived by the viewer from page specs' `sections[]`. Do not list manually.]

## Schema settings (high-level)

- `color_scheme` (color_scheme) — section background/foreground.
- `heading` (inline_richtext), `heading_size` (select), `heading_tag` (select), `heading_highlight_style` (select), `subheading` (text), `description` (richtext), `text_size` (select) — section header.
- `column_alignment` (select) — text alignment within each column (left/center/right).
- `columns_desktop` (range) — desktop column count.
- `column_gap` (select) — horizontal gap.
- `columns_mobile` (select), `swipe_on_mobile` (checkbox) — mobile carousel-vs-stack toggle.
- `padding_top` / `padding_bottom` (range) — section spacing.
- `show_section_divider` (checkbox), `divider_width` (select) — visual separator.
- `custom_class` (text).

## Visual behavior

- **Desktop:** N-column grid (typically 3 or 4). Each column is a `column` block — image (optional) + heading + body text + (optional) CTA button.
- **Mobile:** stacks to `columns_mobile` (often 1 or 2) or becomes a horizontal swipeable carousel when `swipe_on_mobile: true`.
- **No image mode:** when `show_image: false` on every block, the section becomes a text-only stat/feature row.
- **Hover:** subtle (image scale or CTA underline). Do not introduce custom hover micro-interactions without checking Sleek's existing `<motion-element>` patterns first.

## Accessibility

- Each column with a CTA renders that CTA as a focusable link.
- Heading order: section heading respects `heading_tag`; column titles default to a level below the section heading.
- Image columns carry meaningful `alt` text — never blank for content-bearing images.

## Blocks

### Block: column

- **Purpose:** One column in the row — image + heading + body + (optional) CTA. Block-level layout flexibility per `mobile_layout` (e.g. image-above vs. image-beside on mobile). Unlimited columns (`max_blocks: null`).
- **Figma sub-node:** Embedded in Home Page artboards. No standalone column Figma component.
- **Settings:**
  - `show_image` (checkbox) — toggle image rendering.
  - `image` (image_picker), `image_width` (select).
  - `title` (inline_richtext), `heading_size` (select), `heading_tag` (select).
  - `text` (richtext), `text_size` (select).
  - `button_label` (text), `button_style` (select), `button_link` (url).
  - `mobile_layout` (select) — image-stack / image-beside / text-only on mobile.

## Notes

- **Theme convention:** uses Sleek's grid utilities (`.f-grid`, `.f-grid-{N}-cols`) — see theme.md CSS conventions.
- **Section padding:** uses Sleek's `.section--padding` (theme.md gotcha).
- **`heading_highlight_style` + `inline_richtext` heading** allow a visual accent on a substring (e.g. "Why *Rhythm Rocks*"). Copy stays in locale JSON.
- **Reused across templates:** likely appears on more than just the Home page. When other page specs reference `multicolumn` in their stack, the viewer's "Where used" derivation will list every page automatically.
