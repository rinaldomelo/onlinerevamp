---
kind: section
schema_version: 1
slug: "slideshow"
file: "sections/slideshow.liquid"
group: null
schema_name: "t:sections.slideshow.name"
blocks: ["slide", "video"]
presets_count: 1
max_blocks: 6
enabled_on_groups: null
disabled_on_groups: ["header", "footer", "custom.overlay"]
figma: []
last_curated: 2026-04-28
---

# Section — Slideshow

## Purpose

Full-bleed hero carousel for landing pages. The Home page's first impression: a sequence of brand mood / promotional / collection-routing slides with primary CTAs. LCP-critical — the first slide is the page's largest contentful paint target. Supports both image and video slide blocks (`slide` and `video` block types).

## Where used

[Derived by the viewer from page specs' `sections[]`. Do not list manually.]

## Schema settings (high-level)

- `container` (select) — `full` (full-bleed) vs. `fixed` (page-width). Sleek default + Rhythm Rocks intent: `full`.
- `layout` (select) — `standard` / `centered` / `split`.
- `slide_height` (select) — `adapt` / `small` / `medium` / `large` / fixed numeric.
- `show_dots` (checkbox) — pagination dots toggle.
- `autoplay` (checkbox) + `autoplay_delay` (range) — auto-advance behavior.
- `controls_position` (select) — placement of arrows / dots.
- `show_text_below` (checkbox) — text positioning vs. inside the slide.
- `text_alignment_mobile` (select) — mobile-specific alignment override.
- `accessibility_info` (text) — screen-reader announcement label.
- `custom_class` (text) — escape hatch for adding a class.

## Visual behavior

- **Desktop (per Home Page Desktop, `2:653`):** full-bleed at 1440px, content positioned per `content_position` (e.g. `middle-left` for the brand-mood opener). Pagination + prev/next controls below the slide per `controls_position: below`.
- **Mobile (per Home Page Mobile, `90:664`):** content reflows to mobile's centered position via `content_position_mobile` per-slide override. Slide height adapts to content.
- **Auto-advance:** when `autoplay: true`, advances every `autoplay_delay` seconds. Pauses on hover/focus.
- **Reduced-motion:** auto-advance disabled when `prefers-reduced-motion: reduce` (per Sleek's existing `<motion-element>` integration — verify during implementation).
- **Image vs. video:** image slides use `background` (desktop) and `background_mobile` (mobile-specific override). Video slides use `<video>` or external `video_url` with a poster-image fallback.

## Accessibility

- Keyboard navigation: left/right arrow keys advance slides when focus is within the carousel.
- Pagination dots are focusable buttons with descriptive labels (per `accessibility_info`).
- Auto-advance respects `prefers-reduced-motion`.
- Each slide announces its position (e.g. "Slide 2 of 3") to screen readers.
- Focus moves to the active slide content on advance, not the next button.

## Blocks

### Block: slide

- **Purpose:** Single image-based hero slide. Combines a background image (desktop + mobile variants), an overlay-darkening layer, and a content stack (subheading, title, description, CTA button). Up to 6 slides per slideshow (`max_blocks`).
- **Figma sub-node:** No standalone Figma component — slide visuals live inside the Home Page artboards. Reference `pid87VYFva2zFBOXTChMVR:2:653` (desktop) and `pid87VYFva2zFBOXTChMVR:90:664` (mobile) for the canonical hero look.
- **Settings:**
  - `color_scheme` (color_scheme)
  - `background` (image_picker) — desktop slide image
  - `background_mobile` (image_picker) — optional mobile-specific image override
  - `image_overlay_opacity` (range)
  - `show_content_in_container` (checkbox)
  - `content_position` (select) — desktop alignment (e.g. `middle-left`, `top-center`)
  - `content_position_mobile` (select) — mobile alignment override
  - `text_alignment` (select)
  - `title` (inline_richtext)
  - `heading_size` (select), `heading_tag` (select)
  - `subheading` (text)
  - `description` (richtext), `description_size` (select)
  - `button_label` (text), `button_link` (url), `button_style` (select)

### Block: video

- **Purpose:** Single video hero slide. Supports uploaded `video` (Shopify-hosted) or external `video_url` (YouTube/Vimeo). Uses `cover_image` as the poster/fallback. Same content stack as `slide`.
- **Figma sub-node:** No standalone match in current Figma file. If Rhythm Rocks decides to add video slides, source designs will be added to a future Figma frame and linked here.
- **Settings:**
  - `color_scheme` (color_scheme)
  - `video` (video) — Shopify-hosted upload
  - `video_url` (video_url) — external YouTube/Vimeo URL
  - `cover_image` (image_picker) — poster/fallback
  - `video_description` (text) — accessibility label for screen readers
  - `image_overlay_opacity` (range)
  - `content_position` (select), `text_alignment` (select)
  - `title` (inline_richtext), `heading_size` (select), `heading_tag` (select)
  - `subheading` (text)
  - `description` (richtext), `description_size` (select)
  - `button_label` (text), `button_link` (url), `button_style` (select)

## Notes

- **Theme convention:** uses Sleek's existing carousel infrastructure (`FoxTheme.Carousel`, a Swiper wrapper). Do NOT introduce a second carousel library.
- **Section padding:** uses Sleek's shared `.section--padding` class with inline `--section-padding-top`/`--section-padding-bottom` CSS vars (see `theme.md` critical gotchas — do not generate per-section-id padding).
- **Disabled on groups:** `header`, `footer`, `custom.overlay` — slideshow won't appear in the customizer's group sections.
