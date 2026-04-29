# Hero — pause autoplay on hover

## Brief

Add a `pause_on_hover` setting to the Slideshow section (the home page hero carousel). When enabled (which should be the default), auto-advance pauses while the user's pointer is over the carousel or while focus is inside it, and resumes when they move away. The intent is small-but-real: the live slideshow already supports `autoplay` + `autoplay_delay`, but it advances even while a user is reading a slide's CTA, which feels twitchy. This setting gives merchants the option to slow down the experience for engaged visitors.

The setting belongs at the section level (not per-slide), and should be exposed in the customizer above `autoplay_delay` so it's discoverable next to the other autoplay controls. Default value: `true` — most clients will want this on, but a few promo-heavy stores prefer the constant rotation.

Targets the home page (`templates/index.json`); slideshow can also be added to other templates via the customizer, so the behavior must work wherever the section is dropped, not just on home.

This feature is the first end-to-end test of the M14 spec-aware planner+architect flow. It was deliberately picked to be an L1–L2 level change (no new files, just a schema setting + a small JS handler addition) so the demo focuses on context flow rather than architectural complexity.

## Scoping Questions

[Skipped for the M14 demo — this brief was designed to be tight enough that the planner can triage it directly without a scoping round. In production usage, `/scope-feature` would run first.]

## Extended Brief

[Skipped — see note above.]
