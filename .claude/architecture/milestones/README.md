# Milestones

This folder holds the per-milestone specs for the agentic system roadmap. The canonical roadmap is `../ROADMAP.md`. Each milestone gets its own file once it's *about to start* — not before. Stubs below describe scope-and-intent only.

## Index

| ID | File | Status |
|---|---|---|
| M0 | [M0-architecture-prep.md](./M0-architecture-prep.md) | In progress |
| M1 | [M1-toolkit-mcp-wiring.md](./M1-toolkit-mcp-wiring.md) | Spec ready |
| M2 | [M2-local-validation.md](./M2-local-validation.md) | Spec ready (PR open) |
| M3 | [M3-ci-foundation.md](./M3-ci-foundation.md) | Spec ready (PR open) |
| M4 | [M4-preview-bot.md](./M4-preview-bot.md) | Spec ready (PR open) |
| M5 | [M5-prod-deploy.md](./M5-prod-deploy.md) | Spec ready (PR open) |
| M6 | [M6-tier2-skills.md](./M6-tier2-skills.md) | Spec ready (PR open) |
| M7 | *Not yet specced* | Stub below |
| M8 | *Not yet specced* | Stub below |
| M9 | *Not yet specced* | Stub below |
| M10 | *Not yet specced* | Stub below |
| M11 | *Not yet specced* | Stub below |
| M12 | *Not yet specced* | Conditional / deferred |

---

## Milestone stubs (just-in-time, expand into full specs when starting)

(M0 and M1 specs are full files; see index above. Stubs below are M2–M12.)

### M7 — Planner+Architect agent (combined, Phase 1)

First Agent SDK orchestrator. Single combined Planner+Architect agent at `.claude/agents/planner-architect/`. Reads `feature.md`, the theme analysis, and current Shopify docs (via Toolkit MCP — Pattern B wired in this milestone via `.mcp.json`). Emits Plan + Design back into the feature folder. Replaces `/plan-feature-implemenation` for routine features; complex ones still use the human skill. ADR-006 captures *when to split* the agent. Acceptance: one already-shipped feature is re-planned end-to-end by the agent, output reviewed against the human-authored plan.

### M8 — Specialist implementation agents

`liquid-agent`, `config-agent`, `assets-agent` as Agent SDK subagents called by the planner-architect. Each is bound by file-glob policy (liquid touches only `sections/`, `snippets/`, `templates/*.liquid`; config only `*.json` config; assets only `assets/*.css|js`). Each writes a single change-set, validates locally, returns a structured observation. Acceptance: planner-architect dispatches a multi-file feature build that compiles green without human intervention on routine features.

### M9 — Validation agent

Closes the validation loop. Tier-1 = Toolkit `validateThemeBundle` + `validateLiquid` (Pattern B). Tier-2 = `theme-check` (M2 config) + Lighthouse CI on preview URL. Decides `pass | needs_fixes | human_review`. On `needs_fixes`, routes specific issues back to the relevant specialist agent with file:line context. Acceptance: a deliberately broken section is caught, routed to liquid-agent, and fixed in one cycle.

### M10 — Deployment agent

Encodes the 3-env workflow (`.claude/rules/git-workflow.md`) verbatim. Creates feature branch, commits with structured message, pushes, opens PR, posts preview URL comment, gates merge by env. Honors pair-review-required-for-staging-and-main. Acceptance: zero-touch from green validation → PR open with preview URL on a routine feature.

### M11 — Governance + observability

`.claude/logs/runs/<plan-id>.jsonl` JSONL append-only audit log (one record per agent step: input, tools called, output, timestamp). File-glob policy in `.claude/architecture/permissions.yml` enforced by the orchestrator. Rollback drill recorded as `runbooks/rollback.md` and exercised at least once before any unattended overnight runs. ADR-007 (permissions) and ADR-008 (logs) drafted in this milestone. Acceptance: a 5-step plan produces a complete JSONL trace; permissions.yml blocks an out-of-bounds write attempt.

### M12 — Phase-2 split + theme app extension support

**Conditional milestone.** Triggers when at least 2 of:

- planner-architect prompt is bloating past ~6k tokens or showing role confusion,
- two or more themes/stores share the orchestrator with conflicting implementations,
- 50+ plans logged with patterns that would benefit from splitting roles,
- a real feature genuinely needs Theme App Extension primitives.

Splits Planner ≠ Architect. Adds a parallel `extensions/` repo + agent flow for app-block development. ADR-009 drafted here.

---

## Authoring rules

- **Don't pre-spec milestones** — keep them as paragraphs in this README until you're about to start. Premature specs go stale.
- **One milestone, one PR** — never bundle. Even if M2 and M3 feel related, they ship separately.
- **Every spec follows the M0/M1 template:** Goal · Why · Scope (in/out) · Steps · Acceptance · Risks · Dependencies · Out of scope.
- **Close-out always touches the roadmap** — flip the milestone's status row to `Done` in `ROADMAP.md`.
