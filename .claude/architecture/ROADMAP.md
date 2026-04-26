# Agentic Shopify Theme System — Roadmap

> Canonical roadmap for evolving this `.claude/`-based feature workflow into the agentic orchestration system described in the reference doc at `~/Downloads/shopify-agentic-theme-system_1.md` (vendoring into `.claude/architecture/source/` is a follow-up — see M0 spec).
>
> **Owner:** Rinaldo (`rinaldo@evosem.com`).
> **Status:** M0 in progress. M1+ scheduled but not started.
> **Last updated:** 2026-04-25.

---

## Why this exists

The repo currently has **zero CI**, no Shopify-native validation tooling, and no autonomous agent layer above the existing Claude Code skills. Every change ships on local trust. As the codebase grows (already past 67 custom elements, ~50 sections, 50 locales), the cost of manual validation, manual preview-URL sharing, and manual decision-tracking compounds.

This roadmap turns that situation around in **13 small, individually shippable milestones** (M0 → M12). Cheapest-and-highest-leverage first; the autonomous agent layer (M7+) is intentionally last because **agents without automated validation are worse than no agents at all**.

The deliverable structure is **doc-per-milestone, ADR-per-non-trivial-decision**, not a single big-bang implementation. Each milestone is its own PR.

---

## North star

```
            ┌─────────────────────────────────────────────────────────┐
            │  Human request: "Build feature X"                       │
            └──────────────────────┬──────────────────────────────────┘
                                   ▼
        ┌──────────────────────────────────────────────────────────┐
        │  Layer 1 — Intent (feature.md, brief, scoping)            │
        └──────────────────────┬───────────────────────────────────┘
                               ▼
        ┌──────────────────────────────────────────────────────────┐
        │  Layer 2 — Plan + Architect (combined for Phase 1)        │
        └──────────────────────┬───────────────────────────────────┘
                               ▼
        ┌──────────────────────────────────────────────────────────┐
        │  Layer 3 — Implementation specialists                     │
        │    Liquid agent · Config agent · Assets agent             │
        └──────────────────────┬───────────────────────────────────┘
                               ▼
        ┌──────────────────────────────────────────────────────────┐
        │  Layer 4 — Validation                                     │
        │   Shopify Dev MCP · theme-check · Lighthouse CI           │
        └──────────────────────┬───────────────────────────────────┘
                               ▼
        ┌──────────────────────────────────────────────────────────┐
        │  Layer 5 — Deployment                                     │
        │   Branch · PR · preview URL · 3-env promotion             │
        └──────────────────────┬───────────────────────────────────┘
                               ▼
        ┌──────────────────────────────────────────────────────────┐
        │  Layer 6 — Governance + observability                     │
        │   Audit logs · file-glob policy · rollback runbook        │
        └──────────────────────────────────────────────────────────┘
```

Today, Layers 1 and 2 exist as user-invoked skills and hand-authored docs. Layers 3–6 are built progressively in M2–M11.

---

## Milestones

| ID | Title | What ships | Effort | Status |
|---|---|---|---|---|
| **M0** | Architecture prep | This roadmap + ADR-001..ADR-005 + 2 milestone specs | XS | **In progress** |
| **M1** | Shopify AI Toolkit (Pattern A) | Plugin install + smoke test + opt-in one-pager | S | Skeleton merged, awaiting install |
| **M2** | Local validation guardrails | `package.json`, `.theme-check.yml`, `shopify.theme.toml` | S | Code merged, awaiting verification |
| **M3** | CI foundation | `.github/workflows/theme-check.yml`, secrets baseline, branch protection | M | Not started |
| **M4** | Preview-URL bot | `deploy-dev-preview.yml`, dev-theme rotation, PR comment | M | Not started |
| **M5** | Production deploy guardrails | `deploy-production.yml`, GitHub envs, rollback playbook | M | Not started |
| **M6** | Custom skills evolution (Tier 2) | New `.claude/skills/`: theme-inspect, liquid-edit, config-edit, assets-edit, validation, manage-feature-branch | M | Not started |
| **M7** | Planner+Architect agent | `.claude/agents/planner-architect/` via Agent SDK + `.mcp.json` (Pattern B) | L | Not started |
| **M8** | Specialist implementation agents | `liquid-agent`, `config-agent`, `assets-agent` as subagents | L | Not started |
| **M9** | Validation agent | Wraps Toolkit + theme-check + Lighthouse | M | Not started |
| **M10** | Deployment agent | Branch + PR + preview comment + merge gating | M | Not started |
| **M11** | Governance + observability | `.claude/logs/` JSONL audit, file-glob permissions, rollback drill | M | Not started |
| **M12** | Phase-2 split + extensions | Planner ≠ Architect; Theme App Extension support | L | Conditional (deferred until criteria met) |

**Effort key:** XS = hours, S = 1 day, M = 2-4 days, L = 1+ week. Solo-dev calendar.

Per-milestone specs live in `./milestones/`. Stubs for M2–M12 are in `milestones/README.md` and get fleshed out just-in-time when each milestone starts.

---

## ADR index

ADRs follow [Nygard format](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions). Status: `Proposed | Accepted | Superseded`.

