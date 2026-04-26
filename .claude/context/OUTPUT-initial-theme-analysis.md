# Theme Analysis — Sleek by FoxEcom

Generated: 2026-04-25

## Summary

This is **Sleek v2.2.0** by FoxEcom (the developer console logs `Sleek theme (v2.2.0) by Foxecom`). It's a heavily customized commercial theme — not a Dawn/Debut fork. It uses a global `window.FoxTheme` JS namespace, a Tailwind-like utility CSS layer (`.f-grid`, `.sm:w-1/2`, etc.) on top of BEM component classes, and a deep web-component architecture (~67 custom elements). Color schemes are RGB-triplet CSS variables consumed via `rgb(var(--color-foreground))`. Typography is fluid via `clamp()` driven by theme settings.

**Critical gotcha:** This theme does **NOT** use the `section-{{ section.id }}-padding` pattern from the bootcamp template. Instead it uses a single shared `.section--padding` class that reads `--section-padding-top` / `--section-padding-bottom` from inline `style` attributes on the section root. New sections must follow this convention to stay consistent.

## File Structure Overview

- **81 sections** in `sections/` (plus 3 group files: `header-group.json`, `footer-group.json`, `overlay-group.json`)
- **110 snippets** in `snippets/` (~30 are icons, the rest are reusable components)
- **25 templates** in `templates/` (multiple product/collection variants — `.1-column.json`, `.2-columns.json`, `.grid-mix.json`, `.thumbnail-carousel.json`, plus `collection.banner-as-background.json`, `banner-right`, `banner-top`)
- **124 assets** (JS + CSS, no minification — Shopify handles that)
- **50 locale files** in `locales/` (full multi-language coverage including RTL: `he`, `ar` configurable via settings)
- **Layout:** `theme.liquid` (main) and `password.liquid`
- **Config:** `settings_schema.json` declares theme info; `settings_data.json` stores merchant values

Notable: section-level templates are pre-built variants of product and collection pages — clients can switch between layouts via Shopify admin without code changes.

## CSS Conventions

### Grid System

Custom Tailwind-flavored grid named with the `f-` prefix.

