# M13 — Phase-2 Split: Planner ≠ Architect, with Feature-Level Triage

**Status:** Spec ready (PR open). **Scaffold (types + folders + smoke tests; runtime activation deferred to M14).**
**Effort:** L.
**Owner:** Rinaldo.
**Branch:** `feature/m13-planner-architect-split`.
**PR target:** `development`.

---

## Goal

Split the combined `planner-architect` agent shipped in M7 into two distinct, role-pure agents — a human-facing `planner` (intake, level triage, deterministic estimate, held-state) and a developer-facing `architect` (theme-primitive mapping, technical Plan + Design). Introduce the `TriagedFeatureRequest` bridge type and an L1–L6 feature-level system whose levels are defined by file-glob signatures, not prose.

## Why

ADR-006 combined the two roles for Phase 1 with a documented split deferred to M12. The user pulled the split forward in M13 because the **role-language separation** itself is the desired property — the planner should never need to name a file path, the architect should never need to hold a request for missing input. M13 makes that boundary structural, not just stylistic. The added level system gives downstream tooling (and an upcoming M13.1) a deterministic upper bound on which write paths a feature is allowed to touch. See [ADR-010](../adr/ADR-010-planner-architect-split.md) for the full reasoning.

## Scope

In:

- `orchestrator/src/types.ts` — add `FeatureLevel`, `FeatureReferenceSchema`, `EstimatedEffortSchema`, `TriagedFeatureRequestSchema`. Add `planner` to `TargetAgent` enum.
- `orchestrator/src/agents/level.ts` — shared `LEVEL_WRITE_GLOBS`, `LEVEL_BASELINE_DAYS`, `LEVEL_NAMES`, `composeGlobs`, `pathFitsLevel`, `renderLevelTableMarkdown`.
- `orchestrator/src/agents/planner/` — six files (`schema.ts`, `prompt.md`, `model.ts`, `harness.ts`, `estimate.ts`, `index.ts`).
- `orchestrator/src/agents/architect/` — five files (`schema.ts`, `prompt.md`, `model.ts`, `harness.ts`, `index.ts`).
- `orchestrator/src/agents/planner-architect/` — DELETED.
- `orchestrator/src/orchestrator/dispatch.ts` — adds `case "planner":` (throws upstream-of-dispatch alongside `architect`).
- `orchestrator/src/orchestrator/workflow-runner.ts` — two-stage pipeline, discriminated-union `RunFeatureResult` (`held` | `complete`).
- `orchestrator/src/index.ts` — held vs complete CLI output, exit code `2` for held.
- `orchestrator/tests/planner-architect.smoke.test.ts` — DELETED.
- `orchestrator/tests/planner.smoke.test.ts` — NEW (Zod parse for ready/held; `estimateTeamDays` determinism per level).
- `orchestrator/tests/architect.smoke.test.ts` — NEW (schema accepts ready, rejects held; output Plan + Design).
- `.claude/architecture/permissions.yml` — replace `planner-architect:` with `planner:` + `architect:` (both read-only).
- `.claude/architecture/adr/ADR-006-combined-planner-architect.md` — Status → Superseded; append Superseded section.
- `.claude/architecture/adr/ADR-010-planner-architect-split.md` — NEW.
- `.claude/architecture/ROADMAP.md` — milestones table (add M13 row, scope-narrow M12 row), ADR index (add ADR-010, mark ADR-006 Superseded), trigger criteria for M12 scope-narrowed, Decisions-confirmed row added, Last updated bumped.
- `.claude/architecture/milestones/README.md` — index entry for M13, M12 stub scope-narrowed.
- `.claude/architecture/milestones/M7-planner-architect.md` — top-banner Superseded note (body unchanged).
- `.claude/architecture/milestones/M11-governance.md` — acceptance criterion `6 agents` → `7 agents`.
- `.claude/context/OUTPUT-project-log.md` — entry appended.

Out:

