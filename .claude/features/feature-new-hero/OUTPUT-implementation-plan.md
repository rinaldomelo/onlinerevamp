# Implementation Plan: new-hero

Generated: 2026-04-25
Feature spec: `.claude/features/feature-new-hero/feature.md`

## Summary

A new dark-themed Shopify section that renders a hero band — large headline, lead paragraph, optional Shopify-Plus-style partner badge — followed by a 2-up grid of feature cards (eyebrow icon + label, h3, body, image, purple CTA button). Schema-driven via section settings + a `feature_card` block type locked to exactly 2 instances. Coexists with the existing `slideshow` section; does not replace it.

## Human-First Breakdown

### Admin Setup (human tasks in Shopify admin)

**No admin setup required** — this feature works entirely with theme code and section settings. No metafields, metaobjects, pages, or collections need to be created.

When the merchant later adds the section in the customizer, they should have ready:
- 2 hero card images (any aspect, ideally landscape, ~1200×800)
- 2 small eyebrow icons (24–48px SVG/PNG)
- 1 badge icon (small SVG, lock-style or whatever the brand uses)

### Code Preparation (before any visitor touches the page)

1. The section file exists at `sections/section-new-hero.liquid` and is registered with Shopify so it appears in the customizer's section list.
2. Section is **available everywhere** but **not auto-placed** on any template. Merchant adds it via the editor.
3. Default preset spawns the section with 2 `feature_card` blocks pre-filled with placeholder content.
4. Stylesheet `assets/section-new-hero.css` is loaded only when this section is on the page.
5. Section root carries `class="section section--padding new-hero color-scheme-inverse"` and inline `--section-padding-top` / `--section-padding-bottom` per theme convention.
6. Inside, the markup is: `<page-width>` → headline → lead → (if enabled) absolute-positioned partner badge → 2-card grid.
7. Each card renders: eyebrow icon + label, h3 heading, body, image (or placeholder if missing), full-width purple CTA button.
8. Each major element is wrapped in `<motion-element data-motion="fade-up">` with a staggered `data-motion-delay`.

### Live Behavior (when a user interacts)

1. Page loads, section is below the fold (or at top — merchant decides).
2. User scrolls the section into view.
3. Headline fades up (0ms delay).
4. 50ms later, lead paragraph fades up.
5. 50ms later, badge fades up (skip if `enable_badge` is false).
6. 50ms later, card 1 fades up.
7. 50ms later, card 2 fades up.
8. User hovers a card → card lifts 2px (smooth transition).
9. User hovers a CTA button → background shifts to a lighter purple.
10. User clicks a CTA button → navigates to `block.settings.button_link`.
11. If `button_link` is empty, the button renders with `aria-disabled="true"` and no `href`; click does nothing.
12. On viewports below 768px, the partner badge stops being absolute-positioned and sits below the lead in document flow. The 2-card grid collapses to a single column.

## Files

### New Files
- `sections/section-new-hero.liquid` — markup, schema, asset loading
- `assets/section-new-hero.css` — component styles (BEM-style under `.new-hero` namespace)

### Modified Files
- `locales/en.default.schema.json` — add `t:sections.new-hero.*` translation keys for setting labels and the preset name

### Theme Components Reused
- `<motion-element>` (registered in `assets/theme.js`) — reveal-on-scroll
- `.section`, `.section--padding`, `.page-width`, `.color-{scheme.id}` (theme.css) — wrapper conventions
- `.btn`, `.btn--primary`, `.btn--lg`, `.btn--block` (theme.css) — buttons (override only the bg/text colors via section-scoped CSS)
- `scheme-inverse` — color scheme (already configured, dark)
- DM Sans fonts (already loaded via theme settings)
- `divider` snippet — top-of-section divider when enabled

### Not used
- `{% render 'section-heading', ... %}` — flagged in scoping; the badge layout doesn't fit its template
- `<parallax-element>` — no parallax in this section

## Build Steps

### Step 1 — Section skeleton + minimal schema

**Do:** Create `sections/section-new-hero.liquid` with bare-minimum schema (color_scheme, padding, divider, custom_class) and an empty wrapper. Stylesheet asset_url tag at top. Create empty `assets/section-new-hero.css`.

**Files:** `sections/section-new-hero.liquid`, `assets/section-new-hero.css`

