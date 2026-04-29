# Hero demo — Run Notes

> **Run:** 2026-04-28
> **Milestone:** M14 (Specs as Planner Input — resolver + demo)
> **Feature:** `feature-hero-test` — pause autoplay on hover for the Slideshow section
> **Outcome:** End-to-end planner→architect contract proven via in-conversation Agent sub-agents. Both outputs validate against M13's `PlannerOutputSchema` and `ArchitectOutputSchema`. Architect surfaced a level-mismatch escalation that exercises ADR-010's level-signature contract correctly.

## What ran

The orchestrator's `callPlannerModel` and `callArchitectModel` are still scaffolds that throw at runtime — wiring them is M15. M14 is about validating the *shape* of the spec-as-input flow before committing to the SDK runtime work.

So this run used **in-conversation Agent sub-agents** (the `general-purpose` subagent type) as model surrogates:

```
1. resolveProjectContext("feature-hero-test", title="Hero — pause autoplay on hover", targetPages=["index"])
   ↓ returns 9 paths (project, theme, theme-analysis, figma-analysis, pages/index.md, 4 section specs)

2. Planner sub-agent invoked with:
   - System prompt: planner/prompt.md (with {{LEVEL_TABLE}} substituted)
   - User message: FeatureRequest + context paths + "read what you need" instruction
   - Tool: Read (general-purpose has Read by default)
   ↓ emits TriagedFeatureRequest as fenced JSON
   ↓ schema-validated: ✓ status=ready, level=L2, 9 acceptance criteria, 2 references

3. Deterministic estimator re-derives teamDays:
   estimateTeamDays("L2", { variantCount: 1, copyDensity: "low", responsive: true })
   → 0.55 teamDays, confidence=high

4. Architect sub-agent invoked with:
   - System prompt: architect/prompt.md (with {{LEVEL_TABLE}} substituted)
   - User message: validated TriagedFeatureRequest + context paths + live-code-reading instructions
   - Tools: Read, Grep, Glob (sub-agent default)
   ↓ inspected sections/slideshow.liquid + assets/slideshow-component.js + locales/en.default.schema.json
   ↓ emits Plan + Design as fenced JSON
   ↓ schema-validated: ✓ 1 PlanTask (analysis/escalation), 1 section, 1 config, 1 assets entries
```

## What worked

- **Resolver surfaced the right specs.** The hero feature got `slideshow.md` (via title-alias `hero`→slideshow + via the page's frontmatter `sections[]`), `index.md` (via `targetPages: ["index"]`), and the 4 top-level singletons. Section spec count was 4 (capped at 5).
- **Planner stayed role-pure.** Never named files. Cited `slideshow.md` and `index.md` by spec path. Acceptance criteria all in "When X, Y" form.
- **Deterministic estimator preserved.** The model proposed factors as free-form strings (`variantCount=1`, `copyDensity=low`, `responsive`); the harness re-derived the number (0.55d).
- **Architect read live code, not just specs.** Inspected actual Swiper autoplay configuration and found the spec was incomplete (the spec said "Pauses on hover/focus" under Visual behavior but the live code doesn't actually wire that — `pauseOnMouseEnter` is unset). This is exactly the kind of gap a spec-grounded but code-aware architect should catch.
- **Level enforcement worked.** Architect didn't silently expand from L2 to L4. It emitted an `escalation` `analysis` PlanTask with the level mismatch + the full L4 followup plan shape, satisfying ADR-010's "respect the level signature" rule.
- **Latent bug surfaced as a side effect.** The architect noticed `motionReduced` isn't gating the autoplay branch in `slideshow-component.js` line 137. Out-of-scope for this feature but flagged.
- **Bridge contract preserved.** `git diff main -- orchestrator/src/types.ts` is empty.

## What's notable

- **The L2 misclassification was the planner's blind spot.** The planner only had access to specs (per ADR-011's by-reference design). The slideshow spec describes pause-on-hover as if it were already implemented (`"Pauses on hover/focus"`), so the planner reasonably assumed it just needed a customizer toggle to gate the existing behavior. The architect's live-code reading caught the gap. This is a *feature*: the planner's role is human-facing triage, the architect's role is code-grounded mapping. The escalation hand-off is exactly the contract M13 designed for.
- **Spec drift signal.** `slideshow.md`'s `## Visual behavior` line "Pauses on hover/focus" is aspirational, not factual. A future `/validate-specs` skill could compare against the live JS and flag it. M14 doesn't ship that skill — it's its own milestone.
- **Held-state was considered but rejected.** No contradictions, all inputs present. Correct call.

## Schema validation receipts

```
$ npx tsx validate-hero-planner.mjs
✓ Planner output validates against PlannerOutputSchema
  status: ready
  level: L2
  acceptance criteria: 9
  references: 2
  Re-derived estimate: 0.55 teamDays, high confidence
  factors: ['baseline L2=0.5d', 'responsive ×1.1']

$ npx tsx validate-hero-architect.mjs
✓ Architect output validates against ArchitectOutputSchema
  plan tasks: 1
  task[0].kind: analysis  targetAgent: validation
  design.sections: 1, configChanges: 1, assetsChanges: 1
```

## Caveats

- **Sub-agent surrogate ≠ runtime.** This run proves the contract holds and the prompts are well-formed, but a real pipeline run (M15) will use a different invocation path (Claude Agent SDK subprocess or raw Messages API) and may behave differently. Particularly: tool-use loops, multimodal image references, and structured-output enforcement all change shape between sub-agent and SDK.
- **One feature, one shot.** The estimator multiplier table, the planner's hold heuristic, and the architect's level-enforcement all need more runs against varied feature shapes to harden. Don't generalize from this single hero run to "M13 works."
- **No specialist dispatch.** The architect emitted only an `analysis` task (the escalation), so we never exercised `liquid` / `config` / `assets` specialists. Those scaffolds still throw at runtime per M13.
- **Architect's `targetAgent: "validation"` for the escalation** is debatable — escalations could route back to the planner or to a dedicated re-triage stage. Worth revisiting in M15.

## Follow-ups

- **M15 — Orchestrator runtime.** Wire `callPlannerModel`/`callArchitectModel` to a real model runtime. Open ADR-012 capturing SDK-subprocess vs. raw-Messages-API.
- **`motionReduced` gating in `slideshow-component.js`.** Open a tiny L1/L2 ticket to gate the autoplay branch on `FoxTheme.config.motionReduced` regardless of the pause-on-hover work.
- **Re-triage the hero feature at L4.** The L2 escalation is the architect's signal; the planner should re-dispatch with `level: "L4"` and the recommended followup plan baked in. After M15, this loop can run end-to-end.
- **`/validate-specs` skill.** Compare spec aspirations vs. live code. Surface drift like `slideshow.md`'s "Pauses on hover/focus" claim. Its own milestone.
- **Resolver heuristic tuning.** The resolver surfaced 4 section specs (`slideshow`, `product-tabs`, `collection-list`, `multicolumn`) when only `slideshow` was relevant — the page-frontmatter expansion is over-eager for a section-scoped feature. Acceptable for now (capped at 5) but candidate for a future refinement.

## Source artifacts

- Brief: `feature.md`
- Planner output: `OUTPUT-planner-triage.md`
- Architect output: `OUTPUT-implementation-plan.md`
- This file: `RUN-NOTES.md`
- Schema validators (transient — deleted after run): `orchestrator/validate-hero-{planner,architect}.mjs`
- Resolver source: `orchestrator/src/agents/shared/resolveProjectContext.ts`
- Decision record: `.claude/architecture/adr/ADR-011-spec-hierarchy-as-planner-input.md`
