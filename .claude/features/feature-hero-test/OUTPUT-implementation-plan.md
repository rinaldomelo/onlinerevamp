# Architect — feature-hero-test

> **Run:** 2026-04-28, M14 hero demo (sub-agent surrogate for `runArchitect`).
> **Outcome:** Plan + Design emitted; **L2 escalated to L4** as an `analysis` PlanTask.
> **Schema validation:** ✓ Passes `ArchitectOutputSchema.parse()`.

---

## Implementation status (2026-04-28, branch `feature/hero-pause-on-hover`)

The architect's `recommendedFollowupPlanShape` was implemented as-is on `feature/hero-pause-on-hover`. Three of the four tasks are complete; the fourth (validation + QA) is awaiting human testing.

| Task | Status | What shipped |
|---|---|---|
| **T1** liquid-change | ✅ Done | `sections/slideshow.liquid` — added `pause_on_hover` checkbox to `{% schema %}` directly above `autoplay_delay` (default true, `visible_if` autoplay). Added `data-pause-on-hover="{{ section.settings.pause_on_hover }}"` attribute on `<slideshow-component>`, gated on `autoplay > 0` (sits next to `data-autoplay`). |
| **T2** config-change | ✅ Done | `locales/en.default.schema.json` — added `pause_on_hover: "Pause auto-rotate on hover or focus"` under `sections.all.carousel` namespace at line 1304, alongside the existing `autoplay`/`autoplay_delay`/`show_dots` keys. |
| **T3** assets-change | ✅ Done | `assets/slideshow-component.js` — extended `initSlider()`: when `dataset.pauseOnHover === 'true'`, sets `sliderOptions.autoplay.pauseOnMouseEnter = true` (Swiper's native handler). Added `bindAutoplayFocusListeners()` invoked post-init: `focusin` calls `slider.autoplay.pause()`, `focusout` resumes only when focus actually leaves the component (`!this.contains(event.relatedTarget)`). Listener refs tracked on the instance; new `disconnectedCallback()` removes them on teardown. **No changes to Swiper internals or to `disableOnInteraction: false`** (preserved). |
| **T4** validation | ⏳ Pending | Theme-check ran clean for the edited files (no new errors). Manual QA checklist generated at `OUTPUT-qa-debugging.md` — hand off to user for the test matrix. |

**Latent bug status (architect's side-finding):** `assets/slideshow-component.js:138` (post-edit) still does NOT gate the autoplay branch on `FoxTheme.config.motionReduced`. Untouched in this feature per architect's recommendation — file as separate ticket.

**Schema diff highlights (`sections/slideshow.liquid`):**
```diff
   {
     "type": "checkbox",
     "id": "autoplay",
     "label": "t:sections.all.carousel.autoplay",
     "default": false
   },
+  {
+    "type": "checkbox",
+    "id": "pause_on_hover",
+    "label": "t:sections.all.carousel.pause_on_hover",
+    "default": true,
+    "visible_if": "{{ section.settings.autoplay }}"
+  },
   {
     "type": "range",
     "id": "autoplay_delay",
     ...
   }
```

**Markup diff highlights:**
```diff
     {% if autoplay > 0 %}
       data-autoplay="{{ autoplay }}"
+      data-pause-on-hover="{{ section.settings.pause_on_hover }}"
     {% endif %}
```

---

## Summary

Architect inspected `sections/slideshow.liquid` and `assets/slideshow-component.js` and found that the planner's L2 classification doesn't fit: pause-on-hover requires editing `assets/slideshow-component.js`, which is a base/shared asset (not a `section-*` prefixed asset). Per the architect's hard rule #6 ("Respect the level signature"), it emitted an **escalation** PlanTask rather than silently expanding the level signature.

The full L4 design is captured in `themeDecisions[]` (labeled DESIGN ONLY — not dispatched at L2) so the post-promotion plan can pick it up verbatim.

## Architect reasoning (verbatim)

> I read `sections/slideshow.liquid`, `assets/slideshow-component.js`, and `locales/en.default.schema.json`. Findings:
>
> - **`sections/slideshow.liquid` (lines 17-21):** autoplay delay is computed in Liquid and exposed as `data-autoplay` attribute on `<slideshow-component>`. Pause-on-hover has no Liquid surface today.
> - **`assets/slideshow-component.js` (lines 78-87):** Swiper Autoplay module is initialized with `{ delay, disableOnInteraction: false }`. `pauseOnMouseEnter` is NOT set; no `focusin`/`focusout` listeners exist for autoplay control.
> - **`assets/slideshow-component.js` (line 137):** `motionReduced` is read by `FoxTheme.config` but the autoplay branch does not gate on it. (Latent bug, out of scope for this feature — call out separately.)
> - **`locales/en.default.schema.json` (lines 1298-1304):** shared `t:sections.all.carousel.*` namespace exists with `autoplay`/`autoplay_delay`/`show_dots`; `pause_on_hover` key is NOT yet present in this namespace. Two unrelated `pause_on_hover` keys exist for `scrolling-text`/marquee at lines 3338 and 4124, but those are in different namespaces and use 'Pause scroll on hover' wording — not reusable.
>
> Pause-on-hover is enforced inside the Swiper autoplay engine. Liquid changes alone cannot wire (a) Swiper's `pauseOnMouseEnter` option, (b) `focusin`/`focusout` listeners that call `swiper.autoplay.pause() / .resume()`, or (c) the gating between the new `pause_on_hover` setting and the existing autoplay loop. CSS `:hover` / `:focus-within` cannot pause Swiper autoplay because slide change is JS-driven, not CSS-animated.
>
> **Escalation: L2 → L4.** L4 covers edits to base/shared assets (`assets/slideshow-component.js`). L3 only applies if the work were scoped to a new `section-*.js` file, which is not the case here.
>
> Design is fully specced (see `themeDecisions[]`) so the post-promotion plan picks it up verbatim. Single `analysis` PlanTask emitted; no `liquid` or `config` tasks dispatched at L2 (would surface a customizer toggle with no runtime effect, violating acceptance criteria 2-5 and 8).

## Plan + Design (Architect output)

```json
{
  "plan": {
    "planId": "plan-feature-hero-test-001",
    "featureRequestId": "feature-hero-test",
    "tasks": [
      {
        "id": "T1",
        "kind": "analysis",
        "targetAgent": "validation",
        "payload": {
          "skill": "inspect-theme",
          "escalation": {
            "reason": "Acceptance criteria cannot be satisfied at L2. The pause-on-hover behavior is enforced inside the Swiper autoplay engine, which is configured in assets/slideshow-component.js (a base shared asset, not a section-* scoped asset). Liquid changes to sections/slideshow.liquid alone cannot wire (a) Swiper's pauseOnMouseEnter option, (b) focusin/focusout listeners that call swiper.autoplay.pause() / .resume(), or (c) the gating between the new pause_on_hover setting and the existing autoplay loop. CSS :hover / :focus-within cannot pause Swiper autoplay because the slide change is JS-driven, not CSS-animated.",
            "currentLevel": "L2",
            "suggestedLevel": "L4",
            "suggestedLevelRationale": "L4 covers edits to base/shared assets (assets/slideshow-component.js). L3 would only apply if the work were scoped to a new section-*.js file, which is not the case here — slideshow-component.js is the shared web component used by sections/slideshow.liquid.",
            "writePathsRequired": [
              "sections/slideshow.liquid (add schema setting + data-pause-on-hover attribute)",
              "config/settings_schema.json or locales/en.default.schema.json (add t:sections.all.carousel.pause_on_hover.label)",
              "assets/slideshow-component.js (pass pauseOnMouseEnter to Swiper autoplay options + add focusin/focusout handlers gated by data-pause-on-hover)"
            ],
            "outOfBoundsForL2": ["assets/slideshow-component.js"]
          },
          "evidence": {
            "filesInspected": [
              "sections/slideshow.liquid",
              "assets/slideshow-component.js",
              "locales/en.default.schema.json"
            ],
            "findings": [
              "sections/slideshow.liquid lines 17-21: autoplay delay is computed in Liquid and exposed as data-autoplay attribute on <slideshow-component>. Pause-on-hover has no Liquid surface today.",
              "assets/slideshow-component.js lines 78-87: Swiper Autoplay module is initialized with { delay, disableOnInteraction: false }. pauseOnMouseEnter is NOT set; no focusin/focusout listeners exist for autoplay control.",
              "assets/slideshow-component.js line 137: motionReduced is read by FoxTheme.config but the autoplay branch does not gate on it. (Latent bug, out of scope for this feature.)",
              "locales/en.default.schema.json lines 1298-1304: shared t:sections.all.carousel.* namespace exists with autoplay/autoplay_delay/show_dots; pause_on_hover key is NOT yet present in this namespace."
            ]
          },
          "blockedTasksIfNotEscalated": [
            "Liquid-only schema addition would surface a customizer toggle that has no runtime effect — violates acceptance criteria 2, 3, 4, 5, 8."
          ],
          "recommendedFollowupPlanShape": {
            "afterPromotionToL4": [
              {
                "id": "T1",
                "kind": "liquid-change",
                "targetAgent": "liquid",
                "skill": "edit-liquid-section",
                "summary": "Add pause_on_hover checkbox setting to sections/slideshow.liquid {% schema %} (insert directly above autoplay_delay range), default true, visible_if section.settings.autoplay. Add data-pause-on-hover='{{ section.settings.pause_on_hover }}' attribute to <slideshow-component> alongside data-autoplay (gated on autoplay > 0)."
              },
              {
                "id": "T2",
                "kind": "config-change",
                "targetAgent": "config",
                "skill": "edit-config-json",
                "summary": "Add t:sections.all.carousel.pause_on_hover key to locales/en.default.schema.json (value: 'Pause auto-rotate on hover or focus') in the existing carousel namespace at line ~1298.",
                "dependsOn": ["T1"]
              },
              {
                "id": "T3",
                "kind": "assets-change",
                "targetAgent": "assets",
                "skill": "edit-assets",
                "summary": "In assets/slideshow-component.js initSlider(): when autoplayDelay > 0 and this.dataset.pauseOnHover === 'true', set sliderOptions.autoplay.pauseOnMouseEnter = true. After init, in connectedCallback, attach focusin/focusout listeners on `this` that call this.sliderInstance.slider.autoplay.pause() / .resume() (guarded with optional chaining). Track listeners on instance and remove in disconnectedCallback to prevent leaks.",
                "dependsOn": ["T1"]
              },
              {
                "id": "T4",
                "kind": "validation",
                "targetAgent": "validation",
                "skill": "run-validation",
                "summary": "Run shopify theme check + smoke test the home page slideshow with autoplay on, autoplay off, pause_on_hover on/off matrix, and prefers-reduced-motion.",
                "dependsOn": ["T1", "T2", "T3"]
              }
            ]
          }
        }
      }
    ]
  },
  "design": {
    "planId": "plan-feature-hero-test-001",
    "featureRequestId": "feature-hero-test",
    "themeDecisions": {
      "sections": [
        {
          "type": "modify",
          "file": "sections/slideshow.liquid",
          "schemaChanges": {
            "addSetting": {
              "type": "checkbox",
              "id": "pause_on_hover",
              "label": "t:sections.all.carousel.pause_on_hover",
              "default": true,
              "visible_if": "{{ section.settings.autoplay }}",
              "insertBefore": "autoplay_delay"
            },
            "note": "DESIGN ONLY — not emitted as a liquid PlanTask in this plan because the L2-level boundary is breached by the required JS work. Documented here so the post-escalation L4 plan can pick it up verbatim."
          },
          "markupChanges": {
            "addAttribute": "data-pause-on-hover='{{ section.settings.pause_on_hover }}' on <slideshow-component>, only when autoplay > 0 (alongside the existing data-autoplay attribute at line 35-37).",
            "note": "DESIGN ONLY — see schemaChanges.note."
          }
        }
      ],
      "configChanges": [
        {
          "file": "locales/en.default.schema.json",
          "changeDescription": "DESIGN ONLY — Add 'pause_on_hover' (string: 'Pause auto-rotate on hover or focus') under sections.all.carousel namespace (line ~1298, alongside autoplay/autoplay_delay/show_dots). Reuse this key across any future hero/carousel sections."
        }
      ],
      "assetsChanges": [
        {
          "file": "assets/slideshow-component.js",
          "changeDescription": "OUT OF L2 BOUNDS — DESIGN ONLY. Required for acceptance: (1) Inside initSlider() autoplay branch (lines 78-87), when this.dataset.pauseOnHover === 'true', extend sliderOptions.autoplay with pauseOnMouseEnter: true. Keep disableOnInteraction: false so resume works after the pointer leaves. (2) After this.sliderInstance.init(), if data-pause-on-hover, bind two listeners on `this`: focusin → swiper.autoplay.pause(); focusout → if !this.contains(e.relatedTarget) swiper.autoplay.resume(). Store bound refs on the instance so disconnectedCallback can remove them. (3) Optional but recommended: add an early return in the autoplay branch when FoxTheme.config.motionReduced is true (closes a latent bug — but flag separately, do not bundle into this feature). This file is a base/shared asset and edits here promote the work to L4."
        }
      ]
    },
    "escalation": {
      "from": "L2",
      "to": "L4",
      "summary": "Hover-pause + focus-pause cannot be implemented without editing assets/slideshow-component.js (base/shared asset). Architect declines to emit liquid/config tasks at L2 because they would ship a customizer toggle with no runtime effect, violating acceptance criteria 2-5 and 8. Recommend Planner re-classify to L4 and re-dispatch with the followup plan shape attached to T1.payload.recommendedFollowupPlanShape."
    }
  }
}
```

## Notes

- **The architect did the right thing.** It read the live code (Swiper autoplay engine, FoxTheme.config), didn't trust the spec at face value, found a latent reduced-motion bug as a side benefit, and refused to silently expand the level boundary.
- **The escalation is the deliverable** for an L2-misclassified feature like this. The recommended L4 followup plan is fully specced — a re-triaged version of this feature can hit the ground running.
- **Latent bug surfaced** at line 137 of `assets/slideshow-component.js`: autoplay branch doesn't gate on `motionReduced`. Flagged as "out of scope for this feature" but worth its own ticket.