**Details:**
- Schema includes `name: "t:sections.new-hero.name"`, `tag: "section"`, `class: "section"`.
- `disabled_on: { groups: ["footer", "header", "custom.overlay"] }`.
- Settings: paragraph (FoxEcom how-to link), header "General", `color_scheme` (default `scheme-inverse`), header "Section padding", `padding_top`/`padding_bottom` (0–100/2/50), header "Divider", `show_section_divider`, `divider_width` (visible_if), header "Custom attribute", `custom_class`.
- Empty preset: `"presets": [{ "name": "t:sections.new-hero.presets.name" }]`.
- Markup: `<div class="section section--padding new-hero color-{{ section.settings.color_scheme }}{% if section.settings.custom_class != blank %} {{ section.settings.custom_class }}{% endif %}" style="--section-padding-top: {{ section.settings.padding_top }}px;--section-padding-bottom: {{ section.settings.padding_bottom }}px;"><div class="page-width"><!-- content --></div></div>`.
- Top of file: `{{ 'section-new-hero.css' | asset_url | stylesheet_tag }}`.
- Render `divider` snippet at top.

**Verify:** Section appears in the theme customizer's "Add section" list. Adding it to a page renders an empty section with proper padding. Locale labels may appear as raw `t:` strings — that's expected until Step 10.

### Step 2 — Static markup (hardcoded content)

**Do:** Inside `.page-width`, write the full markup using literal placeholder text and CSS-only image placeholders (no `image_picker` outputs yet).

**Files:** `sections/section-new-hero.liquid`

**Details:**
- `.new-hero__intro` wrapper containing the headline, lead, and badge (badge is `position: absolute` on desktop, so this wrapper is `position: relative`).
- `<h1 class="new-hero__heading">We know Shopify.<br>Your growth partner.</h1>`.
- `<p class="new-hero__lead">…lorem (~50 words)…</p>`.
- `.new-hero__badge` (placeholder content, no real icon yet).
- `.new-hero__grid` containing two `.new-hero__card` divs. Each: `.new-hero__card-eyebrow` (icon + label), `.new-hero__card-heading` (h3), `.new-hero__card-body` (p), `.new-hero__card-image` (empty div, CSS will paint), `<a class="btn btn--primary btn--lg btn--block new-hero__cta" href="#">LEARN MORE <span class="new-hero__cta-plus" aria-hidden="true">+</span></a>`.

**Verify:** Markup structure renders. Visual unstyled / broken — that's expected; CSS comes next.

### Step 3 — CSS (desktop)

**Do:** Write `assets/section-new-hero.css` to match the reference visually at desktop widths.

**Files:** `assets/section-new-hero.css`

**Details:**
- Namespace under `.new-hero`.
- Heading: large size matching theme's hd1 fluid scale. `max-width: 76rem` on heading (760px), `max-width: 52rem` on lead (520px).
- Lead: `color: rgba(var(--color-foreground), 0.7);` 1.6rem font-size, 1.6 line-height, 2.8rem top margin.
- Cards: `display: grid; grid-template-columns: 1fr 1fr; gap: 2.4rem; margin-top: 6.4rem;`. Each card: `background: rgba(var(--color-foreground), 0.04); border-radius: 1.4rem; padding: 3.2rem; min-height: 48rem; display: flex; flex-direction: column; gap: 1.8rem; position: relative; overflow: hidden;`.
- Eyebrow: 1.1rem, letter-spacing 0.16em, uppercase, dim color, flex with icon.
- Card image area: `flex: 1; min-height: 21rem; border-radius: 1.4rem; overflow: hidden;`. Apply `object-fit: cover` once `image_picker` wired.
- CTA scoped override: `.new-hero .btn--primary { background: #8C45FF; color: #fff; } .new-hero .btn--primary:hover { background: #A164FF; }`.
- `.new-hero__cta-plus`: 2.4rem circle, semi-transparent white bg.
- Partner badge: `position: absolute; top: 9.6rem; right: 3.2rem; background: #fff; color: #000; border-radius: 0.8rem; padding: 1rem 1.4rem;` with the lock icon container.
- `.new-hero__intro { position: relative; }` so the badge anchors against it.

