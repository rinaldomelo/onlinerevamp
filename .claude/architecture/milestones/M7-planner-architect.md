# M7 — Planner+Architect Agent (Combined, Phase 1)

> **Superseded by [M13](./M13-planner-architect-split.md) on 2026-04-27.** The combined `planner-architect` agent that this milestone shipped was split into separate `planner` and `architect` agents in M13, earlier than the M12 trigger criteria predicted. ADR-006 → ADR-010. The body of this spec describes the Phase-1 reality that was true between M7 and M13 — left intact for honest history.

**Status:** Code merged, awaiting verification (PR open). **Scaffold only — not validated at runtime.**
**Effort:** L.
**Owner:** Rinaldo.
**Branch:** `feature/m7-planner-architect`.
**PR target:** `development`.

---

## Goal

First Agent SDK orchestrator. A standalone TypeScript process at `orchestrator/` that reads a `feature.md`, runs the combined planner-architect agent, and emits a structured Plan + ArchitectDesign back into the feature folder. Activates Pattern B (`.mcp.json` for `@shopify/dev-mcp`) per ADR-002.

## Why

After M0–M6, every layer below the autonomous orchestrator is in place: docs, validation guardrails, CI, deploy, skills. M7 starts Layer 2 of the source-doc architecture (Plan + Architect) running as code, not as a human-driven skill.

## Scope

In:

- `.mcp.json` at repo root — declares `@shopify/dev-mcp@latest` for orchestrator MCP access.
- `orchestrator/` directory:
  - `package.json`, `tsconfig.json`, `README.md`.
  - `src/types.ts` — Zod schemas for `FeatureRequest`, `Plan`, `PlanTask`, `ArchitectDesign`, `AgentObservation`, `ValidationDecision`.
  - `src/tools/{shopify-dev-mcp.ts, fs.ts, git.ts, github-api.ts}` — typed wrappers (scaffolded, throw on call until wired).
  - `src/orchestrator/{message-bus.ts, workflow-runner.ts}` — minimal in-process bus + runner.
  - `src/agents/planner-architect/{model.ts, harness.ts, prompt.md, schema.ts, index.ts}`.
  - `src/index.ts` — CLI entry (`run-feature <feature-id>`).
  - `tests/planner-architect.smoke.test.ts` — Zod schema smoke tests (run without runtime).
- `.claude/architecture/adr/ADR-006-combined-planner-architect.md` — decision + split criteria.
- M7 milestone spec.

Out:

- Specialist agents (M8 — liquid / config / assets).
- Validation agent (M9).
- Deployment agent (M10).
- Logger / permissions (M11).
- Running the orchestrator end-to-end. Scaffold only.

## Files in this PR

- `.mcp.json` (new — Pattern B activation)
- `orchestrator/package.json` (new)
- `orchestrator/tsconfig.json` (new)
- `orchestrator/README.md` (new)
- `orchestrator/src/types.ts` (new)
- `orchestrator/src/tools/shopify-dev-mcp.ts` (new)
- `orchestrator/src/tools/fs.ts` (new)
- `orchestrator/src/tools/git.ts` (new)
- `orchestrator/src/tools/github-api.ts` (new)
- `orchestrator/src/orchestrator/message-bus.ts` (new)
- `orchestrator/src/orchestrator/workflow-runner.ts` (new)
- `orchestrator/src/agents/planner-architect/{schema, model, harness, prompt, index}` (new)
- `orchestrator/src/index.ts` (new — CLI entry)
- `orchestrator/tests/planner-architect.smoke.test.ts` (new)
- `.claude/architecture/adr/ADR-006-combined-planner-architect.md` (new)
- `.claude/architecture/milestones/M7-planner-architect.md` (this file)
- `.claude/architecture/milestones/README.md` (M7 stub trimmed)
- `.claude/architecture/ROADMAP.md` (status row updated; ADR-006 listed)
- `.claude/context/OUTPUT-project-log.md` (entry appended)

## ⚠️ Scaffold-only disclosure

I did NOT:

- Run `pnpm install` (no lockfile committed).
- Run `tsc` to verify the TS compiles.
- Run `vitest` to confirm tests execute.
- Connect to the MCP server.

Specifically:

- `tools/shopify-dev-mcp.ts::createShopifyDevMcpClient` throws "not implemented yet."
- `agents/planner-architect/model.ts::callPlannerArchitectModel` throws "not yet implemented at runtime."
- The Zod schemas + type plumbing should be sound, but until `pnpm install` succeeds, I can't guarantee package versions resolve.

The user accepts this trade-off per the burn-down framing. M8 starts with `pnpm install` + first runtime smoke test, fixing version drift if any.

## Pre-flight (user actions to mark M7 Done)

- [ ] Merge M0–M6.
- [ ] `cd orchestrator && pnpm install` (or `npm install`). Resolve any package version errors.
- [ ] `pnpm test` — should pass the Zod schema smoke tests.
- [ ] `pnpm build` (`tsc -p .`) — verify TS compiles. Fix any type errors.
- [ ] Set local env: `ANTHROPIC_API_KEY`, optionally `GITHUB_TOKEN`.
- [ ] Wire the actual Anthropic Agent SDK call inside `model.ts`. The shape:
  ```ts
  import { createAgent } from "@anthropic-ai/claude-agent-sdk";
  const systemPrompt = await loadSystemPrompt();
  const agent = createAgent({ model: "claude-opus-4-7", systemPrompt, tools: [/* MCP + fs */] });
  const result = await agent.run({ input });
  return PlannerArchitectOutputSchema.parse(result);
  ```
- [ ] Wire the MCP client inside `tools/shopify-dev-mcp.ts` per the sketch in the file.
- [ ] First end-to-end run: `pnpm run-feature feature-new-hero` → expect a Plan + Design + observations log.
- [ ] Compare output against the human-authored plan at `.claude/features/feature-new-hero/OUTPUT-implementation-plan.md`. If divergent, update prompt.md.

## Acceptance criteria

- [ ] All TS files referenced exist and follow the path layout.
- [ ] Zod schemas in `types.ts` match the contracts in the source doc §13.2.
- [ ] `prompt.md` is human-readable and embeds the hard rules.
- [ ] ADR-006 has Status `Accepted`, `Consequences`, and `When to split` criteria.
- [ ] PR merged to `development`.

## Risks

- **Package version drift.** Anthropic Agent SDK is in flux; the version pinned in `package.json` may not exist or may have moved. User regenerates lockfile post-merge.
- **MCP connection latency.** Cold-starting `npx @shopify/dev-mcp@latest` per orchestrator run is slow. If user observes >5s startup, M8 should switch to a long-lived MCP server process.
- **Prompt drift.** The combined prompt grows over time. Watch for the M12 split-trigger criteria.
- **Theme-root assumption.** `THEME_ROOT` defaults to `..` (orchestrator's parent) — works because `orchestrator/` lives inside the theme repo. If this layout changes, every tool wrapper breaks.
- **Test mocking.** Tests today only validate Zod schemas. M8+ adds proper mocked-MCP integration tests.

## Dependencies

- Node 20+.
- ADR-002 (MCP wiring), ADR-005 (orchestrator stack), ADR-006 (combined planner-architect).
- M6 Tier-2 skills (planner-architect's PlanTasks reference them).
- `.claude/CLAUDE.md` rules — orchestrator must respect them at runtime.
- `.claude/rules/git-workflow.md` — encoded by the deployment agent (M10).

## Out of scope

- Specialist agents (M8).
- Validation agent (M9).
- Deployment agent (M10).
- Logger + permissions (M11).
- Lockfile generation.
- End-to-end agent runs.
- Theme files.
