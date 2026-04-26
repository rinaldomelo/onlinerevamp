# QA: new-hero

Feature spec: `.claude/features/feature-new-hero/feature.md`
Implementation plan: `.claude/features/feature-new-hero/OUTPUT-implementation-plan.md`

## How to Use This File

1. Run through the checklist after implementation — check items that pass, add notes on items that fail
2. Tell AI to read this file — it will fix the issues and reset the checklist for another round
3. Repeat until everything passes
4. Previous rounds are kept as a log below the current round

## Current Round (Round 1)

Status: Testing

### Customizer behavior
- [ ] `New hero` appears in the customizer's "Add section" panel (under any homepage / page / collection / product template)
- [ ] Adding the section spawns the default preset with 2 feature cards pre-filled
- [ ] Section can be removed via the customizer
- [ ] Each block (`Feature card`) is selectable in the editor and shows the click-into-block highlight
- [ ] All section settings labels render in English (no raw `t:sections.new-hero.*` strings visible)
- [ ] All block settings labels render in English
- [ ] Editing the section heading updates the page in the preview
- [ ] Editing the lead richtext updates the page
- [ ] Toggling `Enable badge` shows/hides the partner badge
- [ ] Editing `Badge text` (multi-line) renders with line breaks
- [ ] Uploading a `Badge icon` image shows in the badge
- [ ] Clearing the `Badge icon` while badge is enabled keeps the text but hides the icon container
- [ ] Editing each block's `Eyebrow label`, `Heading`, `Body`, `Button label`, `Button link` updates the card
- [ ] Uploading a card image shows in the card image area
- [ ] Removing a card image shows the CSS-only placeholder, no broken image
- [ ] `Heading tag` setting changes the rendered HTML tag (h1 → h6) — verify by inspecting

### Visual fidelity (desktop, ≥1024px)
- [ ] Section background is dark (matches `scheme-inverse`)
- [ ] Headline is large, white, max-width ~760px, left-aligned
- [ ] Lead paragraph is dim/muted white, max-width ~520px
- [ ] Partner badge is white, sits absolute-positioned in the top-right of the intro area
- [ ] Lock icon container in the badge has black background with white icon
- [ ] Badge text is uppercase, small, letter-spaced
- [ ] Two cards render side-by-side in a 2-column grid with ~24px gap
- [ ] Each card has rounded corners (~14px), subtle elevated background, ~32px padding
- [ ] Eyebrow row shows icon + uppercase letter-spaced label
- [ ] Card heading is h3-sized, bright white
- [ ] Card body is dim/muted white
- [ ] Card image area fills remaining card height with object-fit cover
- [ ] CTA button is full-width within the card, pill-shaped, purple bg (`#8C45FF`), white text
- [ ] CTA button has a circular `+` icon at the right
- [ ] Section padding values from settings are respected (top/bottom)
- [ ] Section divider renders at top when enabled

### Responsive (tablet ~768–1023px and mobile <768px)
- [ ] At ≥768px the 2-up grid still shows side-by-side
- [ ] Below 768px the grid collapses to 1 column
- [ ] Below 768px the partner badge stops being absolute and renders below the lead
- [ ] No horizontal scrolling at 320px width
- [ ] Card padding reduces appropriately on mobile
- [ ] Heading scales down comfortably on mobile (no overflow)

### Edge cases
- [ ] Empty `heading` setting → heading element is omitted (not an empty tag)
- [ ] Empty `lead` setting → lead paragraph is omitted
- [ ] `Enable badge` off → no badge rendered, no empty placeholder
- [ ] Badge enabled but `badge_text` blank → badge container handles gracefully (icon-only, or omits the badge)
- [ ] Card with no image → CSS-only neutral placeholder shown
- [ ] Card with no `button_link` → button has `aria-disabled="true"` and no `href`; clicking does nothing
- [ ] Card with no `eyebrow_icon` → label still renders, no broken icon
- [ ] Section with 0 blocks → grid container is hidden (no empty space artifact)
- [ ] Section with 1 block → renders full-width without breaking layout

### Animations & interactions
- [ ] Scrolling the section into view triggers fade-up reveals in order: heading → lead → badge → card 1 → card 2
- [ ] Reveal delays feel staggered (~50ms apart), not all-at-once
- [ ] With JS disabled, content remains visible (no permanently-hidden elements)
- [ ] Hovering a card lifts it ~2px smoothly
- [ ] Hovering a CTA button shifts the bg to a lighter purple
- [ ] No console errors when scrolling / hovering

### Accessibility
- [ ] CTA buttons are keyboard-focusable (Tab key)
- [ ] Focus ring is visible on focused buttons (theme's `focus-visible` style)
- [ ] Tab order follows visual order (heading area, then card 1, then card 2)
- [ ] `aria-disabled="true"` is set on buttons with empty `button_link`
- [ ] `aria-disabled` buttons are not clickable / cannot be activated by keyboard (Enter/Space)
- [ ] Decorative icons use `aria-hidden="true"` (the `+` plus icon, the eyebrow icon if purely decorative)
- [ ] Color contrast: button label vs. purple bg passes WCAG AA
- [ ] Color contrast: lead text vs. dark bg passes WCAG AA
- [ ] Heading hierarchy: hero `<h1>` (or chosen tag) → card `<h3>` is logical (no `<h2>` skipped if the hero is `h1`; flag if needed)

### Translations
- [ ] All section setting labels in customizer are human-readable English
- [ ] All block setting labels in customizer are human-readable English
- [ ] Preset name in "Add section" panel reads "New hero" (or whatever was localized)
- [ ] Block name reads "Feature card"

### Coexistence
- [ ] Adding `new-hero` to the homepage alongside the existing `slideshow` works
- [ ] Both sections render correctly without visual conflicts
- [ ] No JS or CSS class collisions

### Customizer-specific
- [ ] Clicking inside a block in the customizer shows the inspector with the right block settings
- [ ] Reordering blocks (only relevant if user adds 2 then has the option) works
- [ ] Deleting a block to go to 1 or 0 works without breaking the customizer (CSS handles the layout)

### Custom class & divider
- [ ] Setting a value in `Custom class` adds it to the section wrapper
- [ ] Toggling `Show section divider` renders the `divider` snippet at the top
- [ ] `Divider width` `fixed` vs. `full` changes the divider's container width

## Previous Rounds

(Empty on first generation. After each QA round, AI moves the completed round here with results preserved.)
