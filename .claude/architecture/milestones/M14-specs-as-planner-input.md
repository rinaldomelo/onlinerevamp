# M14 — Specs as Planner Input (resolver + demo)

> **Status:** In progress (2026-04-28). Resolver + ADR-011 merged on `feature/m14-specs-as-planner-input`. Hero demo and Figma MCP wiring outstanding.
>
> **Owner:** Rinaldo.
>
> **Effort:** S (1 day).

## Why this milestone exists

The L1 build-out (2026-04-28) shipped a 4-level project-wide spec hierarchy at `.claude/specs/` plus the skills to generate and view it. The hierarchy is consumed today by the user-facing `/scope-feature` and `/plan-feature-implemenation` skills as documentation-only context, but the **autonomous orchestrator (M7+)** has no awareness of it.

This milestone closes the design gap: a deterministic `resolveProjectContext()` resolver that maps a `FeatureRequest` to the relevant spec paths, captured as a contract (ADR-011) so M15 can plug it into a real runtime. The hero feature is the test bed — the captured Plan + Design from a sub-agent demo proves the by-reference shape works at the prompt level.

> **Scope changed mid-flight (2026-04-28):** the original M14 plan also wired `callPlannerModel` / `callArchitectModel` to the Anthropic Agent SDK runtime. After advisor review, that work was identified as scope creep over the M14 stub and untested in this environment. Runtime wiring deferred to **M15**; M14 ships the resolver, the ADR, the Figma MCP registration, and a sub-agent demo as proof-of-life.

## In scope (M14 actually ships)

1. **Resolver** at `orchestrator/src/agents/shared/resolveProjectContext.ts` — pure deterministic function; returns `ProjectContext` with repo-relative paths.
2. **Vitest** at `orchestrator/tests/resolveProjectContext.test.ts` — runs against the live `.claude/specs/` tree (11 cases including the slideshow / hero scenario).
3. **ADR-011** — by-reference decision; `read_spec` tool contract; resolver heuristic; what M14 does NOT do.
4. **Figma MCP registration** in `.mcp.json` for the autonomous orchestrator (the IDE has the Figma plugin; the orchestrator runs outside it). Wired-but-not-exercised in M14 — the hero demo doesn't need Figma.
5. **Hero demo** at `.claude/features/feature-hero-test/` — feature.md (pause_on_hover brief) + sub-agent-captured `OUTPUT-planner-triage.md` + `OUTPUT-implementation-plan.md` + `RUN-NOTES.md`. Validates the captured JSON against `PlannerOutputSchema` and `ArchitectOutputSchema`.

## Out of scope (deferred to M15)

- `orchestrator/src/tools/read-spec.ts` — the actual MCP/SDK tool implementation.
- Wiring `callPlannerModel` and `callArchitectModel` to a real model runtime. Both stay as throwing scaffolds. Their TODO comments now reference M15.
- Augmenting `planner/harness.ts` / `architect/harness.ts` to call the resolver and pass results into the model.
- Choosing between Claude Agent SDK (subprocess) vs. raw Anthropic Messages API for the runtime — open as ADR-012 at M15 time, after the demo gives empirical signal.

## Acceptance criteria

- [x] `orchestrator/src/agents/shared/resolveProjectContext.ts` exists; given `FeatureRequest({ title: "tweak the hero" })` returns a context with `slideshow.md` in `sectionSpecs`.
- [x] `pnpm test` passes (36/36, including 11 new resolver tests).
- [x] M13's `TriagedFeatureRequestSchema` is unchanged. `git diff main -- orchestrator/src/types.ts` shows no changes.
- [x] ADR-011 merged.
- [ ] `.mcp.json` registers Figma MCP (or the gap is documented if no canonical package exists).
- [ ] Hero demo run captured: planner triage + architect Plan + Design written to `feature-hero-test/`. Both pass schema validation.
- [ ] ROADMAP M14 row updated to "Code merged, awaiting verification". M15 row added.

## References

- `.claude/specs/project.md`, `.claude/specs/theme.md`, `.claude/specs/pages/index.md`, `.claude/specs/sections/slideshow.md` — the specs the resolver surfaces for hero.
- `.claude/architecture/adr/ADR-010-planner-architect-split.md` — preserved bridge contract.
- `.claude/architecture/adr/ADR-011-spec-hierarchy-as-planner-input.md` — this milestone's decision record.
- `.claude/architecture/milestones/M13-planner-architect-split.md` — predecessor.
- `orchestrator/src/types.ts` — `FeatureRequest`, `TriagedFeatureRequest`. Untouched in M14.
- `orchestrator/src/agents/{planner,architect}/model.ts` — TODO comments updated to point at M15; bodies still throw.
