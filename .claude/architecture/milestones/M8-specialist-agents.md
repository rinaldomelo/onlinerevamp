# M8 — Specialist Implementation Agents (Liquid / Config / Assets)

**Status:** Code merged, awaiting verification. **Scaffold only.**
**Effort:** L.
**Owner:** Rinaldo.
**Branch:** `feature/m8-specialist-agents`.
**PR target:** `development`.

---

## Goal

Three subagents — `liquid`, `config`, `assets` — that the planner-architect dispatches to via `targetAgent` on each PlanTask. Each is bound by file-glob policy (enforced procedurally now, by M11's `permissions.yml` later). Each writes one change-set, validates locally, returns a structured `AgentObservation`.

## Why

M7 produced Plans + Designs but had no executors. M8 wires the dispatch path. After M8, a planner-architect run that emits 3 PlanTasks (one liquid, one config, one assets) gets routed to the right specialists. Specialists don't yet do real edits (Anthropic Agent SDK call still scaffolded), but the structural contract is locked.

## Scope

In:

- `orchestrator/src/agents/liquid/{prompt.md, harness.ts, index.ts}`.
- `orchestrator/src/agents/config/{prompt.md, harness.ts, index.ts}`.
- `orchestrator/src/agents/assets/{prompt.md, harness.ts, index.ts}`.
- `orchestrator/src/orchestrator/dispatch.ts` — routes `PlanTask.targetAgent` → specialist.
- `orchestrator/src/orchestrator/workflow-runner.ts` updated to call `dispatchTask` instead of warning.
- `orchestrator/tests/specialists.smoke.test.ts` — file-glob policy enforcement tests.

Out:

- Validation agent (M9).
- Deployment agent (M10).
- Real model calls (each harness throws / returns a "scaffold only" observation).
- Permissions.yml loader (M11; today's enforcement is procedural via regex globs in each harness).

## Files in this PR

- `orchestrator/src/agents/{liquid,config,assets}/*` (9 new files)
- `orchestrator/src/orchestrator/dispatch.ts` (new)
- `orchestrator/src/orchestrator/workflow-runner.ts` (modified — calls dispatchTask)
- `orchestrator/tests/specialists.smoke.test.ts` (new)
- `.claude/architecture/milestones/M8-specialist-agents.md` (this file)
- `.claude/architecture/milestones/README.md` (M8 stub trimmed)
- `.claude/architecture/ROADMAP.md` (status row updated)
- `.claude/context/OUTPUT-project-log.md` (entry appended)

## Pre-flight (user actions to mark M8 Done)

- [ ] Merge M0–M7.
- [ ] `cd orchestrator && pnpm install` (will need lockfile from M7's pre-flight).
- [ ] `pnpm test` — specialist smoke tests verify file-glob refusal.
- [ ] `pnpm build` — fix any type errors from the M7 + M8 file additions.
- [ ] Wire the actual agent SDK call inside each specialist's harness:
  ```ts
  // liquid/harness.ts
  const { updatedContent } = await callLiquidModel({ filePath, currentContent, changeRequest });
  const validation = await mcp.validateLiquid({ content: updatedContent, filePath });
  if (validation.errors.length) return { ..., success: false, artifacts: { validation } };
  await writeTheme(filePath, updatedContent);
  return { ..., success: true };
  ```
- [ ] Run a planner-architect → specialist round-trip locally and verify the dispatch table.

## Acceptance criteria

- [ ] All 3 specialists exist with consistent file layout.
- [ ] `dispatch.ts` exhaustively handles every `targetAgent` value (TypeScript `_exhaustive: never` check).
- [ ] File-glob policy rejection is verified by smoke test for each agent.
- [ ] Workflow runner calls dispatch instead of warning.
- [ ] PR merged to `development`.

## Risks

- **Policy enforcement is procedural today.** Each harness has its own regex glob; a future contributor could forget one. Mitigation: M11's permissions.yml centralizes this and adds a unit test.
- **Specialists return scaffold observations.** The orchestrator runs end-to-end, but no theme files actually change. Don't release this thinking it does.
- **Type inference on `task.payload`.** Currently typed as `Record<string, unknown>` and cast at the harness boundary. Any malformed PlanTask from the planner-architect will hit the `as` cast and not throw helpfully. M9 validation can add a Zod parse step.

## Dependencies

- M7 merged (orchestrator scaffold + types).
- ADR-007 (permissions policy) deferred to M11; until then, harness-level enforcement is the source of truth.

## Out of scope

- Validation agent (M9).
- Deployment agent (M10).
- permissions.yml (M11).
- Theme files.
- Lockfile generation.
