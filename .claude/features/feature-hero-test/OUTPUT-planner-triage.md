# Planner Triage — feature-hero-test

> **Run:** 2026-04-28, M14 hero demo (sub-agent surrogate for `runPlanner`).
> **Outcome:** `status: "ready"`, level **L2**, 9 acceptance criteria.
> **Schema validation:** ✓ Passes `PlannerOutputSchema.parse()`.
> **Re-derived estimate (deterministic):** 0.55 teamDays (L2 baseline 0.5d × 1.1 responsive multiplier).

## Planner reasoning (verbatim)

> The slideshow spec confirms my read. The brief asks for a `pause_on_hover` toggle exposed in the customizer. The section spec already documents pause-on-hover/focus as the intended autoplay behavior — so the *behavior* is specced; the request is to make it merchant-controllable rather than always-on, with a `true` default.
>
> Two paths to consider:
>
> 1. **L1 — Customizer-only.** If the existing autoplay implementation already pauses on hover/focus unconditionally, this is purely a schema addition (new checkbox setting + locale strings) plus reading the setting somewhere it gates behavior. But schema settings need wiring to actually do something — a checkbox that doesn't gate anything is dead UI. The L1 table covers `templates/*.json`, `config/*.json`, `locales/*.json` — schema lives inside `sections/*.liquid`, which the table places at L2.
>
> 2. **L2 — Liquid edit, no new files.** The change touches the existing slideshow section's schema (add the checkbox above autoplay_delay, default true, with locale strings) and its autoplay wiring (gate the existing pause-on-hover/focus listeners on the new setting, or add them if not yet present). No new files, no new section, no base CSS/JS additions. This fits L2 cleanly per the table.
>
> The spec note "Pauses on hover/focus" is described under "Visual behavior" but is silent on whether it's currently implemented vs. aspirational — the parenthetical "verify during implementation" appears next to reduced-motion, not pause-on-hover. So the architect may need to verify and either gate existing listeners or add them. Both fall inside L2.
>
> Single section, single setting, no new variants, low copy density (one label + one help text in locales). Confidence: high. This is a textbook small-customizer-feature.
>
> Acceptance criteria are easy to make testable from user-visible behavior: hover pauses, leaving resumes, keyboard focus pauses, blur resumes, the setting is discoverable in the customizer above autoplay_delay, default-on, and the behavior works on any template the section is dropped into (per the brief's portability requirement).
>
> No contradictions found. No missing inputs. Ready.

## TriagedFeatureRequest output

```json
{
  "featureRequest": {
    "id": "feature-hero-test",
    "title": "Hero — pause autoplay on hover",
    "description": "Add a pause_on_hover setting to the Slideshow section (the home page hero carousel). When enabled (which should be the default), auto-advance pauses while the user's pointer is over the carousel or while focus is inside it, and resumes when they move away. The intent is small-but-real: the live slideshow already supports autoplay + autoplay_delay, but it advances even while a user is reading a slide's CTA, which feels twitchy. This setting gives merchants the option to slow down the experience for engaged visitors.\n\nThe setting belongs at the section level (not per-slide), and should be exposed in the customizer above autoplay_delay so it's discoverable next to the other autoplay controls. Default value: true — most clients will want this on, but a few promo-heavy stores prefer the constant rotation.\n\nTargets the home page (templates/index.json); slideshow can also be added to other templates via the customizer, so the behavior must work wherever the section is dropped, not just on home.",
    "source": "user",
    "priority": "medium",
    "context": { "targetPages": ["index"] }
  },
  "status": "ready",
  "level": "L2",
  "estimatedEffort": {
    "teamDays": 0.55,
    "confidence": "high",
    "factors": ["baseline L2=0.5d", "responsive ×1.1"]
  },
  "acceptanceCriteria": [
    "When a merchant opens the Slideshow section in the theme customizer, they see a 'Pause on hover' checkbox positioned above the autoplay delay control, defaulted to on.",
    "When the setting is enabled and a visitor moves their pointer over the carousel, auto-advance pauses for as long as the pointer remains over the carousel.",
    "When the setting is enabled and the visitor's pointer leaves the carousel, auto-advance resumes from the next interval.",
    "When the setting is enabled and keyboard focus enters any focusable element inside the carousel (slide CTA, pagination dot, prev/next control), auto-advance pauses.",
    "When focus leaves the carousel entirely, auto-advance resumes.",
    "When the setting is disabled, auto-advance continues uninterrupted regardless of pointer or focus position, matching the legacy always-rotating behavior.",
    "When the slideshow section is dropped into any template other than the home page via the customizer, the pause-on-hover behavior works identically there.",
    "When autoplay itself is turned off, the pause-on-hover setting has no visible effect (the carousel was not advancing in the first place).",
    "When a visitor has prefers-reduced-motion enabled, auto-advance remains disabled regardless of the pause-on-hover setting, preserving existing reduced-motion behavior."
  ],
  "references": [
    {
      "kind": "text",
      "path": ".claude/specs/sections/slideshow.md",
      "note": "Source of truth for slideshow behavior. Documents autoplay + autoplay_delay and states 'Pauses on hover/focus' under Visual behavior — the architect should verify whether this is already implemented in the live section or needs to be added, then gate it on the new setting."
    },
    {
      "kind": "text",
      "path": ".claude/specs/pages/index.md",
      "note": "Home page section stack — slideshow is the LCP-critical first section. Used to confirm the home target."
    }
  ]
}
```

## Notes

- **Spec context flowed in correctly.** The planner cited `slideshow.md` directly (twice — once at the spec excerpt level, once in `references[]`). Without the resolver's spec surfacing, the planner would have had to guess what the slideshow already does.
- **Held-state was considered and rejected** for the right reason: no contradictions, all inputs present, behavior is well-defined.
- **Estimate is deterministic.** The model proposed factors (`variantCount=1`, `copyDensity=low`, `responsive`); the harness re-derived `teamDays = 0.5 × 1.1 = 0.55` via `estimateTeamDays("L2", { variantCount: 1, copyDensity: "low", responsive: true })`. The model never computed a number itself.
- **L2 classification turned out to be wrong** — see `OUTPUT-implementation-plan.md` for the architect's escalation. This is a *feature*, not a failure: it's exactly what the held-state / escalation contract is for.
