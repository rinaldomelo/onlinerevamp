# Feature: new-hero

## Brief

Build a **new** Shopify section called `new-hero` that can be dropped onto the homepage (and any other template) via the theme customizer. This is **additive** — it does **not** replace the existing `slideshow` section that's already on the homepage. Both sections must coexist; the merchant chooses which to use.

**Design reference:** `.claude/features/feature-new-hero/reference/Online Revamp - Hero (standalone).html` — a self-contained "bundler" HTML file that unpacks fonts, images, and a template at runtime in the browser. Open it locally to see the rendered design. From the SVG fallback embedded in the file head, I can see the design uses:
- Dark background (`#0e0e0e`)
- A purple circular accent (`rgb(140, 69, 255)`)
- Large white "ONLINE REVAMP" wordmark with significant letter-spacing
- Custom fonts (woff2 packaged inside the bundle)

The full visual treatment, layout, animation, and interactive behavior need to be examined during scoping by opening the reference file.

## Context the feature needs to fit into

- The site shell is now dark mode (header, footer, every homepage section uses `scheme-inverse`). The new hero will sit on a dark page by default — palette aligns naturally.
- Theme conventions documented in `.claude/context/OUTPUT-initial-theme-analysis.md` apply: section padding via shared `.section--padding` class + inline CSS vars, `rgb(var(--color-X))` for colors, `window.FoxTheme` global namespace, web components for any interactivity, `scheme-inverse` already exists if we want to inherit colors via the color_scheme system.
- Section file pattern: `sections/section-new-hero.liquid` + `assets/section-new-hero.css` + (if interactive) `assets/new-hero.js` as a custom element.
- Section must be available everywhere (preset with no required blocks, `disabled_on: { groups: [footer, header, custom.overlay] }`).

## Constraints / non-negotiables

- **Additive** — keep the existing slideshow section as-is.
- **Schema-driven content** — every piece of merchant-facing text/image/link must be a schema setting or translation key. No hardcoded strings in the final version.
- **No new JS frameworks or CDN libraries.** If interactivity is needed, build a custom element under `assets/`.
- **Don't modify base theme JS** (`global.js`, `theme.js`).
- **Dark-mode-friendly** — color values pulled from the active color_scheme where possible, not hardcoded. Use `scheme-inverse` semantics.

## Open questions for `/scope-feature` to resolve

(Just hints — the skill will read the reference HTML and ask properly.)

1. Hero layout: full-bleed vs. constrained, image-led vs. text-led, single CTA vs. multiple, video vs. static, etc.
2. Animations / motion (fade-in, parallax, scroll-driven). Reuse `motion-element` / `parallax` custom elements already in the theme?
3. Custom fonts in the bundle — does the brand actually need those, or do we use the theme's existing fonts?
4. The purple accent (`#8C45FF`) — is that a brand color we'll reference theme-wide, or local to this hero?
5. Schema: which fields are merchant-editable (heading, subheading, image, CTAs)? Which are design-locked?
6. Mobile: is the desktop design responsive-down, or are there separate mobile-specific assets?

---

## Scoping Questions

Generated: 2026-04-25
Chosen approach: **A — Custom Shopify section with `feature_card` blocks** (`sections/section-new-hero.liquid` + `assets/section-new-hero.css`, no JS beyond reusing `<motion-element>` for reveal animations).

---

### Q1: Block model for the cards — fixed minimum, or fully flexible?

The reference design shows exactly 2 cards in a 2-up grid. Block-based schemas can either lock the count or let it scale.

- [x] a) **Fixed at 2 cards.** Schema sets `min_blocks: 2`, `max_blocks: 2`. Layout is always 2-up. Removes risk of "what if they add 5?" rendering.
- [ ] b) **Flexible 1–4.** Allow 1 to 4 cards. Layout: 1 = full-width, 2 = 2-up (current design), 3 = 3-up, 4 = 2x2. Adds complexity to the CSS grid (responsive logic for each count).
- [ ] c) **Flexible 1–N, but only the 2-up layout is supported.** Allow any count, always render in a 2-col grid (rows wrap). Simpler than (b) but odd-count → orphan card on last row.