**Verify:** Visual matches the reference at ≥1024px width. Cards render side-by-side. Badge floats top-right. Buttons are pill-shaped purple with `+` icon.

### Step 4 — Responsive (mobile collapse)

**Do:** Add a media query that collapses the grid below 768px and unsticks the badge.

**Files:** `assets/section-new-hero.css`

**Details:**
- `@media screen and (max-width: 767.98px)`:
  - `.new-hero__grid { grid-template-columns: 1fr; gap: 1.6rem; margin-top: 3.2rem; }`
  - `.new-hero__badge { position: static; display: inline-flex; margin-top: 1.6rem; }`
  - `.new-hero__card { min-height: auto; padding: 2.4rem; }`
  - Heading reduces if not handled by fluid clamp.

**Verify:** Resize browser below 768px — badge sits below the lead, cards stack, no horizontal scroll.

### Step 5 — Schema-drive section-level content

**Do:** Replace hardcoded headline / lead / badge markup with Liquid that reads from new section settings. Add the settings to the schema.

**Files:** `sections/section-new-hero.liquid`

**Details:**
- Add to schema (in standard order, after `color_scheme` setting, before padding):
  - header "Content"
  - `inline_richtext` `heading` (default: "We know Shopify. Your growth partner.")
  - `select` `heading_size` (h6 → hd1 options, default `hd1`)
  - `select` `heading_tag` (h1 → h6, default `h1`)
  - `richtext` `lead` (default: "<p>Los Angeles-based Shopify Plus design and development agency...</p>")
  - header "Badge"
  - `checkbox` `enable_badge` (default `true`)
  - `image_picker` `badge_icon`
  - `text` `badge_text` (default "SHOPIFY PLUS PARTNER", `\n` for line breaks)
- Markup:
  - Headline: dynamic tag wrapper using `heading_tag`, applying `heading_size` class. Skip if blank.
  - Lead: only render if not blank.
  - Badge: only render if `section.settings.enable_badge`. Lock icon area only renders when `badge_icon` is set. `badge_text` `\n` → `<br>`.

**Verify:** Editing heading/lead/badge values in the customizer updates the page. Toggling `enable_badge` shows/hides the badge.

### Step 6 — Schema-drive cards via `feature_card` block

**Do:** Replace hardcoded 2 cards with a `{% for block in section.blocks %}` loop. Define the block type and its settings.

**Files:** `sections/section-new-hero.liquid`

**Details:**
- Add to schema:
  ```json
  "blocks": [
    {
      "type": "feature_card",
      "name": "t:sections.new-hero.blocks.feature_card.name",
      "limit": 2,
      "settings": [
        { "type": "image_picker", "id": "eyebrow_icon", "label": "..." },
        { "type": "text", "id": "eyebrow_label", "label": "..." },
        { "type": "inline_richtext", "id": "heading", "label": "..." },
        { "type": "richtext", "id": "body", "label": "..." },
        { "type": "image_picker", "id": "image", "label": "..." },
        { "type": "text", "id": "button_label", "label": "...", "default": "Learn more" },
        { "type": "url", "id": "button_link", "label": "..." }
      ]
    }
  ]
  ```
- Markup: `{% for block in section.blocks %}<div class="new-hero__card" {{ block.shopify_attributes }}>...</div>{% endfor %}`.
- Image rendering: `{{ block.settings.image | image_url: width: 1200 | image_tag: loading: 'lazy', sizes: '(min-width: 768px) 50vw, 100vw', widths: '400, 600, 800, 1200, 1600' }}`.
- If `block.settings.image == blank`, render `.new-hero__card-image--placeholder` (CSS-only neutral gradient).
- If `block.settings.button_link == blank`, button renders with `aria-disabled="true"` and no `href`.

**Verify:** Cards render from blocks. Editing block content updates the rendered card.

### Step 7 — Default preset (2 cards with placeholder content)

**Do:** Add the `presets` array with 2 default `feature_card` blocks pre-filled.

**Files:** `sections/section-new-hero.liquid`

