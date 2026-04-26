# ADR-006 — Combined Planner+Architect for Phase 1

- **Status:** Accepted
- **Date:** 2026-04-26
- **Deciders:** Rinaldo (solo dev)
- **Implements:** Milestone M7
- **Related:** ADR-005 (orchestrator stack), ADR-004 (skills tier split)

---

## Context

The reference architecture (`shopify-agentic-theme-system_1.md` §5.1) describes two distinct roles:

- **Planner** — workflow-centric: clarifies requirements, breaks work into tasks, dispatches to specialists, tracks dependencies. Doesn't need deep Shopify domain knowledge.
- **Architect** — Shopify-theme-centric: maps requests to theme primitives (sections, snippets, settings, templates), enforces conventions, produces technical implementation specs.

§5.2 explicitly recommends combining them into a single "Design & Plan" agent for Phase 1, then splitting when complexity grows: *"when you see conflicting implementations across the theme, increasing tech debt, or need to support multiple themes/stores."*

We are at Phase 1: solo dev, single theme, no conflicting implementations yet, no need to amortize architecture knowledge across projects.

## Decision

**For Phase 1, combine Planner + Architect into a single `planner-architect` agent.**

Concretely:

- One folder: `orchestrator/src/agents/planner-architect/`.
- One system prompt covering both responsibilities.
- One model call returning both Plan + ArchitectDesign in a single structured response.
- One harness handling theme-files inventory + Toolkit docs lookup + model call + persistence.

Splitting to two agents (`planner` + `architect`) becomes M12-conditional. See "When to split" below.

## Consequences

**Positive:**

- One prompt to maintain. Lower drift risk.
- Faster turnaround per FeatureRequest — single round-trip, no Plan-handoff-then-Design ping-pong.
- Simpler observability — one observation per feature for the planning layer, not two.
- Matches the source doc's Phase-1 recommendation directly.

**Negative:**

- Prompt grows over time as we encode both planning patterns AND theme conventions. Risks crossing the ~6k-token threshold where models start losing precision.
- Harder to test in isolation — can't mock "Architect output" while keeping "Planner output" honest.
- Conflating roles makes it harder to attribute bad outputs ("did the Plan misjudge dependencies, or did the Architect misread theme conventions?").

**Neutral:**

- Reversible. M12 has a documented split criteria; until then, the combined agent suffices.

## When to split (criteria for M12)

Split into two agents when **at least 2 of the following** are true:

1. **Prompt size exceeds ~6k tokens** consistently. Signal: planning details and architecture rules step on each other in the prompt.
2. **Multiple themes or stores share the orchestrator** and produce conflicting implementations.
3. **Recurring observation patterns** suggest a planning-vs-architecture mistake (e.g. plan order is right but file mapping is wrong, or vice versa) that would be cleanly addressed by separation.
4. **A specific feature** can't be cleanly handled by combined-prompt reasoning (e.g. cross-feature dependencies, multi-step revisions).

When that bar is met, the split is straightforward: extract the architect role into `orchestrator/src/agents/architect/`, slim the planner prompt down, add a hand-off contract (Plan → Architect → enriched Design).

## Alternatives considered

| Alternative | Why rejected |
|---|---|
| **Split now (Phase 2 from day 1)** | Premature complexity. Source doc explicitly warns against this. Single agent works for solo dev / single theme. |
| **Three-agent split** (Planner → Architect → Design Reviewer) | Over-engineering. The same model can do all three roles in sequence within one prompt for now. |
| **No agent — just a long skill** | Doesn't scale. Once we want autonomous loops with validation feedback (M9), prompts alone can't model the state machine. |

## Verification

- M7 ships the combined agent.
- After running it on 5+ feature requests, review observations for:
  - Did the Plan order tasks correctly? (Planner role health)
  - Did the Design map to the right files / settings? (Architect role health)
  - Did the prompt feel cramped? (Split-trigger early-warning)

## Migration path (when M12 fires)

1. Extract architecture rules from the combined prompt into `orchestrator/src/agents/architect/prompt.md`.
2. Slim the planner prompt to focus on workflow + dispatch.
3. Add a hand-off type: `Plan` from planner → enriched into `ArchitectDesign` by architect.
4. Workflow runner gets a new node between planner and specialists.
5. Update tests + observation routing.
6. Mark this ADR `Superseded` and link to the new ADR-XXX.
