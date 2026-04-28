# M14 — Specs as Planner Input

> **Status:** Stub. Ships after the `.claude/specs/` hierarchy has been used on at least one full feature end-to-end and proven its value as input context.
>
> **Owner:** Rinaldo.
>
> **Effort:** M (2-4 days).

## Why this milestone exists

Phases 0–5 of the Intent build-out (2026-04-28) shipped a 4-level spec hierarchy at `.claude/specs/` plus the skills to generate and view it (`onboard-figma`, `init-specs`, `spec-project`, `spec-theme`, `spec-page`, `spec-section`, `refresh-spec-viewer`). The hierarchy is consumed today by **user-facing skills** — `/scope-feature` and `/plan-feature-implemenation` — as documentation-only input.

It is **not yet consumed by the autonomous orchestrator** (M7 Planner / M13 Architect). The Planner currently reads only `feature.md` + per-feature `.claude/features/<id>/reference/`. It has no awareness of `project.md` (project-wide scope/policies), `theme.md` (gotchas + inventory), or the relevant `pages/<slug>.md` / `sections/<slug>.md` for whatever template the request touches.

This is the gap M14 closes.

## Scope

1. **Extend the orchestrator's `FeatureRequest` (or wrap it with a richer `PlannerInput`)** so it can carry pointers to spec files. Two options to evaluate at design time:
   - **By-reference:** add `projectContext: { projectSpec: string, themeSpec: string, pageSpecs: string[], sectionSpecs: string[] }` — paths only. Planner reads files itself.
   - **By-value:** pre-load + parse the relevant specs and inject parsed structures into the planner's prompt. Avoids file I/O inside the planner but couples the bridge type tighter.
   - **Default proposal:** by-reference — keeps the M13 `TriagedFeatureRequestSchema` contract clean and lets the planner decide what to actually read.

2. **Resolve relevant specs automatically.** The planner's pre-step (a small util in `orchestrator/src/agents/planner/`) computes the spec set:
   - Always include `project.md` + `theme.md` (project-wide context).
   - Include `pages/<slug>.md` for any template the feature target overlaps (matched via slug substring on the feature name + the feature's `targetPages` if present in `FeatureRequest`).
   - Include `sections/<slug>.md` for any section referenced in the matched pages' `sections[]`.
   - Optionally surface `_figma-index.json` entries when the planner needs Figma context for triage.

3. **Wire Figma MCP into `.mcp.json`** for the autonomous orchestrator (which runs outside the IDE and doesn't have the Figma plugin). Today's `.mcp.json` registers only `@shopify/dev-mcp`. M14 adds `@figma/mcp` (or whichever package is canonical at that time) so the orchestrator can fetch frame metadata + screenshots when a planner needs it.

4. **Open ADR-011 — "Spec hierarchy as planner input"** capturing the decision (by-reference vs. by-value, resolver heuristic, Figma MCP wiring).

## Acceptance criteria

- [ ] `orchestrator/src/agents/planner/` has a `resolveProjectContext()` function that takes a `FeatureRequest` and returns a list of spec paths.
- [ ] Planner agent reads project + theme + matched page/section specs as input context. Verified end-to-end with a sample run that cites a spec in its triage rationale.
- [ ] M13's `TriagedFeatureRequestSchema` is unchanged. The new context flows in as planner input only — the bridge to the architect is not modified.
- [ ] `.mcp.json` registers Figma MCP. Orchestrator can call Figma MCP from a planner subprocess.
- [ ] ADR-011 merged.
- [ ] At least one feature has been shipped using the M14 wiring as a proof-of-life.

## Trigger criteria (when to actually start M14)

Don't spend cycles on M14 until **all** of these are true:

- The 4-level spec hierarchy has been used on **at least one full feature** end-to-end (`/scope-feature` → `/plan-feature-implemenation` → build → QA → ship).
- That feature exposed a real pain point that M14 solves (e.g. "the planner missed the section padding gotcha because it didn't read `theme.md`"). Don't speculate the value — measure it.
- The user has explicitly said "let's wire specs into the orchestrator next." This is the user's call, not an automatic next step.

Until those triggers fire, M14 stays stubbed.

## Out of scope (deferred to later milestones)

- A `/validate-specs` skill (drift detection between specs and code). Useful but orthogonal — its own milestone.
- Auto-regenerating specs from filesystem changes. Specs stay hand-curated per the project decision recorded in `project.md`.
- Polaris UI for spec management. The static HTML viewer (Phase 4) is sufficient for now.
- Wiring specs into individual specialist agents (Liquid / Config / Assets). M14 stops at the planner.

## References

- `.claude/specs/project.md` — Phase 2 outcome
- `.claude/specs/theme.md` — Phase 1 outcome
- `.claude/architecture/milestones/M7-planner-architect.md` — combined planner/architect (superseded)
- `.claude/architecture/milestones/M13-planner-architect-split.md` — current split
- `.claude/architecture/adr/ADR-010-planner-architect-split.md` — accepted split decision
- `orchestrator/src/types.ts` — `FeatureRequest`, `TriagedFeatureRequest`, contract to preserve