**Details:**
```json
"presets": [
  {
    "name": "t:sections.new-hero.presets.name",
    "blocks": [
      { "type": "feature_card", "settings": { "eyebrow_label": "Builds & migrations", "heading": "Shopify Website Design & Development", "body": "<p>Whether you need a fast, strategic Shopify launch or a fully custom tailored shopping experience.</p>", "button_label": "Learn more" } },
      { "type": "feature_card", "settings": { "eyebrow_label": "Grow your team", "heading": "Fractional Shopify Website Teams", "body": "<p>Our team provides senior strategy, design, and development to own your website end-to-end.</p>", "button_label": "Learn more" } }
    ]
  }
]
```

**Verify:** Adding a fresh `new-hero` from "Add section" spawns the section with 2 pre-filled cards.

### Step 8 — Reveal animations

**Do:** Wrap the headline, lead, badge, and each card in `<motion-element data-motion="fade-up" data-motion-delay="N">` with staggered delays (50, 100, 150, 200, 250).

**Files:** `sections/section-new-hero.liquid`

**Details:**
- `{%- assign motion_delay = 50 -%}` at top.
- Wrap heading; bump delay; wrap lead; bump; wrap badge (when rendered); bump; wrap card 1; bump; wrap card 2.
- Wrap each card individually so they reveal in order.

**Verify:** Scrolling the section into view triggers fade-up reveals in order. Without JS, content remains visible.

### Step 9 — Edge cases & hover micro-interactions

**Do:** Verify and harden all the edge cases. Add hover transitions.

**Files:** `assets/section-new-hero.css`, `sections/section-new-hero.liquid`

**Details:**
- Card hover: `.new-hero__card { transition: transform 0.3s ease; } .new-hero__card:hover { transform: translateY(-2px); }`.
- Empty heading / lead: `{%- if x != blank -%}...{%- endif -%}`.
- Missing card image: render `.new-hero__card-image--placeholder` (neutral CSS gradient).
- Missing badge_icon when enable_badge: hide `.new-hero__badge-icon` element.
- Missing button_link: button gets `aria-disabled="true"`, no `href`.
- 0 blocks: hide grid container entirely. 1 block: render it full-width.

**Verify:** Each edge case triggers correctly. Hover effects feel smooth.

### Step 10 — Translations (locales/en.default.schema.json)

**Do:** Add all the `t:sections.new-hero.*` keys to the English schema locale file.

**Files:** `locales/en.default.schema.json`

**Details:**
- New keys under a `sections.new-hero` namespace:
  - `name` ("New hero"), `presets.name` ("New hero")
  - `settings.heading.label`, `settings.heading_size.label`, `settings.heading_tag.label`, `settings.lead.label`, `settings.enable_badge.label`, `settings.badge_icon.label`, `settings.badge_text.label`
  - `blocks.feature_card.name` ("Feature card")
  - `blocks.feature_card.settings.eyebrow_icon.label`, `eyebrow_label.label`, `heading.label`, `body.label`, `image.label`, `button_label.label`, `button_link.label`
- Reuse existing common keys: `t:sections.all.colors.label`, `t:sections.all.padding.*`, `t:sections.all.divider.*`, `t:sections.all.custom_attr.*`, `t:sections.all.heading_tag.options__N.label`, etc.

**Verify:** All labels in the customizer render in plain English.

## Risks & Considerations

1. **No hard `min_blocks` enforcement.** Shopify schema only has `limit` (max). Preset spawns 2, but the merchant can manually delete to 1 or 0. CSS handles 0 (hide grid) and 1 (full-width card).
2. **Hardcoded purple `#8C45FF`** — flagged in scoping. Brand accent change requires a CSS edit. Acceptable.
3. **Image aspect ratio variability.** `image_picker` accepts any image. Tall portrait images crop via `object-fit: cover`. Document in schema `info` text.
4. **DM Sans weights.** Theme's settings_data uses `dm_sans_n4` (400) and `dm_sans_n5` (500). Reference design uses 700 in places (.btn, partner-badge). Will check whether `dm_sans_n7` is available; if not, use the heaviest loaded weight and accept slightly different visual.
5. **Locale fallbacks.** Adding keys only to `en.default.schema.json`. Other 50 locales' `.schema.json` files won't have these keys — Shopify falls back to English. Standard for a custom theme during development.
6. **Section heading collision** with homepage `<h1>`. Mitigated by the `heading_tag` setting (merchant can demote to `h2`). Default is `h1`.

## Open Questions

None — all resolved during scoping (Q1–Q8 answered (a)).