- **Container:** `.f-grid` (CSS grid), `.f-flex` (flexbox with negative margin), `.f-masonry` (column-count)
- **Columns:** `.f-grid-{1-12}-cols` with responsive variants `.sm:f-grid-N-cols`, `.md:f-grid-N-cols`, `.lg:f-grid-N-cols`, `.xl:f-grid-N-cols`, `.xxl:f-grid-N-cols`
- **Width utilities:** `.w-{1/2, 1/3, 1/4, 1/5, 4/5, 1/12-12/12, full, auto}`, `.h-full`, `.max-w-full`, `.min-height-screen`. All have responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`, `xxl:`).
- **Children:** Direct grid items use `.f-column` (sets min-width/min-height to 0 for proper grid behavior).
- **Gaps:** `.f-grid--gap-{none|extra-small|small|medium|large|extra-large}` and row variants `.f-grid--row-gap-*`. Gaps are CSS custom props (`--column-gap`, `--column-gap-tablet`, `--column-gap-tablet-large`, `--column-gap-mobile`, `--row-gap*`) so they auto-adjust per breakpoint.

### Breakpoints

Two coexisting systems — pay attention.

**Primary (Tailwind-style, used by utilities):**
- `sm` ≥ 640px
- `md` ≥ 768px
- `lg` ≥ 1024px
- `xl` ≥ 1280px
- `xxl` ≥ 1536px

**Component CSS uses these min-widths:** 640, 750, 768, 1024, 1200, 1280, 1536

**Component CSS also uses these max-widths:** 639.98, 767, 767.98, 1023.98, 1279.98

There is no single source-of-truth breakpoint set — different components were written against different sets. For new code, **stick to 768 / 1024 / 1280 / 1536** to align with the utilities.

JS-side breakpoints (from `theme.js`):
- `FoxTheme.config.mediaQueryMobile = 'screen and (max-width: 767px)'`
- `FoxTheme.config.mediaQueryTablet = 'screen and (max-width: 1023px)'`

### Color Variables

All colors are stored as **comma-separated RGB triplets** (e.g. `--color-foreground: 17,17,17;`) so they can be used with opacity: `rgba(var(--color-foreground), 0.5)`. Solid: `rgb(var(--color-foreground))`.

Per-scheme variables (from `snippets/css-variables.liquid`):
- `--color-background`, `--color-secondary-background`
- `--color-primary` (accent)
- `--color-text-heading`, `--color-foreground` (body text)
- `--color-border`
- `--color-button`, `--color-button-text`
- `--color-secondary-button`, `--color-secondary-button-text`, `--color-secondary-button-border`
- `--color-button-hover-background`, `--color-button-hover-text`, `--color-button-before`
- `--color-field`, `--color-field-text`
- `--color-link`, `--color-link-hover`
- `--color-product-price-sale`
- `--color-foreground-lighten-60`, `--color-foreground-lighten-19` (precomputed mixes)

Global (in `:root`, not scheme-bound):
- `--color-badge-{sale|soldout|hot|new}` and `-text` siblings
- `--color-cart-bubble`, `--color-keyboard-focus`

**Color scheme application:** Apply `.color-{scheme.id}` to a wrapper. The vars cascade. Two extras for breakpoint-specific schemes: `.desktop-color-{scheme.id}` (≥768px) and `.mobile-color-{scheme.id}` (<768px).

### Naming Convention

BEM-ish with two prefix systems:
- **`.f-`** for foundational utilities/grid (FoxEcom prefix): `.f-grid`, `.f-flex`, `.f-column`, `.f-grid--gap-large`
- **Component classes** are BEM: `.section__header`, `.section__header--horizontal`, `.btn--primary`, `.multicolumn-card__image`, `.rich-text__heading`
- **Tailwind-style utility classes** also exist: `.text-sm`, `.text-base`, `.flex`, `.items-center`, `.gap-4`, `.block`, `.hidden`, `.md:flex`, `.lg:flex-col`, `.justify-between`. These are theme-defined, not Tailwind — but the API is similar enough that you can write Tailwind-flavored class strings and they generally work.

### Spacing Patterns

- **Root unit:** `html { font-size: 62.5%; }` so `1rem = 10px`. Many CSS values are written in `rem` already pre-divided (e.g. `5rem = 50px`). Liquid sections often write `{{ value | divided_by: 10.0 }}rem`.
- **Section padding:** Driven by `--section-padding-top` / `--section-padding-bottom` set inline on the section root. The `.section--padding` class scales them down on mobile (`min(4.8rem, var(...) * 0.6)` under 768px, `0.75` under 1024px, `0.8` under 1280px, full value at 1280px+).
- **Page padding:** `--page-padding` is `1.5rem` mobile, `5rem` at 1200px+, dynamic `max(13.5rem, ...)` at 1536px+ to fill the viewport edges symmetrically with `--page-width`.

### Page Width / Containers

- **`.page-width`** — Standard wrapper. `margin: 0 auto; padding-inline: var(--page-padding);` Max-width comes from `--page-width`, set in `:root` from `settings.page_width` (e.g. 1600px) inside `css-variables.liquid`.
- **`.page-width--full`** — Edge-to-edge with only `1.5rem` inline padding (mobile-style on all viewports).
- **`.page-width--narrow`** — `max-width: 93rem` (≥1280px), no padding.
- **`.page-width--small`** — `max-width: 120rem` (≥1280px), 1.5rem padding.

Default behavior: `--page-width` configurable in theme settings (default `1600`). When `1600`, `--page-width-margin: 2rem`; otherwise `0rem`.

## JavaScript Conventions

### Base Files (DO NOT MODIFY)

- **`assets/theme.js`** — 2764 lines. Initializes `window.FoxTheme`, defines `FoxTheme.config`, `FoxTheme.utils`, `FoxTheme.a11y`, `FoxTheme.pubsub`, `FoxTheme.Carousel`, `FoxTheme.delayUntilInteraction`, `FoxTheme.focusVisiblePolyfill`. Defines ~30 core custom elements (modals, drawers, accordion, cart-count, quantity inputs, video, localization, grid-list, motion-element, tabs, products-bundle, product-form, newsletter-form, scrolling-promotion, etc.).
- **`assets/vendor.js`** — Minified bundle. Includes Swiper (exposed as `FoxTheme.Swiper.{Swiper, Navigation, Pagination, Keyboard, Mousewheel, Autoplay, ...}`) plus a MutationObserver-based "qsa-observer" library.
- **`assets/theme.css`** — 6809 lines. All foundational styles.
- **`assets/vendor.css`** — Minified.
- **`assets/theme-editor.js`** — Only loaded in `request.design_mode` (theme customizer).
- **`snippets/js-variables.liquid`** — Renders inline `<script>` that initializes `window.FoxTheme.routes`, `.settings`, `.variantStrings`, `.cartStrings`, `.accessibilityStrings`, `.quickOrderListStrings`, `.shippingCalculatorStrings`. Theme name reads `'Sleek'`, version `'2.2.0'`.
- **`snippets/css-variables.liquid`** — Generates all per-scheme color variables and root-level typography/spacing/radius variables. Heavy Liquid logic for fluid typography (clamp() calculation per heading level).

### Existing Components

Custom elements registered across `theme.js` and individual asset files. Incomplete list (use these — don't reimplement):

**Layout / chrome:**
- `<page-transition>`, `<sticky-header>`, `<basic-header>`, `<announcement-bar>`, `<scrolling-promotion>`, `<footer-details>`

**Modals & drawers:**
- `<modal-component>`, `<basic-modal>`, `<drawer-component>`
- `<menu-drawer>`, `<menu-drawer-details>` (extends `<details>`), `<menu-product-list>`
- `<details-dropdown>`, `<details-mega>`, `<header-account>`
- `<search-drawer>`, `<predictive-search>`
- `<password-details>`

**Cart:**
- `<cart-drawer>`, `<cart-drawer-products-recommendation>`
- `<cart-items>`, `<cart-count>`, `<cart-discount>`, `<cart-discount-remove>`
- `<cart-note>`, `<cart-remove-item>`, `<gift-note>`, `<gift-wrap-remove-item>`, `<gift-wrapping>`
- `<free-shipping-goal>`, `<calculate-shipping>`, `<shipping-calculator>`
- `<cart-addon-accordion>`, `<cart-addon-modal>`, `<main-cart>`

**Product:**
- `<product-form>` (extends `<form>`)
- `<product-tabs>`, `<products-bundle>`, `<product-bundle-variant-selector>`, `<product-recently-viewed>`
- `<quantity-input>`, `<quantity-selector>`
- `<select-element>`

**Collection / facets:**
- `<facet-form>`, `<facet-count>`, `<facet-remove>`, `<facet-short>`, `<price-range>`
- `<grid-list>`, `<layout-switcher>`, `<load-more-button>`, `<collection-list>`

**Building blocks:**
- `<accordion-details>` (extends `<details>`), `<accordion-group>` (extends `<details>`)
- `<tabs-component>`, `<tab-selector>`
- `<motion-element>` — Adds animations on scroll-into-view. Attributes: `data-motion="fade-up|zoom-out|zoom-out-sm"`, `data-motion-delay="50"`. **Use this for any reveal animation in new sections.**
- `<parallax-element>` — Scroll parallax. Attributes: `data-parallax="0.3"`, `data-parallax-direction`.
- `<highlight-text>` (extends `<em>`) — Used by the `highlight-text` snippet for underlined heading highlights.
- `<image-lazy>`, `<video-element>`, `<card-images>`
- `<localization-form>`, `<country-province>`, `<newsletter-form>` (extends `<form>`)
- `<progress-bar>`, `<testimonials-component>`

### Event Patterns

`FoxTheme.pubsub` provides a global pub/sub. Use it instead of bespoke `CustomEvent`s for cross-component communication.

```js
const unsubscribe = FoxTheme.pubsub.subscribe(
  FoxTheme.pubsub.PUB_SUB_EVENTS.cartUpdate,
  (data) => { /* data.cart is the JSON */ }
);
// remember to call unsubscribe() in disconnectedCallback
FoxTheme.pubsub.publish(FoxTheme.pubsub.PUB_SUB_EVENTS.cartUpdate, { cart: cartJson });
```

**Defined event names** (`FoxTheme.pubsub.PUB_SUB_EVENTS`):
- `cartUpdate` — `'cart-update'`
- `quantityUpdate` — `'quantity-update'`
- `quantityRules` — `'quantity-rules'`
- `quantityBoundries` — `'quantity-boundries'` (sic)
- `variantChange` — `'variant-change'`
- `cartError` — `'cart-error'`
- `facetUpdate` — `'facet-update'`
- `optionValueSelectionChange` — `'option-value-selection-change'`

### Third-Party Libraries

- **Swiper** — Bundled in `vendor.js`. Access via `FoxTheme.Swiper.Swiper` and modules `FoxTheme.Swiper.{Navigation, Pagination, Keyboard, Mousewheel, Autoplay, ...}`. A `FoxTheme.Carousel` helper class wraps it with sensible defaults.
- **PhotoSwipe** — `assets/photoswipe.js` + `assets/photoswipe-component.css`, lazy-loaded for product galleries.
- **`qsa-observer`** — MutationObserver helper inside `vendor.js`.

No jQuery, no React, no Vue. Vanilla only.

### Script Loading

- All theme JS uses `<script defer>` from layout (`theme.liquid`).
- Per-section JS is loaded with separate `<script defer>` tags inside the section file when needed (e.g. `quick-view.js` is conditionally loaded if quick-view is enabled).
- CSS uses `{{ '...' | asset_url | stylesheet_tag }}` — `vendor.css` and `theme.css` are preloaded with `preload: true`.
- `theme-editor.js` only loads when `request.design_mode` is true.
- A `FoxTheme.delayUntilInteraction(callback, delay)` helper exists for deferring non-critical scripts until the first user interaction (mouseover, keydown, touch, wheel) or after `delay` ms.

## Liquid Conventions

### Section Wrapper Pattern

The canonical structure (used by `multicolumn`, `rich-text`, `image-with-text`, `newsletter`, `featured-collection`, etc.):

```liquid
{{ 'section-{name}.css' | asset_url | stylesheet_tag }}

