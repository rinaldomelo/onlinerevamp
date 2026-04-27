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
| M7 | [M7-planner-architect.md](./M7-planner-architect.md) | Spec ready (PR open) |
| M8 | [M8-specialist-agents.md](./M8-specialist-agents.md) | Spec ready (PR open) |
| M9 | [M9-validation-agent.md](./M9-validation-agent.md) | Spec ready (PR open) |
| M10 | [M10-deployment-agent.md](./M10-deployment-agent.md) | Spec ready (PR open) |
| M11 | [M11-governance.md](./M11-governance.md) | Spec ready (PR open) |
| M12 | *Not yet specced* | Conditional / deferred (Theme App Extension only) |
| M13 | [M13-planner-architect-split.md](./M13-planner-architect-split.md) | Spec ready (PR open) |

---

## Milestone stubs (just-in-time, expand into full specs when starting)

(M0 and M1 specs are full files; see index above. Stubs below are M2–M12.)

### M12 — Theme App Extension support

**Conditional milestone, scope-narrowed 2026-04-27.** Originally bundled the Phase-2 Planner/Architect split, which was pulled forward into M13. M12 is now solely about Theme App Extensions.

Triggers when:

- A real feature genuinely needs Theme App Extension primitives (cross-store dynamic widgets, app-data-driven UI).

Adds a parallel `extensions/` repo + agent flow for app-block development. ADR-009 drafted here when M12 enters scope.

---

## Authoring rules

- **Don't pre-spec milestones** — keep them as paragraphs in this README until you're about to start. Premature specs go stale.
- **One milestone, one PR** — never bundle. Even if M2 and M3 feel related, they ship separately.
- **Every spec follows the M0/M1 template:** Goal · Why · Scope (in/out) · Steps · Acceptance · Risks · Dependencies · Out of scope.
- **Close-out always touches the roadmap** — flip the milestone's status row to `Done` in `ROADMAP.md`.
