# M6 — Tier-2 Custom Skills

**Status:** Code merged, awaiting verification (PR open).
**Effort:** M.
**Owner:** Rinaldo.
**Branch:** `feature/m6-tier2-skills`.
**PR target:** `development`.

---

## Goal

Six new Tier-2 skills under `.claude/skills/` that codify the recurring procedures we currently do by hand. Each is a `SKILL.md` document describing inputs, process, output, and policy boundaries. Usable by humans-in-Claude-Code today and invokable by the orchestrator agents in M7+.

## Why

Per ADR-004, Tier 1 = Shopify AI Toolkit (don't reimplement); Tier 2 = our orchestration. The four existing skills (`onboard-theme`, `start-feature`, `scope-feature`, `plan-feature-implemenation`) cover the *process* layer. M6 adds the *operational* layer: inspecting, editing, validating, and shipping theme code.

## Scope

In:

- `inspect-theme/SKILL.md` — feature description → relevant files map.
- `edit-liquid-section/SKILL.md` — surgical edits to `sections/*.liquid` + Toolkit validation.
- `edit-config-json/SKILL.md` — surgical edits to `templates/*.json` + `config/*.json`.
- `edit-assets/SKILL.md` — CSS/JS edits with idempotency.
- `run-validation/SKILL.md` — orchestrates Toolkit + theme-check + (optional) Lighthouse, returns routed decision.
- `manage-feature-branch/SKILL.md` — encodes 3-env git workflow into a callable procedure.
- M6 milestone spec.

Out:

- Implementing the skills (they're SKILL.md docs; the orchestrator agents in M7+ are the consumers that turn description into action).
- Touching existing skills.
- Adding new entries to the `_template/` feature folder.

## Files in this PR

- `.claude/skills/inspect-theme/SKILL.md` (new)
- `.claude/skills/edit-liquid-section/SKILL.md` (new)
- `.claude/skills/edit-config-json/SKILL.md` (new)
- `.claude/skills/edit-assets/SKILL.md` (new)
- `.claude/skills/run-validation/SKILL.md` (new)
- `.claude/skills/manage-feature-branch/SKILL.md` (new)
- `.claude/architecture/milestones/M6-tier2-skills.md` (this file)
- `.claude/architecture/milestones/README.md` (M6 stub trimmed)
- `.claude/architecture/ROADMAP.md` (status row updated)
- `.claude/context/OUTPUT-project-log.md` (entry appended)

## Pre-flight (user actions to mark M6 Done)

- [ ] Merge M0–M5.
- [ ] Test one skill manually in a Claude Code session — e.g. invoke `inspect-theme` with a real feature description and verify the output is useful.
- [ ] Update `CLAUDE.md` to list the new skills under "Skills" section (one-line each).
- [ ] Decide whether to expose any skill via `/<skill-name>` command (most are agent-facing; only `inspect-theme` is interactive-friendly).

## Acceptance criteria

- [ ] All 6 SKILL.md files follow the existing format (mirrors `scope-feature/SKILL.md`).
- [ ] Each skill has Description / When to Use / Inputs / Process / Output / Important Notes sections.
- [ ] File-glob policy is stated in the skills that write files (M11 enforces, M6 documents).
- [ ] Each skill cites which agent (M7+) will consume it.
- [ ] Each skill is read-only or scoped tightly enough that a human or agent could invoke it without surprises.
- [ ] PR merged to `development`.

## Risks

- **Skill drift over time.** Theme conventions change; skills citing FoxTheme specifics become stale. Mitigation: M6 references `OUTPUT-initial-theme-analysis.md` rather than redocumenting; regenerate the analysis when the theme is vendor-updated.
- **Tier overlap with Toolkit.** `validateLiquid` is Tier 1; `run-validation` is Tier 2 wrapping Tier 1. The boundary feels fuzzy. Mitigation: the skills explicitly delegate to Toolkit calls — they don't duplicate validation logic.
- **Read-only vs. write skills.** `inspect-theme` is read-only; the four edit skills write. File-glob policies (M11) enforce that an agent calling `edit-liquid-section` can't also write to `assets/` by accident. Until M11, this is convention-only.
- **Skills are docs, not code.** The SKILL.md files describe what a procedure does; the *implementation* of those procedures lives in the M7+ agent harnesses. A skill without a calling agent is just a doc.

## Dependencies

- ADR-004 (skills tier split).
- `.claude/skills/scope-feature/SKILL.md` (template for format).
- `.claude/context/OUTPUT-initial-theme-analysis.md` (skills reference theme conventions).

## Out of scope

- Implementing the skill behaviors in code (M7–M10).
- Skill-discovery UI / catalog (`/help skills` style command).
- Skill versioning or migration tooling.
- Adding new entries to `.claude/skills/` beyond the 6 specified.
