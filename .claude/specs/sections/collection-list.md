---
kind: section
schema_version: 1
slug: "collection-list"
file: "sections/collection-list.liquid"
group: null
schema_name: "t:sections.collection-list.name"
blocks: ["featured_collection"]
presets_count: 1
max_blocks: 15
enabled_on_groups: null
disabled_on_groups: ["footer", "header", "custom.overlay"]
figma: []
last_curated: 2026-04-28
---

# Section — Collection List

## Purpose

Top-level collection routing: a row/grid of collection cards that route visitors into the brand's main shopping surfaces. For Rhythm Rocks, this maps to the 5 mega-menu categories — Engagement, Wedding, Diamonds, Jewelry, Education — though each block can override the underlying collection. High visual weight, primary navigation aid below the hero.

## Where used

[Derived by the viewer from page specs' `sections[]`. Do not list manually.]

## Schema settings (high-level)

- `color_scheme` (color_scheme) — section background/foreground.
- `layout` (select) — grid layout variant.
- `subheading` (text), `heading` (inline_richtext), `heading_size` (select), `heading_tag` (select), `heading_highlight_style` (select), `description` (richtext), `text_size` (select) — section header content.
- `card_color_inherited` (checkbox) — card colors inherit from section vs. their own scheme.
- `show_product_count` (checkbox) — display product count on each card.
- `show_icon` (checkbox) — display an icon on each card.
- `card_style` (select) — card visual variant.
- `card_image_ratio` (select) — image aspect ratio.
- `content_alignment` (select) — text alignment within the card.
- `columns_desktop` (range) — desktop column count.
- `column_gap` (select), `row_gap` (select) — grid spacing.
- `enable_slider` (checkbox) — desktop slider mode vs. static grid.
- `columns_mobile` (select), `swipe_on_mobile` (checkbox) — mobile carousel-vs-stack toggle.
- `padding_top` / `padding_bottom` (range) — section spacing.
- `show_section_divider` (checkbox), `divider_width` (select) — visual separator.
- `custom_class` (text).

## Visual behavior

- **Desktop:** typically 5 collection cards in a row (matches the 5 Rhythm Rocks categories). Hovering a card may reveal a CTA or shift the image scale.
- **Mobile:** with `swipe_on_mobile: true`, becomes a horizontal swipeable carousel; otherwise stacks per `columns_mobile`.
- **Slider mode (`enable_slider: true`):** carousel arrows + dots; uses `FoxTheme.Carousel` (Swiper).
- **Card content:** image + title + (optional) description + (optional) product count + (optional) icon. Card click → collection page.
- **Two-context color schemes:** when `card_color_inherited: false`, the per-card `color_scheme` (on the block) takes effect — see theme.md gotcha #6 on outer/inner schemes.

## Accessibility

- Each card is a single focusable link wrapping its full content (image + text).
- Card images carry meaningful `alt` text (per the collection's metafield or a fallback).
- Carousel mode honors keyboard arrow-key navigation when focused.
- Heading hierarchy respects `heading_tag` to avoid skipping levels.

## Blocks

### Block: featured_collection

- **Purpose:** One collection card. Each block can override the collection's default image + title + description, or fall through to the collection's own data. Up to 15 cards (`max_blocks: 15`).
- **Figma sub-node:** Embedded in Home Page artboards. No standalone card component in the current Figma file.
- **Settings:**
  - `collection` (collection) — the Shopify collection this card represents.
  - `image` (image_picker) — override image (else uses the collection's own image).
  - `title` (text) — override title.
  - `description` (richtext) — short copy under the title.

## Notes

- **Mega-menu connection:** the 5 cards on Home likely point to the same collections that drive the header mega-menu (Engagement, Wedding, Diamonds, Jewelry, Education). The mega-menu Figma states (`98:3196`, `98:3568`, `98:3351`, `98:3635`, `98:3442`) link to the header section spec — not to this section. But the connecting point is the underlying Shopify navigation/collections.
- **Section padding:** uses Sleek's `.section--padding` (theme.md gotcha).
- **Heading highlight style:** the `heading_highlight_style` setting + `inline_richtext` heading allow a visual accent on a substring (e.g. "Discover *our* collections"). Keep copy in locale JSON, never inline in spec.
