---
kind: page
schema_version: 1
slug: "index"
template: "templates/index.json"
figma:
  - file_key: "pid87VYFva2zFBOXTChMVR"
    node_id: "2:653"
    label: "Home Page (Desktop)"
    viewport: "desktop"
    thumbnail: null
    last_synced_at: "2026-04-28"
  - file_key: "pid87VYFva2zFBOXTChMVR"
    node_id: "90:664"
    label: "Home Page (Mobile)"
    viewport: "mobile"
    thumbnail: null
    last_synced_at: "2026-04-28"
sections:
  - slideshow
  - product-tabs
  - highlight-text-with-image
  - collection-list
  - products-bundle
  - multicolumn
  - card-images
  - feature-list
  - rich-text
  - custom-content
  - image-with-text
  - products-showcase
  - scrolling-promotion
  - featured-products-tab
  - testimonials
  - collapsible-tabs
  - rich-text
  - custom-content
missing_section_specs:
  - highlight-text-with-image
  - products-bundle
  - card-images
  - feature-list
  - rich-text
  - custom-content
  - image-with-text
  - products-showcase
  - scrolling-promotion
  - featured-products-tab
  - testimonials
  - collapsible-tabs
last_curated: 2026-04-28
---

# Page — Home (templates/index.json)

## Purpose

The Home page is the brand's primary entry point — it introduces Rhythm Rocks, routes visitors into top-level shopping surfaces (rings, jewelry, diamonds, education), and surfaces social proof. The current Sleek default stack covers hero, featured products, collection routing, brand story, multi-column features, and trust/proof. The Rhythm Rocks Figma design (2:653 desktop, 90:664 mobile) refines this stack visually; sections it doesn't replace fall back to Sleek defaults per project policy.

## Section stack (UX-level)

The 18 entries below mirror `templates/index.json`'s `order[]` exactly. `rich-text` and `custom-content` each appear twice (same section type, different content slots).

1. **slideshow** — Hero carousel; full-bleed primary brand mood + top CTA(s). LCP-critical.
2. **product-tabs** — Featured products grouped by tab (e.g. Best Sellers / New / Trending).
3. **highlight-text-with-image** — Editorial brand-story block; pairs heading + paragraph with a supporting image.
4. **collection-list** — Top-level collection routing (Engagement, Wedding, Diamonds, Jewelry, Education).
5. **products-bundle** — Bundle / cross-sell offer block.
6. **multicolumn** — Three-or-four-up feature/value props (e.g. "Lifetime Trade-Up", "Free Resizing").
7. **card-images** — Image card grid; visual category routing alternative to `collection-list`.
8. **feature-list** — Vertical list of USPs / brand pillars.
9. **rich-text** *(first instance)* — Long-form copy block; brand voice / mid-page narrative.
10. **custom-content** *(first instance)* — Mixed-media custom block (theme-flexible).
11. **image-with-text** — 50/50 editorial duo with directional alternation.
12. **products-showcase** — Curated product showcase (e.g. seasonal, signature collection).
13. **scrolling-promotion** — Marquee / scrolling promo banner (e.g. "Free shipping over $X • Lifetime warranty • …").
14. **featured-products-tab** — Featured products with category tabs (variant of `product-tabs` lower in the page).
15. **testimonials** — Social proof / customer reviews.
16. **collapsible-tabs** — FAQ / collapsible content for trust-building.
17. **rich-text** *(second instance)* — Closing copy block before the final custom slot.
18. **custom-content** *(second instance)* — Closing flexible content slot.

## Responsive notes

- **Desktop (1440 × 11285)** — full-bleed slideshow, multi-column blocks (`multicolumn`, `card-images`, `feature-list`, `image-with-text`) render in their native column counts. Section spacing follows Sleek's `.section--padding` convention.
- **Mobile (390 × 13037)** — multi-column blocks stack to single column; slideshow uses `content-position-mobile` overrides; mega menu collapses into the burger drawer (header is a section group, not part of this stack). Mobile is ~15% taller than desktop because of single-column reflow.
- Viewport-specific overrides where Figma diverges from Sleek defaults are captured per-section in their respective section specs.

## UX notes

- **LCP target:** `slideshow` (above-the-fold hero). First slide's image must lazy-load false / `eager`.
- **Conversion priorities:** primary CTA in `slideshow`; collection routing in `collection-list` and `card-images`; cross-sell in `products-bundle` and `products-showcase`.
- **Trust path:** `multicolumn` (USPs) → `feature-list` (brand pillars) → `testimonials` → `collapsible-tabs` (FAQ).
- **Mega menu** lives in `sections/header.liquid` (section group), not in this stack. The 5 mega-menu Figma states (`98:3196`, `98:3568`, `98:3351`, `98:3635`, `98:3442`) are linked from the Home page nav but specced under the `header` section.
- **Open question:** the current Sleek `order[]` is opinionated (18 sections). The Rhythm Rocks Figma may want fewer/different sections. The diff between Figma intent and `order[]` becomes specific feature work after section specs are written.
