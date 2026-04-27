# ADR-010 — Phase-2 Split: Planner ≠ Architect, with Feature-Level Triage

- **Status:** Accepted
- **Date:** 2026-04-27
- **Deciders:** Rinaldo (solo dev)
- **Implements:** Milestone M13
- **Supersedes:** [ADR-006](./ADR-006-combined-planner-architect.md)
- **Related:** ADR-005 (orchestrator stack), ADR-007 (permissions policy), ADR-008 (observability logs)

---

## Context

ADR-006 combined Planner + Architect into a single agent for Phase 1, with a documented split criterion deferred to M12. The user pulled the split forward in M13 as a deliberate architecture upgrade — not because the M12 trigger criteria fired (prompt size, multi-store, conflicting implementations, or recurring observation patterns) but because the **role-language separation** itself is the desired property:

- **Planner** is the human-facing entry point. It speaks natural language with project-manager-level technical fluency. It receives raw human intent (a `FeatureRequest` plus reference assets — screenshots, images, HTML mockups, design notes from `.claude/features/<id>/reference/`), classifies the request into one of six levels (L1–L6), produces a deterministic `teamDays` estimate, and either emits a fully-specified `TriagedFeatureRequest` for the architect OR holds the request when input is insufficient.
- **Architect** is the developer-facing agent. It only consumes ready (non-held) `TriagedFeatureRequest`s, has senior-Shopify-architect knowledge of the theme's specific files / classes / patterns, and emits the existing `Plan` + `ArchitectDesign` for the specialists.

The split decouples the human-NL side (intake, triage, hold) from the developer-technical side (theme-primitive mapping, file paths, schema settings). It also surfaces a new artifact — the **feature level** — that downstream tooling can use as a deterministic upper bound on which write paths a feature is allowed to touch.

## Decision

**Split `planner-architect` into two agents — `planner` and `architect` — connected by a `TriagedFeatureRequest` bridge type. Introduce L1–L6 feature levels with file-glob signatures, a deterministic `estimateTeamDays` helper, and a held-state contract.**

Concretely:

- **Two folders:** `orchestrator/src/agents/planner/` and `orchestrator/src/agents/architect/`. Each has its own `schema.ts`, `prompt.md`, `model.ts`, `harness.ts`, and `index.ts`.
- **Bridge type:** `TriagedFeatureRequest` (in `orchestrator/src/types.ts`) carries either `{ status: "ready", level, estimatedEffort, acceptanceCriteria, references }` OR `{ status: "held", heldReason, missingInputs }`.
- **Shared level constant:** `orchestrator/src/agents/level.ts` exports `LEVEL_WRITE_GLOBS`, `LEVEL_BASELINE_DAYS`, `LEVEL_NAMES`, `composeGlobs`, `pathFitsLevel`, and `renderLevelTableMarkdown`. Both prompts inject the level table at load time via a `{{LEVEL_TABLE}}` placeholder — preventing prompt drift between planner and architect.
- **Deterministic estimator:** `orchestrator/src/agents/planner/estimate.ts` exports `estimateTeamDays(level, factors)`. The planner model proposes factors; the harness runs the helper to produce the number. Multipliers compose multiplicatively, uncapped.
- **Two-stage workflow:** `runFeature` in `orchestrator/src/orchestrator/workflow-runner.ts` runs planner first; on `held`, returns immediately with `RunFeatureResult.status === "held"`; on `ready`, runs architect, then dispatches PlanTasks to specialists (existing M8 behavior).
- **Schema-level held rejection:** `ArchitectInputSchema` uses `.refine(t => t.triagedRequest.status === "ready")`. Defense-in-depth: the workflow runner already short-circuits on held, but the schema enforces the invariant at the agent boundary too.
- **Permissions:** `permissions.yml` replaces the `planner-architect:` entry with two read-only entries. Total agent count goes from 6 to 7.
- **TargetAgent enum:** Adds `planner` (existing `architect` already present from M7). Both throw "runs upstream of dispatch" when seen by `dispatchTask` — they don't dispatch through the message bus.

## Consequences

**Positive:**

- **Clear role-language boundary.** Each prompt is shorter and role-pure; the planner can't accidentally name files, the architect can't accidentally hold.
- **Falsifiable level system.** L1–L6 file-glob signatures replace prose-judgment definitions. The architect's eventual write-glob set IS the level signature, so triage becomes verifiable end-to-end (M13.1 will promote level→glob enforcement into `policy.ts`).
- **Held-state is explicit.** No more pretending the orchestrator can fully spec a feature from ambiguous input. The held branch surfaces missing inputs as a structured list the human can answer.
- **Observation attribution is sharper.** Bad outputs now route to either "planner misjudged level/scope" or "architect misread theme conventions" — not the conflated bucket of the old combined agent.
- **Reproducible estimates.** Multiplier table + level baselines mean `teamDays` is deterministic across runs. Recalibration is one constant edit, not a prompt rewrite.