**My recommendation:** (a) — match the design exactly, ship faster, expand to (b) only if a real need surfaces.

**Notes:**

---

### Q2: The partner badge — keep, generalize, or drop?

The design has a "SHOPIFY PLUS PARTNER" badge in the top-right of the hero (white card, lock icon, 3-line uppercase text). This reads as a credibility marker for an agency.

- [x] a) **Keep, schema-driven.** Settings: enable_badge (checkbox), badge_icon (image_picker or icon select), badge_text (multiline text or richtext). Merchant can show/hide and edit.
- [ ] b) **Drop it.** Don't include the badge at all — it's specific to the reference and doesn't apply to this brand.
- [ ] c) **Keep, but as a repeatable block type** (e.g. `badge` block, max 1) so the merchant can choose to add it via the editor instead of a section setting.

**My recommendation:** (a) if the brand wants a credibility marker; (b) if not. Pick based on intent — is this site for an agency or a different kind of business?

**Notes:**

---

### Q3: Card image — image picker or design-locked gradient art?

The reference cards use **gradient + embedded SVG art** as the card image (warm orange/brown for card 1, sky/ground gradient with telephone-pole silhouettes for card 2). It's design-locked, not a real photo.

- [x] a) **Merchant uploads a real image** (`image_picker` setting per card). Image fills the card image area. Most flexible, fits typical e-commerce hero patterns. Lose the artsy gradient look unless the merchant specifically uploads gradient art.
- [ ] b) **Design-locked SVG/gradient** — hardcode the card visuals into the CSS. Merchant cannot change them. Preserves the design exactly but offers zero flexibility.
- [ ] c) **Hybrid: image_picker with a CSS fallback.** If no image uploaded, show the gradient/SVG art from the design. If uploaded, show the merchant's image.

**My recommendation:** (c) — preserves the look out of the box, and the merchant can override later. The fallback gradient lives in CSS, the override is a normal `image_picker`.

**Notes:**

---

### Q4: Purple accent (`#8C45FF`) — global brand color or section-local?

The CTA buttons + ticker + decorative dots in the design all use the same purple. The site already has `scheme-inverse` (black/white only, no accent). This purple is currently **not** in any color scheme.

- [x] a) **Section-local.** Hardcode `#8C45FF` in `assets/section-new-hero.css` as the button color for this section only. Other sections continue with their existing color schemes.
- [ ] b) **Add to `scheme-inverse`.** Modify the `primary_accent` (or `button`) role of `scheme-inverse` in `config/settings_data.json` to be purple. Affects every section using `scheme-inverse` (which is currently every homepage section). **Risk:** every existing button across the homepage will turn purple.
- [ ] c) **Define a new color scheme `scheme-dark-accent`** with the purple as the button color. Apply only to this hero section, leave other sections on `scheme-inverse`.
- [ ] d) **Section-level setting.** Add a `color_picker` for "Accent color" defaulting to `#8C45FF` so the merchant can change it later.

**My recommendation:** (a) for now (fastest, scoped, no cross-section regression), then promote to (c) or (d) if more sections need the accent later. Avoid (b) — too broad a change for one section's needs.

**Notes:**

---

### Q5: CTA button — match the theme's button system, or build a new style?

The design CTAs are pill-shaped, 52px tall, full-width inside the card, purple bg with white text, with a circular `+` icon at the right. The theme already has `.btn--primary`, `.btn--secondary`, `.btn--outline`, `.btn--underline`, `.btn--blank`, `.btn--lg` (height variant), `.btn--block` (full-width).

- [x] a) **Reuse theme buttons:** `.btn--primary .btn--lg .btn--block` + section-scoped CSS to swap the bg to purple (per Q4 decision) and add the circular plus icon. Stays in the theme's button system.
- [ ] b) **Add a new global button variant `.btn--accent`** in `assets/theme.css` (matches the design's class name). Reusable across the theme. **Cost:** modifies a base file (`theme.css`), which CLAUDE.md flags as risky.
- [ ] c) **Section-local class only:** `.new-hero__cta` defined in `section-new-hero.css`, not part of the global button system. Cleanest scope, but doesn't extend the theme's vocabulary.

