# ADR-001 — Adopt Shopify AI Toolkit via Pattern A (Claude Code plugin)

- **Status:** Accepted
- **Date:** 2026-04-25
- **Deciders:** Rinaldo (solo dev)
- **Implements:** Milestone M1
- **Related:** ADR-002 (MCP wiring), ADR-004 (skills tier split)

---

## Context

The [Shopify AI Toolkit](https://github.com/Shopify/Shopify-AI-Toolkit) is Shopify's official agent plugin. It ships pre-built skills for docs search, Admin/Storefront API schema search, Liquid validation, GraphQL validation, UI extension validation, and a `@shopify/dev-mcp` MCP server exposing the same capabilities. Three integration patterns are documented:

- **Pattern A** — Install as a plugin in Claude Code / Cursor / Gemini CLI / Codex / VS Code. Skills available immediately in interactive sessions. Auto-updates.
- **Pattern B** — Wire the Dev MCP server into a project's `.mcp.json`. Required when an autonomous orchestrator (not a human IDE) needs the skills.
- **Pattern C** — `npx skills add ...` to vendor specific skills into the repo at a pinned version. Useful for client deliverables that need reproducibility.

The reference architecture (`shopify-agentic-theme-system_1.md` §15.4) recommends "all three at appropriate layers." For a solo dev who works exclusively in Claude Code, that's overkill on day 1.

## Decision

**Adopt Pattern A as the day-1 integration. Defer Pattern B to M7. Skip Pattern C unless a client deliverable demands version-pinning.**

Concretely:

1. In M1, install the Toolkit plugin in Claude Code via `/plugin marketplace add Shopify/shopify-ai-toolkit` + `/plugin install shopify-plugin@shopify-ai-toolkit`.
2. Verify three smoke tests pass (docs search, Liquid validation, Admin schema search).
3. Document opt-in at `.claude/architecture/m1-toolkit-quickstart.md`.
4. Do **not** add `.mcp.json` to the repo in M1. That's Pattern B's job, scheduled when the autonomous orchestrator (M7) actually needs to call MCP tools programmatically.
5. Do **not** vendor skills into `skills/shopify-toolkit/`. The Toolkit auto-updates; freezing a copy creates rot.

## Consequences

**Positive:**

- Day-1 ROI: every interactive `/scope-feature`, `/plan-feature-implemenation`, and ad-hoc Claude Code session immediately benefits from current Shopify docs and validation. No code changes required to existing skills.
- Smaller M1 scope. One install command + smoke tests + a quickstart doc, vs. parallel work on plugin + MCP wiring + vendored copy.
- Toolkit's own auto-update mechanism keeps us current without us writing a refresh process.
- Cleaner skill boundaries: ADR-004's two-tier split stays valid because Tier 1 is just "whatever the plugin provides."

**Negative:**

- The autonomous orchestrator (M7+) cannot call Toolkit skills until Pattern B is added. We accept this trade-off because the orchestrator is months away.
- Plugin-based install is per-machine. If a future contributor joins, they need to run the install themselves. Mitigation: documented in `m1-toolkit-quickstart.md` and referenced from `CLAUDE.md`.
- Skill names and signatures may shift with Toolkit updates. Our docs link to the Toolkit's own README rather than redocumenting; if names drift, the link still works.

**Neutral:**

- Pattern A and Pattern B are not mutually exclusive — adding `.mcp.json` later doesn't invalidate the plugin install. Both can coexist (and likely will, post-M7).

## Alternatives considered

| Alternative | Why rejected |
|---|---|
| **Pattern B first** (skip plugin, wire `.mcp.json` now) | Doubles M1 scope and gives no day-1 user-visible benefit. The orchestrator that would call MCP doesn't exist yet, so we'd be building infra ahead of demand. |
| **Pattern C** (vendor specific skills now) | Loses auto-update. Useful only for shipping client deliverables that need to be reproducible across environments — not our situation. |
| **All three patterns in M1** | Front-loads cost. Hard to debug if something breaks. Better to layer: A → B → (C if needed). |
| **Skip Toolkit, build our own validation** | Massive duplicated effort against a free, official, auto-updating product. Only reasonable if the Toolkit's terms or behavior become incompatible — they aren't. |

## Migration path (if we ever supersede this)

If the Toolkit changes in a way that breaks our usage, or if the project moves to a non-Claude-Code editor, we'd:

1. Capture the current skill list and our most-used calls in a doc.
2. Either pin to a Pattern C vendored copy, or implement a thin Tier-2 skill wrapper around `WebFetch shopify.dev` for docs search and `theme-check` for validation.
3. Mark this ADR `Superseded by ADR-XXX`.

## Verification (Pattern A is "working")

- `/plugin list` includes `shopify-plugin`.
- "Search Shopify docs for `recommendations.products`" returns ≥1 result with documentation.
- Validating a known-good Liquid file returns no fatal errors.
- Validating a deliberately broken Liquid file (e.g. unmatched `{% if %}`) returns an error with file/line.