- M7's tsconfig blocker fix (handled separately by amending `feature/m7-planner-architect`; driven by `REVIEW-2026-04-26.md`).
- Anthropic Agent SDK runtime wiring in `model.ts` files — both planner and architect throw "not yet implemented." Activation lands in M14.
- Multimodal image-content-block handling in the planner harness — schema is ready (`FeatureReferenceSchema.kind === "image"`), enumeration logic is in place, but the SDK call doesn't transmit images yet.
- Held-state persistence to `.claude/features/<id>/HELD.md` — return-only for now.
- Auto-re-triage on architect-level escalation — current behaviour is fail-loud (M13.1).
- `.claude/skills/scope-feature` and `.claude/skills/plan-feature-implemenation` adopting L1–L6 — out of scope (worth a follow-up).
- Promoting level→glob enforcement into `policy.ts` — currently the architect's prompt enforces level-signature respect; runtime enforcement is M13.1.
- Theme files (`sections/`, `snippets/`, `assets/`, `templates/`, `config/`, `locales/`, `layout/`).

## Files in this PR

- `orchestrator/src/types.ts` (modified)
- `orchestrator/src/agents/level.ts` (new)
- `orchestrator/src/agents/planner/{schema,prompt.md,model,harness,estimate,index}.ts` (new × 6)
- `orchestrator/src/agents/architect/{schema,prompt.md,model,harness,index}.ts` (new × 5)
- `orchestrator/src/agents/planner-architect/` (deleted — 5 files)
- `orchestrator/src/orchestrator/dispatch.ts` (modified)
- `orchestrator/src/orchestrator/workflow-runner.ts` (rewritten)
- `orchestrator/src/index.ts` (rewritten)
- `orchestrator/tests/planner.smoke.test.ts` (new)
- `orchestrator/tests/architect.smoke.test.ts` (new)
- `orchestrator/tests/planner-architect.smoke.test.ts` (deleted)
- `.claude/architecture/permissions.yml` (modified)
- `.claude/architecture/adr/ADR-006-combined-planner-architect.md` (Status + Superseded section)
- `.claude/architecture/adr/ADR-010-planner-architect-split.md` (new)
- `.claude/architecture/ROADMAP.md` (table + ADR index + trigger criteria + Decisions row + Last updated)
- `.claude/architecture/milestones/README.md` (index + M12 stub)
- `.claude/architecture/milestones/M7-planner-architect.md` (top banner)
- `.claude/architecture/milestones/M11-governance.md` (`6 agents` → `7 agents`)
- `.claude/architecture/milestones/M13-planner-architect-split.md` (this file, new)
- `.claude/context/OUTPUT-project-log.md` (entry appended)

## ⚠️ Scaffold-only disclosure

I did NOT:

- Run `pnpm install` or `pnpm tsc --noEmit` (orchestrator runtime activation is M14; M7's tsconfig blocker also still pending fix on M7 branch).
- Run `pnpm test` (vitest expected to pass on the smoke tests once tsconfig is fixed and `pnpm install` succeeds).
- Connect to MCP or wire the Anthropic Agent SDK (M14).

Specifically:

- `agents/planner/model.ts::callPlannerModel` throws "not yet implemented at runtime."
- `agents/architect/model.ts::callArchitectModel` throws "not yet implemented at runtime."
- The Zod schemas + `estimateTeamDays` helper + `level.ts` constants are pure, deterministic, and unit-testable without a model — `pnpm test` should pass once tsconfig compiles.

## Pre-flight (user actions to mark M13 Done)

- [ ] Merge M0–M11 (M13 sits on top of `feature/m11-governance`).
- [ ] Fix M7's tsconfig blocker on `feature/m7-planner-architect` (separate amend per `REVIEW-2026-04-26.md`).
- [ ] `cd orchestrator && pnpm install` (no new deps; same Anthropic SDK + Zod + minimatch as M7+M11).
- [ ] `pnpm tsc --noEmit` — confirm types compile.
- [ ] `pnpm test` — confirm `planner.smoke.test.ts` + `architect.smoke.test.ts` + existing tests all pass.
- [ ] (M14) Wire the Anthropic Agent SDK call inside both `model.ts` files. Surface multimodal image content blocks for `FeatureReference.kind === "image"`.
- [ ] (M14) First end-to-end run: `pnpm run-feature feature-new-hero`. Expect `=== Triage ===` (level + estimate) → `=== Plan ===` → `=== Design ===` → `=== Observations ===`.
- [ ] (M14) Compare planner output against the `feature.md` Extended Brief from `/scope-feature`. Levels and acceptance criteria should agree.

## Acceptance criteria

- [ ] All 11 new orchestrator files exist; the 5 old `planner-architect/` files are gone.
- [ ] `types.ts` exports `FeatureLevel`, `FeatureReferenceSchema`, `EstimatedEffortSchema`, `TriagedFeatureRequestSchema`. `TargetAgent` enum includes `planner`.
- [ ] `level.ts` is the single source of truth for the level → write-glob mapping. Both prompts inject the table at load time via `{{LEVEL_TABLE}}` substitution.
- [ ] Architect's `ArchitectInputSchema` rejects held requests via `.refine`; the smoke test asserts the error message contains "architect rejects held requests."
- [ ] `estimateTeamDays` is deterministic — composes multipliers multiplicatively, uncapped. Smoke test verifies L1, L4 (with multipliers), L5 (low confidence), L6 (held).
- [ ] `runFeature` returns a discriminated union (`held` | `complete`); held short-circuits before architect.
- [ ] `dispatch.ts` exhaustiveness check covers `planner` + `architect` (both throw upstream-of-dispatch).
- [ ] `permissions.yml` parses through `policy.ts`'s inline parser; both `planner` and `architect` are read-only.
- [ ] ADR-006 Status reads `Superseded by ADR-010 on 2026-04-27` and has a Superseded section appended.
- [ ] ADR-010 is in Nygard format, Status `Accepted`, with Context · Decision · Consequences · Alternatives · Migration path · Verification · Open follow-ups.
- [ ] ROADMAP.md milestones table includes M13; M12 row description is "Theme App Extension support"; Trigger criteria section is scope-narrowed.
- [ ] M7 spec has the Superseded banner; M11 spec's acceptance criterion reads `7 agents`.
- [ ] PR merged to `development`.

## Risks

- **Prompt template drift.** The `{{LEVEL_TABLE}}` substitution depends on both `model.ts` files calling `renderLevelTableMarkdown()` correctly. If a future edit forgets the substitution, the model receives the raw placeholder. Mitigation: the helper's name is searchable; both `model.ts` files use it; smoke tests for the substitution can be added if drift is observed.
- **Estimate calibration.** The multiplier table (×1.25 for variants, ×1.4 for novel components, etc.) is a guess until observation logs accumulate. Risk: estimates feel off. Mitigation: deterministic helper means recalibration is a single-file edit, not a prompt rewrite.
- **L2 vs L3 ambiguity at write time.** L2 is "edit existing files only," L3 is "may create new section files." The cumulative globs don't disambiguate edit-vs-create. The architect's prompt currently enforces this semantically; M13.1 promotes it into `policy.ts` with a filesystem-state check.
- **Held-state UX.** Synchronous return means a held request blocks the caller until the human provides missingInputs. Mitigation: documented in CLI help (`exit code 2`); future milestone could add queue persistence.
- **L6 escape hatch.** The planner's prompt says L6 → held. If the model classifies an actually-doable feature as L6 (false positive), the user gets a held outcome and has to push back. Mitigation: M14's first runs validate the L6 decision boundary.
- **Architect level-signature respect is prompt-enforced, not runtime-enforced.** A misbehaving architect could emit PlanTasks whose write paths exceed `triagedRequest.level`. Mitigation: M11 file-glob policy still catches this at write time (specialists refuse out-of-glob writes); M13.1 promotes the check upstream.

## Dependencies

- Node 20+ (unchanged from M7).
- ADR-005 (orchestrator stack), ADR-006 (Phase-1 baseline being superseded), ADR-007 (permissions), ADR-008 (logs).
- M0–M11 merged. M7's tsconfig blocker fix is independent but must land before `pnpm tsc --noEmit` passes.
- `minimatch` (already in `orchestrator/package.json` from M11).

## Out of scope

- Anthropic Agent SDK runtime wiring (M14).
- Multimodal image content blocks in the planner harness (M14).
- Held-state persistence (`.claude/features/<id>/HELD.md`).
- Auto-re-triage on level escalation (M13.1).
- Promoting level→glob enforcement into `policy.ts` (M13.1).
- `/scope-feature` and `/plan-feature-implemenation` skill updates to adopt L1–L6.
- Theme files (`sections/`, `snippets/`, `assets/`, `templates/`, `config/`, `locales/`, `layout/`).
- M12 (conditional, narrowed to Theme App Extension only).