**My recommendation:** (a) — reuse the existing classes, override the color in section CSS. Keeps the global button system unchanged. The circular `+` icon can come from one of the theme's existing icon snippets (or a small inline SVG in the section).

**Notes:**

---

### Q6: Animations — reveal on scroll, none, or more elaborate?

The reference is static — no animations. The theme has `<motion-element data-motion="fade-up" data-motion-delay="N">` for staggered reveal-on-scroll, used by every other section.

- [x] a) **Match theme convention** — wrap headline, lead, badge, and each card in `<motion-element>` with staggered delays (50ms increments). Consistent with the rest of the site.
- [ ] b) **No animations** — match the reference exactly.
- [ ] c) **Custom motion** — e.g. cards lift slightly on hover, image zooms slightly. Beyond the reference but adds polish.

**My recommendation:** (a) for consistency with the rest of the site. Hover micro-interactions (subtle lift on card, accent shift on button) can come along for the ride at near-zero cost — let me know if you want those too or want to stay flat.

**Notes:**

---

### Q7: Where does this section live — and does it replace anything on the homepage?

- [x] a) **Available everywhere** (preset, no template restriction, `disabled_on: { groups: [footer, header, custom.overlay] }`). Don't add it to the homepage automatically — let the merchant drop it in via the editor.
- [ ] b) **Same as (a) PLUS add it to `templates/index.json` as the new top-of-page hero**, pushing the existing `slideshow` further down (or removing slideshow from the homepage entirely — original section file stays in `sections/`).
- [ ] c) **Same as (a) PLUS replace the `slideshow` on the homepage** with this section. Slideshow file stays available for other templates.

**My recommendation:** (a) for the build itself — keep the section deployable but unobtrusive. Then we make a separate decision in a follow-up about whether to swap the homepage hero. Earlier you said "should not replace the original" — so (b) puts new-hero at top, slideshow below; (c) swaps slideshow out. Confirm intent.

**Notes:**

---

### Q8: Mobile behavior — collapse pattern

The reference's `@media (max-width:960px)` collapses `.hero-grid` to 1 column and makes `.partner-badge` static (not absolute). Theme's standard breakpoints are 768/1024/1280/1536.

- [x] a) **Collapse to 1-col below 768px** (`md`). Cards stack on tablets and phones. Standard theme behavior.
- [ ] b) **Collapse to 1-col below 1024px** (`lg`). Cards stay 2-up only on desktop. Closer to the reference's 960px breakpoint.

**My recommendation:** (a) — aligns with theme conventions. Tablet portrait (768–1024) gets to keep the 2-up layout, which generally reads well for cards this size.

**Notes:**

---

### Recommendations (proactive flags)

1. **`section-heading` snippet — should we use it?** The theme has `{% render 'section-heading', section_settings: section.settings %}` for standard subheading + heading + description + button blocks. The new-hero's headline + lead + badge layout doesn't match its expected structure (badge is positioned absolute, lead is positioned below the heading rather than as a description). I plan to **not** use `section-heading` here and write the markup directly. Flagging in case you want consistency.

2. **DM Sans is already loaded** by the theme (`type_body_font: dm_sans_n4`, `type_header_font: dm_sans_n5` in `settings_data.json`). The reference's font-faces decoded from the bundle are the same family. We don't need to add any new font assets.

3. **`section--padding` convention.** Per `OUTPUT-initial-theme-analysis.md`, this theme does **not** use the bootcamp's `.section-{{ section.id }}-padding` style block. I'll follow the theme's convention: shared `.section--padding` class + inline `--section-padding-top` / `--section-padding-bottom` variables. Default padding 50/50 (theme standard).