**Negative:**

- **Two prompts to maintain.** The shared `level.ts` constant + `{{LEVEL_TABLE}}` substitution mitigates drift, but each prompt's tone/voice is now its own thing.
- **Increased serialization surface.** `TriagedFeatureRequest` adds an intermediate type that callers must handle. The `RunFeatureResult` discriminated union forces callers to switch on `status`.
- **Held requests need human follow-up.** Until a future milestone adds queueing, callers see held outcomes synchronously and must surface them to the human.
- **Multipliers uncapped by design.** An L4 with high variant count + novel component + high copy density + responsive can exceed L5 baseline. This is intentional — surfacing math that says "this is bigger than its level suggests" is signal, not noise — but consumers need to understand it.

**Neutral:**

- **Reversible.** If the split proves wrong, ADR-010 supersedes back: re-merge the two agents, drop `TriagedFeatureRequest`, restore the combined prompt. Migration cost is bounded.
- **Skills (`/scope-feature`, `/plan-feature-implemenation`) unchanged.** They are the human-collaborative analogs of planner+architect; adopting the level system in the human flow is a worthwhile follow-up, but out of scope for M13.

## Alternatives considered

| Alternative | Why rejected |
|---|---|
| **Wait for M12 trigger criteria to fire** | The user wanted role-language separation now, independent of prompt bloat. Forcing the wait would have shipped a less-aligned architecture indefinitely. |
| **Three-agent split** (Planner → Triage → Architect) | The triage role is small enough to fit inside the planner without bloat. Three agents would have added a hand-off without proportional benefit. |
| **Prompt-only split** (one agent, two prompts conditionally loaded) | Doesn't fix the type-contract conflation. `TriagedFeatureRequest` is the value, not the prompt switch. |
| **Per-level agent** (one agent per level) | Too many agents, identical prompt bodies, all dispatch logic moves into the workflow runner. Worst of both worlds. |

## Migration path (from ADR-006's combined agent)

1. Add `FeatureLevel`, `FeatureReferenceSchema`, `EstimatedEffortSchema`, `TriagedFeatureRequestSchema` to `types.ts`. Add `planner` to `TargetAgent`.
2. Create `orchestrator/src/agents/level.ts` with `LEVEL_WRITE_GLOBS`, `LEVEL_BASELINE_DAYS`, helpers.
3. Create `orchestrator/src/agents/planner/` (6 files including `estimate.ts`). Prompt enforces NL-only output.
4. Create `orchestrator/src/agents/architect/` (5 files). Schema rejects held inputs. Prompt enforces level-signature respect.
5. Delete `orchestrator/src/agents/planner-architect/` (5 files).
6. Update `dispatch.ts` (`planner` + `architect` both throw upstream-of-dispatch).
7. Rewrite `workflow-runner.ts` as two-stage with discriminated-union return type.
8. Update `index.ts` CLI to surface held vs complete outcomes.
9. Add `tests/planner.smoke.test.ts` + `tests/architect.smoke.test.ts`. Delete `tests/planner-architect.smoke.test.ts`.
10. Replace `planner-architect:` entry in `permissions.yml` with `planner:` + `architect:`.
11. Mark ADR-006 Status `Superseded`, append Superseded section.
12. Update ROADMAP table (add M13 row, scope-narrow M12 to TAE-only) + ADR index.
13. Add M13 milestone spec + README index entry. Banner M7 spec as Superseded.
14. Edit M11 acceptance line: `6 agents` → `7 agents`.
15. Append project-log entry cross-referencing this ADR.

## Verification

- `pnpm tsc --noEmit` compiles cleanly (after M7's tsconfig blocker is fixed independently).
- `pnpm test` runs the new smoke tests:
  - `planner.smoke.test.ts` — Zod parses ready + held variants, estimator deterministic at each level.
  - `architect.smoke.test.ts` — schema accepts ready, rejects held with the expected error message.
- `permissions.yml` parses through the existing inline parser in `policy.ts` (hand-verified).
- ROADMAP reflects M13 as a new row; M12 trigger criteria scoped to TAE-only.
- After M14 wires the Anthropic Agent SDK, run the orchestrator against `feature-new-hero` and check planner's level + estimate against `feature.md`'s Extended Brief.

## Open follow-ups (not blocking M13)

- **Held-state persistence.** Whether the harness writes `.claude/features/<id>/HELD.md` for human follow-up. Default: no, return-only.
- **Level-mismatch escalation.** If architect's design exceeds the planner's level, fail loud (current behaviour) vs. auto-re-triage (M13.1).
- **Multimodal image content blocks.** Schema is ready; harness implementation deferred to M14.
- **Skill-level integration.** Whether `/scope-feature` adopts L1–L6 for human-collaborative consistency.
