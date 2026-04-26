# Orchestrator — Online Revamp Agentic System

> TypeScript orchestrator for the Online Revamp Shopify theme. Built on the Anthropic Agent SDK + Shopify Dev MCP.
>
> **Status (M7):** Scaffold only. Not validated at runtime. Subsequent milestones (M8–M11) layer on the specialist / validation / deployment / governance agents.

---

## What this is

A standalone Node process that:

1. Reads a feature spec (`.claude/features/<feature-id>/feature.md`).
2. Runs the planner-architect agent (M7), which emits a Plan + ArchitectDesign back into the feature folder.
3. (M8+) Dispatches PlanTasks to specialist agents (liquid / config / assets).
4. (M9) Runs the validation agent — wraps Toolkit + theme-check + Lighthouse.
5. (M10) Runs the deployment agent — branch + commit + PR + preview.
6. (M11) Logs every step to `.claude/logs/runs/<plan-id>.jsonl`, enforced by `.claude/architecture/permissions.yml`.

## Setup

```bash
cd orchestrator/
pnpm install        # or npm install
cp .env.example .env
# Fill in ANTHROPIC_API_KEY, GITHUB_TOKEN if running locally.
pnpm test           # smoke tests (mocked tools)
```

## Run

```bash
pnpm run-feature feature-new-hero
```

Reads `.claude/features/feature-new-hero/feature.md`, drives the planner-architect, writes back to the feature folder.

## Repo layout

```
src/
├── types.ts                          # FeatureRequest, Plan, ArchitectDesign, AgentObservation (Zod-backed)
├── index.ts                          # CLI entry
├── orchestrator/
│   ├── message-bus.ts
│   └── workflow-runner.ts
├── tools/
│   ├── shopify-dev-mcp.ts            # MCP client wrapper (calls @shopify/dev-mcp)
│   ├── fs.ts                         # theme-relative file I/O
│   ├── git.ts                        # simple-git wrapper
│   └── github-api.ts                 # octokit wrapper
└── agents/
    └── planner-architect/
        ├── index.ts
        ├── model.ts
        ├── harness.ts
        ├── prompt.md
        └── schema.ts
tests/
└── planner-architect.smoke.test.ts
```

## What's NOT here yet

- M8 specialists (liquid / config / assets agents).
- M9 validation agent.
- M10 deployment agent.
- M11 logger + permissions.yml + policy.ts.

Each lands in its own milestone PR, layered on this scaffold.

## Auth

- `ANTHROPIC_API_KEY` — for Agent SDK model calls. Local only; CI doesn't run the orchestrator.
- `GITHUB_TOKEN` — for octokit (M10 PR creation).
- Shopify auth flows through the MCP server (`@shopify/dev-mcp@latest` handles its own).

## See also

- `.claude/architecture/ROADMAP.md` — milestone roadmap.
- `.claude/architecture/adr/ADR-005-orchestrator-stack.md` — why TypeScript + Agent SDK.
- `.claude/architecture/adr/ADR-006-combined-planner-architect.md` — why Planner+Architect are combined for Phase 1.