4. **Card image area** — the reference uses `aspect-ratio` only implicitly (cards have `min-height: 480px`, image fills remaining flex space). I'll keep that pattern but cap the image area with a `min-height: 210px` so on narrow viewports the image doesn't collapse to nothing.

5. **Accessibility:** Buttons in the reference are styled `<button>` elements but inside cards that also have headings. I'll render them as `<a>` tags (since they navigate). The eyebrow icon is decorative — I'll add `aria-hidden="true"` or render via `mask` so it doesn't pollute the SR tree. Card heading order: hero `<h1>` → card `<h3>` (skipping `<h2>`); flagging because if this section is NOT the first on the page, the `<h1>` may collide with another `<h1>`. I'll make the heading tag for the hero a schema setting (`heading_tag` select, default `h1`) so the merchant can demote it to `h2` if a different page has `<h1>` already.

6. **Out of scope (potential follow-up features):** the rest of the agency landing page (logo strip, Shopify Agency hero, testimonials, case studies grid, services, apps section, blog, CTA box) is **not** part of this feature. The reference HTML's CSS includes them but they're not rendered. If the brand wants those sections built, they should be separate features — happy to scope them next.

7. **Risk: pure-CSS gradient/SVG art for fallback** (Q3) bloats the section CSS file. Each card's fallback art is a base64 SVG data-URI in CSS. I'll inline them but keep them small (~1-2KB each). If this gets bigger, we move them into `assets/` as `.svg` files referenced by URL. Flagging so we don't accidentally ship a 50KB CSS file.

## Extended Brief

Generated: 2026-04-25

### Chosen Approach

**A — Custom Shopify section with `feature_card` blocks.** New `sections/section-new-hero.liquid` + `assets/section-new-hero.css`, no JS file. Block type `feature_card` locked to exactly 2 instances. Reuses the theme's existing `<motion-element>` for staggered reveal animations and the existing `.btn--primary .btn--lg .btn--block` button classes (with section-scoped color override).

### Requirements

- Hero shell: dark background, headline (`<h1>`-by-default, demotable), lead paragraph, optional partner badge floated top-right on desktop / static below the lead on mobile.
- Two feature cards in a 2-column grid below the hero shell. Each card: eyebrow icon + eyebrow text + h3 heading + body text + image + full-width CTA button.
- Block schema locked at exactly 2 (`min_blocks: 2`, `max_blocks: 2`).
- Reveal animations: headline → lead → badge → card 1 → card 2, staggered with 50ms delay increments via `<motion-element data-motion="fade-up">`.
- Schema-driven content — no hardcoded merchant-facing strings.

### Where It Lives

- New section `sections/section-new-hero.liquid`, paired CSS `assets/section-new-hero.css`.
- Available everywhere via preset (`disabled_on: { groups: [footer, header, custom.overlay] }`).
- Not auto-added to `templates/index.json` — merchant drops it in via the editor when ready. Existing `slideshow` section unchanged.

### Data Sources

- All content from section settings + block settings — no metafields, no Liquid lookups, no API.
- Card images: `image_picker` settings on each block (merchant uploads real images).
- Eyebrow icon: `image_picker` setting per block.

### User Interaction

- Static section. Buttons navigate to `block.settings.button_link`. No client-side state, no toggles, no popovers.
- Hover micro-interactions: card slight lift (`transform: translateY(-2px)` on hover); button bg shifts to a lighter purple.

### Customizer Settings