| ID | Title | Status | Drafted in |
|---|---|---|---|
| [ADR-001](./adr/ADR-001-shopify-ai-toolkit-pattern-a.md) | Adopt Shopify AI Toolkit via Pattern A (plugin install) | Accepted | M0 |
| [ADR-002](./adr/ADR-002-mcp-server-wiring.md) | MCP server wiring via repo `.mcp.json` for `@shopify/dev-mcp` | Accepted (deferred to M7) | M0 |
| [ADR-003](./adr/ADR-003-shopify-cli-deploy.md) | Use Shopify CLI push (not GitHub integration) for deploys | Accepted | M0 |
| [ADR-004](./adr/ADR-004-skills-tier-split.md) | Two-tier skills strategy: Toolkit (Tier 1) + custom Tier 2 | Accepted | M0 |
| [ADR-005](./adr/ADR-005-orchestrator-stack.md) | Orchestrator stack: TypeScript + Anthropic Agent SDK | Accepted | M0 |
| ADR-006 | Combined Planner+Architect for Phase 1 (criteria for splitting) | TBD | M7 |
| ADR-007 | Permissions / file-glob policy per agent | TBD | M11 |
| ADR-008 | Observability logs: JSONL append-only at `.claude/logs/` | TBD | M11 |
| ADR-009 | Theme App Extension support — boundary between theme repo and app repo | TBD | M12 |

---

## Doc tree (target end-state)

```
.claude/
├── architecture/                        # this folder
│   ├── ROADMAP.md                       # ← you are here
│   ├── adr/                             # decision records
│   ├── milestones/                      # M0..M12 specs
│   └── source/agentic-architecture.md   # (deferred) vendored copy of the reference doc
├── agents/                              # populated starting M7
│   ├── README.md
│   └── planner-architect/{spec.md, prompt.md, tools.md, tests/}
├── logs/                                # populated starting M11
│   └── runs/<plan-id>.jsonl
├── skills/                              # extended in M6
│   ├── (existing) onboard-theme, start-feature, scope-feature, plan-feature-implemenation
│   └── (M6) inspect-theme, edit-liquid-section, edit-config-json, edit-assets, run-validation, manage-feature-branch
├── rules/                               # unchanged
├── context/                             # unchanged
└── features/                            # unchanged
```

Repo-root additions, by milestone:

```
M2  → package.json, .theme-check.yml, shopify.theme.toml
M3  → .github/workflows/theme-check.yml, .env.example
M4  → .github/workflows/deploy-dev-preview.yml
M5  → .github/workflows/deploy-production.yml, .github/CODEOWNERS
M7  → .mcp.json
M11 → .claude/architecture/permissions.yml, runbooks/
```

---

## How to read this roadmap

- **Working on a milestone?** Read `milestones/M<n>-*.md` — it's the canonical "what + why + acceptance" for that slice.
- **Want context on a decision?** Read the ADR. The "Consequences" section is the part that matters years from now.
- **Don't see your milestone?** Either it hasn't been spec'd yet (stub in `milestones/README.md`) or it's deferred by criteria (M12).
- **Adding a milestone?** Don't renumber. Insert as `M11.5-*.md` or push to `M13+`.

---

## Decisions confirmed in this session

| Decision | Resolution |
|---|---|
| Doc location | `.claude/architecture/` in this repo. Sibling orchestrator repo deferred to M12 if/when complexity demands. |
| Toolkit pattern priority | Pattern A first in M1 (plugin install). Pattern B (`.mcp.json` for autonomous orchestrator) deferred to M7. |
| Migration platform (source doc §15.5) | Out of scope for this roadmap. Migration gets its own roadmap when prioritized. |
| Orchestrator language | TypeScript (see ADR-005). Reversible if Python ergonomics win at M7. |

---

## Source material

- `~/Downloads/shopify-agentic-theme-system_1.md` — the reference architecture doc. Vendoring into `.claude/architecture/source/agentic-architecture.md` is deferred (out of scope per M0 spec); revisit if other contributors join.
- [Shopify AI Toolkit](https://github.com/Shopify/Shopify-AI-Toolkit) — official Shopify agent plugin.
- [Anthropic Agent SDK](https://docs.claude.com/api/agent-sdk-overview) — TypeScript SDK powering the orchestrator from M7.
- `.claude/CLAUDE.md` — the existing harness instructions; the orchestrator must respect these.
- `.claude/rules/git-workflow.md` — the canonical 3-environment promotion flow; the deployment agent (M10) must encode it verbatim.

---

## Trigger criteria for M12 (split + extensions)

M12 fires when **at least 2 of the following** are true:

- Planner+Architect prompt exceeds ~6k tokens or shows confused responsibility (signals a split is overdue).
- Two or more themes/stores share the orchestrator and start producing conflicting implementations.
- > ~50 plans logged to `.claude/logs/`, with patterns suggesting persistent coordination friction.
- A specific feature genuinely needs Theme App Extension primitives (cross-store dynamic widgets, app-data-driven UI).

Until then, M12 stays parked.

---

*This roadmap is a living document. Edit it directly; commit messages explain the why.*