{%- liquid
  assign motion_delay = 50
  # ...other vars...
-%}

{% render 'divider',
  show_divider: section.settings.show_section_divider,
  divider_width: section.settings.divider_width
%}

<div
  class="section section--padding {component-name} color-{{ section.settings.color_scheme }}{% if section.settings.custom_class != blank %} {{ section.settings.custom_class }}{% endif %}"
  style="--section-padding-top: {{ section.settings.padding_top }}px;--section-padding-bottom: {{ section.settings.padding_bottom }}px;"
>
  <div class="page-width">
    {# section content #}
  </div>
</div>

{% schema %} ... {% endschema %}
```

Schema declares `"tag": "section"` and `"class": "section"` so Shopify renders an outer `<section class="section ...">`. The inner `<div class="section section--padding ...">` is the styled wrapper.

### Section Padding Approach

**Important — different from the bootcamp default.** This theme does **not** generate per-section CSS like `.section-{{ section.id }}-padding { ... }`. Instead:

```liquid
<div class="section--padding ..."
     style="--section-padding-top: {{ section.settings.padding_top }}px;
            --section-padding-bottom: {{ section.settings.padding_bottom }}px;">
```

The shared `.section--padding` rule (in `theme.css`) reads those custom properties and scales them responsively (60% mobile → 75% tablet → 80% small desktop → 100% ≥1280px).

**Don't add a `<style>` tag with `.section-{{ section.id }}-padding { ... }`** — it will duplicate logic and break the responsive scaling. New sections should reuse `.section--padding` and pass `--section-padding-top` / `--section-padding-bottom` inline.

### Standard Schema Settings

These appear in nearly every content section. Order matters — match it.

1. `paragraph` — link to FoxEcom docs (e.g. `[Read How-to](https://foxecom.link/...)`)
2. `header` — `t:sections.all.general.name`
3. `color_scheme` (id `color_scheme`, default `scheme-1`)
4. `header` — `t:sections.all.section_header.content`
5. `inline_richtext` — `heading`
6. `select` — `heading_size` (options `h6`, `h5`, `h4`, `h3`, `h2`, `h1`, `hd3`, `hd2`, `hd1`)
7. `select` — `heading_tag` (options `h1`–`h6`, used for the wrapping element while `heading_size` controls visual size)
8. `header` — `t:sections.all.highlight_text.header.content`
9. `paragraph` — explanation
10. `select` — `heading_highlight_style` (`none` / `underline`)
11. `text` — `subheading`
12. `richtext` — `description`
13. `select` — `text_size` (`text-sm`, `text-base`, `text-lg`, `text-inherit`)
14. (section-specific settings)
15. `header` — `t:sections.all.padding.section_padding_heading`
16. `range` — `padding_top` (min 0, max 100, step 2, unit `px`, default 50)
17. `range` — `padding_bottom` (same)
18. `header` — `t:sections.all.divider.content`
19. `checkbox` — `show_section_divider` (default `false`)
20. `select` — `divider_width` (`fixed` / `full`) with `visible_if: "{{ section.settings.show_section_divider == true }}"`
21. `header` — `t:sections.all.custom_attr.header`
22. `text` — `custom_class`

### Section Structure

Common idioms:
- **`disabled_on`** — Most content sections include `"disabled_on": { "groups": ["footer", "header", "custom.overlay"] }` to keep them out of group regions.
- **`presets`** — Almost every section has at least one preset (50 of 81 sections). Always include one.
- **Animations** — Wrap reveal-able content in `<motion-element data-motion="fade-up" data-motion-delay="{{ motion_delay }}">`. The `motion_delay` variable is incremented by 50 between siblings to stagger the reveals.
- **Section heading** — Use `{% render 'section-heading', section_settings: section.settings %}` to render the standard subheading + heading + description + optional button block. Keeps spacing/highlight handling consistent.
- **Highlights** — Use `{% render 'highlight-text', text: ..., style: section.settings.heading_highlight_style %}` instead of writing custom underlines.
- **Dividers** — Always render at the top of the section (above the wrapper) with the `divider` snippet.

### Snippet Patterns

Snippet naming is hyphenated, kebab-case. Mostly self-contained. Heavy reuse:
- **`section-heading`** — Standardized section header (subheading + heading + description + optional button)
- **`divider`** — Optional top-of-section horizontal line (full or page-width)
- **`highlight-text`** — Wraps heading text in `<highlight-text>` (custom element extending `<em>`) with optional underline animation
- **`button-icon`** — Renders an icon next to button text
- **`card-product`**, **`card-product-list`**, **`card-product-metro`**, **`card-product-overlay`** — Product card variants
- **`card-collection`**, **`card-article`**, **`card-promotion`**, **`card-image`** — Other card types
- **`price`** — Standardized price markup (handles compare_at, ranges, sale state)
- **`predictive-search`**, **`pagination`**, **`facets`**, **`facets-active`**, **`facets-drawer`**, **`facet-short`**
- **`product-media-gallery`**, **`product-thumbnail`**, **`product-variant-picker`**, **`product-variant-options`**, **`product-information-blocks`**, **`product-pickup-availability`**, **`product-badges`**
- **`buy-buttons`**, **`quantity-input`**, **`gift-card-recipient-form`**, **`gift-wrapping`**
- **`mega-menu`**, **`desktop-menu`**, **`menu-drawer`**, **`menu-drawer-details`**, **`mega-custom-card`**
- **`pcard-color-swatch`**, **`swatch`**, **`swatch-input`**, **`product-grid-metro-style`**
- **`testimonial-1`**, **`testimonial-2`**, **`lookbook-card`**, **`collection-item-slider`**
- **`country-selector`**, **`language-selector`**, **`localization-form`**
- **`back-to-top`**, **`page-transition`**, **`loading-spinner`**, **`free-shipping-goal`**
- **`icon-*`** — ~30 SVG icon snippets (close, arrow, caret, cart, search, account, hamburger, social media icons, etc.)

### Translation Approach

Translation keys are used **consistently** across schema labels — every label and option in the schema uses `t:sections.all.*` or `t:sections.{section}.*`. There are 50 locale files under `locales/` (with `.schema.json` siblings for editor strings). When adding new sections:
- Schema labels must use `t:` keys, even if you only add to `en.default.schema.json`.
- Storefront-facing strings should use `{{ '...' | t }}` calls.

There's a `general.cart.*`, `products.product.*`, `sections.cart.*`, and similar key namespacing in the locale files. Re-use existing keys where possible.

### Block Patterns

Two block conventions appear:
- **Single-type blocks** — `multicolumn` has one block type `column`. Each block carries the column's content (image, heading, text, button).
- **Multi-type blocks for rich-text composition** — `rich-text` defines block types `subheading`, `heading`, `text`, `button`. The section iterates with `{% case block.type %}`. This pattern is reused in `image-with-text` and similar layout sections, letting clients reorder content blocks freely.

`block.shopify_attributes` is always emitted on the rendered block element so Shopify's editor can highlight/click into them.

## Schema Conventions

### Common Settings

See "Standard Schema Settings" above (color_scheme + heading family + padding + divider + custom_class). Beyond those, frequent additions:

- **`enable_slider`** + **`columns_desktop`** + **`columns_mobile`** + **`swipe_on_mobile`** for grids that can become carousels
- **`column_gap`** (select with `none` / `extra-small` / `small` / `medium` / `large` / `extra-large`) → mapped to `f-grid--gap-*`
- **`column_alignment`** / **`content_alignment`** — `left|center|right` → mapped to `text-{value}` classes
- **`design`** select with options `design-1`, `design-2`, ... — used for visual variants (e.g. newsletter form has two designs)
- **`button_style`** select with options `btn--primary`, `btn--secondary`, `btn--underline`, `btn--outline`, `btn--blank` — applied directly as CSS class

### Color Scheme Handling

Use Shopify's built-in `color_scheme` setting type. The selected scheme ID is applied as `class="color-{{ section.settings.color_scheme }}"` on the section root. CSS variables cascade automatically.

For sections with two color contexts (e.g. `image-with-text` has a section background AND an inner content area), the convention is two separate `color_scheme` settings: `section_color_scheme` (outer) and `color_scheme` (inner block). Use `color-inherit` class when both are equal so they don't double-apply backgrounds.

### Padding / Spacing Approach

- `padding_top` and `padding_bottom`: range 0–100, step 2, unit `px`, default `50`. **Always use these defaults** for consistency.
- The values are applied via `--section-padding-top` / `--section-padding-bottom` inline; `.section--padding` handles the responsive scaling.

### Preset Patterns

- 50 of 81 sections include presets — most content sections have at least one.
- Preset names use translation keys (`t:sections.{name}.presets.name`).
- Presets often include default block content (e.g. `multicolumn` preset spawns 4 `column` blocks).
- For sections that should appear in any template's editor, include at minimum: `"presets": [{ "name": "t:sections.{name}.presets.name" }]`.

## Visual Analysis

No reference images found in `.claude/context/reference/` (folder doesn't exist). `.claude/context/client-notes.md` is also blank — onboarding notes haven't been filled in yet. Once design files or screenshots are dropped into `.claude/context/reference/`, regenerate this section.

## Recommendations

- **Section padding** is the single biggest deviation from the bootcamp template. Always use `class="section--padding"` + inline `--section-padding-top` / `--section-padding-bottom` style. Do **not** generate `.section-{{ section.id }}-padding` blocks.
- **Use existing custom elements before writing new ones.** `<motion-element>` for reveals, `<modal-component>` / `<drawer-component>` / `<basic-modal>` for overlays, `<accordion-details>` / `<accordion-group>` for expandable content, `FoxTheme.Carousel` (Swiper wrapper) for sliders, `<tabs-component>` + `<tab-selector>` for tabs. Reimplementing any of these is wasted effort.
- **Use `FoxTheme.pubsub`** for cross-component events (cart updates, variant changes, facet updates). Don't dispatch ad-hoc `CustomEvent`s on `document` — they won't be picked up by existing components.
- **Color usage:** Always wrap with `rgb(var(--color-X))` or `rgba(var(--color-X), alpha)`. The variables hold comma-separated R,G,B triplets, not full color values. `color: var(--color-foreground)` will silently produce invalid CSS.
- **Root rem:** `1rem = 10px`. When converting designs, divide pixel values by 10 for `rem` (or use `0.1` multiplier). Existing snippets do this with `| divided_by: 10.0`.
- **Breakpoint inconsistency:** Component CSS mixes 750/1024/1200 with the Tailwind-style 640/768/1024/1280/1536. New code should align with `768 / 1024 / 1280 / 1536` to match utility classes.
- **Locale schema files:** When adding settings with new translation keys, also update `en.default.schema.json` (and ideally other `.schema.json` siblings) — `t:` keys that don't resolve will appear as literal strings in the editor.
- **`window.FoxTheme.settings.themeName === 'Sleek'`** — Some scripts may branch on this. Don't change it unless you know what depends on it.
- **`[data-initializing]`** is set on `<body>` from layout. If you add startup logic, look at `theme.js` for the pattern that removes it once theme is ready.
- **Custom metafield code injection points:** `theme.liquid` renders `shop.metafields.foxtheme.code_head.value` and `shop.metafields.foxtheme.code_body.value` for client GTM/tracking. Check the Shop Metafields admin before adding head/body scripts inline.
- **Footer/header/overlay groups:** Sections live in three group files (`header-group.json`, `footer-group.json`, `overlay-group.json`). New sections that should appear in those regions need to be added to the group's `order` and `sections` map. Most content sections use `disabled_on: { groups: ["footer", "header", "custom.overlay"] }` to opt out.
- **Design mode flag:** `document.documentElement.classList.add('shopify-design-mode')` is added when `Shopify.designMode` is true. Use `body.shopify-design-mode` for editor-only adjustments (e.g. disabling auto-play in carousels).