**Section-level (in the standard 22-setting order):**
1. `paragraph` — FoxEcom how-to link
2. `header` — General
3. `color_scheme` (default `scheme-inverse`)
4. `header` — Content
5. `inline_richtext` — `heading` (default: "We know Shopify. Your growth partner.")
6. `select` — `heading_size` (theme's standard size options, default `hd1`)
7. `select` — `heading_tag` (h1–h6, default `h1`)
8. `richtext` — `lead`
9. `header` — Badge
10. `checkbox` — `enable_badge` (default `true`)
11. `image_picker` — `badge_icon`
12. `text` — `badge_text` (multi-line, default "SHOPIFY PLUS PARTNER")
13. `header` — Section padding
14. `range` — `padding_top` (0–100, step 2, default 50)
15. `range` — `padding_bottom` (0–100, step 2, default 50)
16. `header` — Divider
17. `checkbox` — `show_section_divider` (default `false`)
18. `select` — `divider_width` (`fixed` / `full`, `visible_if` divider on)
19. `header` — Custom attribute
20. `text` — `custom_class`

**Block (`feature_card`, min 2 / max 2):**
1. `image_picker` — `eyebrow_icon`
2. `text` — `eyebrow_label` (e.g. "BUILDS & MIGRATIONS")
3. `inline_richtext` — `heading` (the h3)
4. `richtext` — `body`
5. `image_picker` — `image`
6. `text` — `button_label` (default "LEARN MORE")
7. `url` — `button_link`

### Decisions Made

| # | Decision | Reasoning |
|---|---|---|
| Approach | Custom section with blocks (A) | Matches theme conventions, schema-driven, room to grow |
| Q1 | Locked at exactly 2 cards | Match the design, ship faster, expand later if needed |
| Q2 | Keep partner badge, schema-driven | Allows merchant to swap text/icon or hide entirely |
| Q3 | Merchant-uploaded images, no CSS gradient fallback | Most flexible; standard e-commerce hero pattern; avoids CSS bloat |
| Q4 | Hardcode `#8C45FF` purple in section CSS | Fastest, scoped, no cross-section regression |
| Q5 | Reuse `.btn--primary .btn--lg .btn--block`, override bg in section CSS | Keep theme button system intact |
| Q6 | Standard `<motion-element>` reveals + light hover micro-interactions | Consistent with rest of site |
| Q7 | Available via preset only, not auto-placed on homepage | Reversible deploy; merchant places it deliberately |
| Q8 | Collapse to 1-col below 768px | Aligns with theme's `md` breakpoint |

### Edge Cases to Handle

- **Missing image** on a block: render a CSS-only neutral placeholder (subtle grey gradient). Don't break layout.
- **Missing `button_link`** on a block: render the button as `aria-disabled="true"` and remove `href` (theme's existing pattern in `rich-text` and `image-with-text`).
- **Missing `badge_icon`** when `enable_badge` is true: hide the icon container, keep the text.
- **Empty heading or lead**: skip rendering that element, don't leave empty tags.
- **Translation:** all schema labels use `t:` keys; storefront defaults reuse existing theme keys where possible. New keys added to `locales/en.default.schema.json`.
- **RTL:** the `+` icon in the button flips via existing CSS pattern.
- **Heading collision:** if dropped on a page with an existing `<h1>`, merchant can demote via `heading_tag` setting.

### Out of Scope

- Logo strip, Shopify Agency hero, testimonials, case studies, services, apps, blog, CTA box (the rest of the reference HTML's CSS — those sections aren't rendered in the body and are explicitly not part of this feature).
- Replacing the existing `slideshow` section on `templates/index.json`.
- A user-toggleable theme accent color or new global color scheme.
- JS interactivity beyond `<motion-element>` reveals + CSS hover.
- Promoting `#8C45FF` to a global brand color or scheme role.

### Dependencies

- `<motion-element>` (already in `theme.js`) — reveal animations.
- `.section--padding`, `.page-width` (existing CSS) — wrapper.
- `.btn`, `.btn--primary`, `.btn--lg`, `.btn--block` (existing) — buttons.
- `scheme-inverse` (already configured) — color scheme.
- DM Sans font (already loaded by theme) — typography.
- No new third-party libraries, no JS file.

### Notes

- Hover micro-interactions (card lift, button color shift) included for free.
- The existing slideshow stays untouched. Both sections coexist; merchant chooses.
- The feature branch was cut from up-to-date `main` (which has dark-mode merged), so local preview matches production styling.

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# feature.md — v1.0

# AI Shopify Developer Bootcamp

# by Coding with Jan

# https://codingwithjan.com

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
