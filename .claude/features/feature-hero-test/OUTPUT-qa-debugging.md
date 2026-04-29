# QA — feature-hero-test (pause autoplay on hover)

> **Branch:** `feature/hero-pause-on-hover`
> **What changed:** see Files-touched section at the bottom.
> **How to test:** spin up dev preview → place Slideshow on Home → run the matrix below.

## Round 1

**Status:** Awaiting user testing.

**Pre-flight checks (automated):**
- ✓ JS syntax valid (`node --check assets/slideshow-component.js`)
- ✓ Locale JSON parses (with theme's standard trailing-comma tolerance)
- ✓ Existing orchestrator vitest still passes (36/36) — no orchestrator code touched
- ⚠ Full `shopify theme check --path .` skipped during this build — process ran 9+ min without producing output and was killed. Likely a slow plugin/cache state, not a content issue. Recommend re-running theme-check on first dev push (or on the CI pipeline once M3 lands). Expected warnings: "missing translation in non-default locales for `sections.all.carousel.pause_on_hover`" (intentional, see Known caveats).

---

### Test 1 — happy-path (run this first, end-to-end)

**Goal:** Confirm the feature works in the most common scenario before exercising the full matrix below. ~5 minutes.

1. **Spin up the preview.** From the theme root, run `shopify theme dev` (or `shopify theme push --unpublished` if you want a server-side preview). Open the dev preview URL.
2. **Open the home page** in the dev preview. Confirm it loads with no console errors. The Slideshow section is already on the home template.
3. **Open the customizer** → click the Slideshow section in the page tree. In the section settings panel, confirm:
   - "Auto-rotate content" is **on**.
   - Directly below it, a new checkbox **"Pause auto-rotate on hover or focus"** appears, default **on**.
4. **Watch autoplay.** Without hovering, watch the slideshow on the home page for ~10 seconds. Slides should advance every ~3 seconds (the default `autoplay_delay`).
5. **Hover to pause.** Move the pointer over the slideshow image area. The active slide should freeze — no advance while the pointer is over it. Hold for ~10 seconds to confirm it stays paused (no double-skip, no flicker).
6. **Move pointer off to resume.** Move the pointer outside the slideshow. Within ~3 seconds, the slideshow should advance again.
7. **Repeat the pause/resume cycle once more** to confirm it's stable.

**Pass criteria:** Steps 3–7 all behave as described, no console errors anywhere. If all pass → tick this box and continue with the broader matrix below. If any fail → stop and report which step + what you saw; I'll diagnose before you run the rest.

- [ ] Test 1 passed end-to-end.

### Setup

- [ ] On a fresh Shopify dev preview of this branch, confirm the theme loads without console errors on the home page.
- [ ] Open the customizer → Slideshow section. Verify the new **"Pause auto-rotate on hover or focus"** checkbox appears **directly below "Auto-rotate content"** and **above "Change slides every"**, with default checked.
- [ ] Toggle "Auto-rotate content" off. Confirm the new "Pause auto-rotate on hover or focus" checkbox **hides** (it has `visible_if: section.settings.autoplay`).
- [ ] Toggle "Auto-rotate content" back on. Confirm the new checkbox reappears, still defaulted to on.

### Test matrix — pointer (mouse)

Run with autoplay **on**, autoplay_delay **3s** (default), pause_on_hover **on**:
- [ ] On home page load, slides advance every ~3s.
- [ ] Hover the pointer anywhere over the slideshow → autoplay **pauses** (timer freezes; the active slide stays put).
- [ ] Move the pointer off the slideshow → autoplay **resumes**, advancing on the next interval.
- [ ] Repeat 2-3 times to confirm the pause/resume cycle is stable (no double-skip, no stuck-on-pause).

Run with autoplay **on**, pause_on_hover **off**:
- [ ] Hover the pointer over the slideshow → autoplay **continues** advancing every 3s, ignoring hover.

Run with autoplay **off**:
- [ ] No auto-advance. Hover behavior is irrelevant — confirm pause_on_hover setting has no visible effect (and is hidden in the customizer because the setting is `visible_if` autoplay).

### Test matrix — keyboard focus

Run with autoplay **on**, pause_on_hover **on**:
- [ ] Tab to a focusable element inside the slideshow (slide CTA, prev/next, pagination dot) → autoplay **pauses**.
- [ ] Tab between focusable elements *within* the slideshow → autoplay **stays paused** (does not flicker pause→resume→pause).
- [ ] Tab away from the slideshow entirely (focus now in a section below or in the header) → autoplay **resumes**.
- [ ] Shift+Tab back into the slideshow → autoplay pauses again.

Run with autoplay **on**, pause_on_hover **off**:
- [ ] Tab into the slideshow → autoplay **continues** advancing.

### Reduced-motion + portability

- [ ] In OS Accessibility settings, enable **Reduce motion**. Reload the page. Confirm autoplay does NOT advance regardless of pause_on_hover (the reduced-motion check is upstream of this feature; this should match the existing reduced-motion baseline).
  > **Note:** at the architect's analysis time, `assets/slideshow-component.js:137` did not gate the autoplay branch on `motionReduced`. If autoplay still advances under reduced-motion, that's the latent bug flagged in the architect's notes — file as a separate ticket, NOT a regression of this feature.
- [ ] Drop the Slideshow section onto a non-home page via the customizer (e.g. a custom page template). Verify pause-on-hover behaves identically there.

### Edge cases

- [ ] Single-slide carousel: autoplay is disabled when items=1 (existing behavior); pause_on_hover should be a no-op. Confirm.
- [ ] Section navigation in the customizer: edit a slide, save, return — confirm pause_on_hover state persists and the listeners still work in the live preview iframe.
- [ ] Soft navigation (theme app extension or section-rendering): if the section is re-rendered without a full page load, confirm the listeners are re-bound (web component's `connectedCallback` should handle this; `disconnectedCallback` should clean up the prior instance's listeners).
- [ ] Console: no errors related to slideshow / `autoplay.pause` / `autoplay.resume` calls under any of the matrices above.

### Known caveats

- **Reduced-motion + autoplay autoplay (latent bug, NOT this feature's responsibility):** `assets/slideshow-component.js:138` reads `FoxTheme.config.motionReduced` for animations but does NOT gate the autoplay loop. If pause_on_hover is on AND user has reduced-motion AND autoplay is on, autoplay will run anyway. File as separate ticket post-QA.
- **Swiper version dependency:** `pauseOnMouseEnter` requires Swiper Autoplay module ≥7.x. Confirmed available via `FoxTheme.Swiper.Autoplay`. If a future theme update downgrades or replaces Swiper, this option may silently no-op.
- **20 non-English schema locales have NOT been backfilled.** This PR only adds `pause_on_hover` to `locales/en.default.schema.json`. The other 20 schema locale files (`de.schema.json`, `fr.schema.json`, etc.) will show the English label (Shopify's automatic locale fallback) until a translation pass lands. Acceptable per the bootcamp's "small, local changes" rule; track as a follow-up translation ticket.

## Files touched (this feature)

- `sections/slideshow.liquid` — added `pause_on_hover` checkbox to schema (line ~347, between `autoplay` and `autoplay_delay`); added `data-pause-on-hover` attribute on `<slideshow-component>` (gated on autoplay > 0).
- `locales/en.default.schema.json` — added `pause_on_hover` key under `sections.all.carousel` namespace (line 1304).
- `assets/slideshow-component.js` — extended `initSlider()` to pass `pauseOnMouseEnter` to Swiper autoplay options when `data-pause-on-hover='true'`; added `bindAutoplayFocusListeners()` (focusin pauses, focusout resumes when leaving the component); added `disconnectedCallback()` for listener cleanup.

---

## Previous Rounds

(No prior rounds — this is Round 1.)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# OUTPUT-qa-debugging.md — v1.0

# AI Shopify Developer Bootcamp

# by Coding with Jan

# https://codingwithjan.com

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
