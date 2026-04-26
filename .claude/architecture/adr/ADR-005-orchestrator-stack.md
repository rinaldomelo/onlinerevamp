# ADR-005 — Orchestrator Stack: TypeScript + Anthropic Agent SDK

- **Status:** Accepted
- **Date:** 2026-04-25
- **Deciders:** Rinaldo (solo dev)
- **Implements:** Milestones M7, M8, M9, M10
- **Related:** ADR-002 (MCP wiring), ADR-004 (skills tier split)

---

## Context

Starting in M7, we build an autonomous orchestrator: a process that consumes a `feature.md`, runs the planner+architect agent (and later specialists, validation, deployment), and writes back to the repo. This needs a programming language and a runtime stack.

The two realistic choices:

- **TypeScript + Anthropic Agent SDK (TS).** Matches the reference architecture's example code (it's all TS). MCP support is first-class. Deploys cleanly to Vercel / Cloudflare Workers / a small Node server. JSON parsing, file I/O, and Git interactions are well-tooled. Ships to a long-running process or a per-request handler.

- **Python + Anthropic Agent SDK (Python).** Idiomatic for many AI-adjacent codebases. Excellent if the orchestrator pulls in ML data tooling (pandas, NLP). Slightly more friction for serverless deploy and Git/CI tooling.

The reference doc (`shopify-agentic-theme-system_1.md` §13) is written in TypeScript throughout. The MCP tool wrapper file the user has in their downloads (`shopify-dev-mcp.tool.ts`) is TS. The tooling surface (file I/O against a Shopify theme repo, JSON manipulation, Git ops, GitHub API) is well-served by Node.

The user is a Shopify-theme dev. Their day-to-day is Liquid + JSON + JS. They're already comfortable in JavaScript-flavored ecosystems. The Anthropic Agent SDK has Claude Code's TS verifier already wired into this workspace.

## Decision

**Orchestrator is TypeScript on Node 20+, using the Anthropic Agent SDK (`@anthropic-ai/claude-agent-sdk`).**

Concretely:

- Stack: TS 5.x, Node 20 LTS or later. ESM modules.
- Package manager: `pnpm` (lighter than `npm`, simpler than `bun` for this use case). Add `pnpm-lock.yaml` to repo when M7 lands.
- Agent SDK: `@anthropic-ai/claude-agent-sdk` (latest at M7 start).
- MCP client: provided by the SDK; no custom client.
- File I/O: `fs/promises`. Git via `simple-git` or shelled `git` calls — pick at M7 based on what the SDK already wraps.
- GitHub API: `octokit/rest` (or whatever the SDK exposes — verify in M7).
- Lint/format: `eslint` + `prettier` (already needed for the theme repo from M2).
- Test: `vitest` (faster than jest, Vite-native, good DX). Lightweight if M7 reveals minimal test surface.

Where the orchestrator code lives: a top-level `orchestrator/` folder at repo root, separate from the theme files. (Rationale: the theme is what Shopify CLI pushes; orchestrator code must be excluded via `.shopifyignore`.)

## Consequences

**Positive:**

- Matches all reference code in the source doc — copy/adapt cost is minimal vs. translating to Python.
- TS gives compile-time safety on the agent's input/output schemas (the doc's `PlannerModelInput`, `ArchitectDesign`, `AgentObservation` types are already TS).
- Single language across orchestrator + Shopify theme JS keeps the mental model small. No context-switch between Python and JS.
- Anthropic Agent SDK's TS bindings are tested and supported; the agent-sdk-verifier-ts agent is already available in this Claude Code session.
- Vercel / Cloudflare deploy paths are first-class. If the orchestrator ever runs as a service, hosting is cheap.
- `simple-git` and `octokit/rest` are mature; we won't fight tooling.

**Negative:**

- TS build step adds a small amount of friction vs. Python's "just run it." Mitigated by `tsx` for dev and `tsc` for releases.
- If we later need ML-style data work (e.g. analyzing many themes' patterns to inform planner prompts), Python's data ecosystem would have been better. Mitigation: those tasks can run as separate Python scripts triggered from CI; the orchestrator itself doesn't need to be polyglot.
- Locks us out of skills written in Python. Toolkit skills are language-agnostic (they're MCP tools), so this isn't actually a constraint.

**Neutral:**

- Solo-dev means language choice is a personal-preference call as much as a technical one. TS wins on fit; Python wins on familiarity-for-some. Going TS doesn't preclude rewriting later if data-science workloads emerge.

## Alternatives considered

| Alternative | Why rejected |
|---|---|
| **Python + Agent SDK** | Diverges from the reference doc's TS examples. Higher friction for Git/CI/serverless deploy. Python's strengths (data tooling) aren't what an orchestrator needs. |
| **Bun runtime instead of Node** | Bun is fast but less mature for long-running production processes. `pnpm` + Node 20 is the conservative pick. Reconsider if Bun's stability story stabilizes by M7. |
| **No orchestrator — just longer skill prompts** | Doesn't scale. Once we want autonomous loops with validation feedback (M9), prompts alone can't model the state machine. |
| **Use Claude Code itself as the orchestrator** | Claude Code is interactive. The orchestrator needs to run unattended (eventually overnight, in CI, on a schedule). A standalone Node process is the right fit. |
| **Build on a workflow framework** (Temporal, Inngest, etc.) | Premature. Until we have multi-step durable workflows that need retries / fan-out, the SDK's built-in loop is enough. Revisit at M11+. |

## Repo layout (target end-state, M7+)

```
/                           # repo root (Shopify theme files)
├── .shopifyignore          # excludes orchestrator/ from theme push
├── orchestrator/
│   ├── package.json
│   ├── tsconfig.json
│   ├── pnpm-lock.yaml
│   ├── src/
│   │   ├── agents/
│   │   │   ├── planner-architect/
│   │   │   ├── liquid/
│   │   │   ├── config/
│   │   │   ├── assets/
│   │   │   ├── validation/
│   │   │   └── deployment/
│   │   ├── tools/
│   │   │   ├── git.ts
│   │   │   ├── fs.ts
│   │   │   ├── shopify-dev-mcp.ts
│   │   │   └── github-api.ts
│   │   ├── types.ts
│   │   └── index.ts
│   └── tests/
└── (theme files at root)
```

(The reference doc shows orchestrator and theme in separate repos. ADR-001 / decisions confirmed in M0 keep them in the same repo for solo-dev simplicity. M12 reconsiders.)

## Migration path (if we ever supersede this)

- **TS → Python:** rewrite the orchestrator in Python on the same Agent SDK. Schemas (`AgentObservation` etc.) translate 1:1. ADR-supersedes flow.
- **Agent SDK → another framework:** unlikely while Anthropic remains the primary model. If we move to OpenAI / Bedrock / etc., MCP tooling stays portable; agent harness gets rewritten.

## Verification

- M7 ships the orchestrator with `pnpm install && pnpm test` running clean.
- The agent-sdk-verifier-ts agent passes when run against the M7 deliverable.
- A single `pnpm orchestrator run --feature feature-new-hero` executes the planner-architect end-to-end in under 60s on a warm cache.
