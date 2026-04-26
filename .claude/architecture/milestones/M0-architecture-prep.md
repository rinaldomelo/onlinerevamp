# M0 — Architecture Prep

**Status:** In progress (this PR).
**Effort:** XS (one session).
**Owner:** Rinaldo.
**Branch:** `chore/architecture-m0`.
**PR target:** `development`.

---

## Goal

Lock down the architectural decisions that govern M1–M12, write the durable artifacts (roadmap + ADRs + milestone index), and leave the repo ready for the actual infrastructure work in M1.

**No code, no `.mcp.json`, no GitHub Actions, no `package.json` are added in M0.** Only docs.

## Why

Without a written roadmap and ADRs, every subsequent milestone re-debates the same forks (Toolkit pattern, deploy method, language choice). M0 spends one session paying that cost once so M1+ can move fast.

## Scope

In:

- `.claude/architecture/ROADMAP.md` — canonical roadmap.
- `.claude/architecture/adr/ADR-001` through `ADR-005` — the five decisions worth recording before any code.
- `.claude/architecture/milestones/README.md` — index + one-paragraph stubs for M1–M12.
- `.claude/architecture/milestones/M0-architecture-prep.md` (this file).
- `.claude/architecture/milestones/M1-toolkit-mcp-wiring.md` — fully specced so M1 can start the moment M0 merges.
- One project-log entry in `.claude/context/OUTPUT-project-log.md` referencing the new architecture folder.

Out:

- `.mcp.json` (M7).
- `package.json`, `.theme-check.yml`, `shopify.theme.toml` (M2).
- `.github/workflows/*.yml` (M3–M5).
- `.claude/agents/`, `.claude/logs/` (M7+, M11).
- ADR-006 through ADR-009 (drafted in their owning milestones).
- Repo visibility flip (already scheduled — routine `trig_01J4JivG4bbvof1mUKeFHDB1` fires 2026-05-09).
- Vendoring the reference doc into `.claude/architecture/source/` — deferred to a follow-up; the source doc is already canonical at `~/Downloads/shopify-agentic-theme-system_1.md`.

## Files written in this PR

- `.claude/architecture/ROADMAP.md`
- `.claude/architecture/adr/ADR-001-shopify-ai-toolkit-pattern-a.md`
- `.claude/architecture/adr/ADR-002-mcp-server-wiring.md`
- `.claude/architecture/adr/ADR-003-shopify-cli-deploy.md`
- `.claude/architecture/adr/ADR-004-skills-tier-split.md`
- `.claude/architecture/adr/ADR-005-orchestrator-stack.md`
- `.claude/architecture/milestones/README.md`
- `.claude/architecture/milestones/M0-architecture-prep.md` (this file)
- `.claude/architecture/milestones/M1-toolkit-mcp-wiring.md`
- Edit: append entry to `.claude/context/OUTPUT-project-log.md`

## Acceptance criteria (exit M0 when all pass)

- [ ] All files above exist on `chore/architecture-m0` and are tracked by Git.
- [ ] Markdown renders cleanly in GitHub (tables, code blocks, links).
- [ ] Internal links between ROADMAP / ADRs / milestones resolve (no 404s).
- [ ] ADR-001..ADR-005 have status `Accepted` and a "Consequences" section.
- [ ] PR `chore/architecture-m0 → development` opened (solo dev: self-review by checking the rendered diff in the GitHub UI before merge).
- [ ] PR merged to `development`.
- [ ] Project log entry references the architecture folder by path.
- [ ] ROADMAP.md M0 row flipped to `Done` *after* merge (final close-out edit on a follow-up commit, or as part of M1's first PR).

## Risks

- **Architecture astronaut risk** — over-specifying decisions before evidence. Mitigation: ADR-006..009 stay deferred; only the five forks that actually block M1 get an ADR in M0.
- **Doc rot** — roadmap will go stale within weeks if it's not updated. Mitigation: every milestone closes by editing the roadmap status column. This is the "Project Log Protocol" rule (already in CLAUDE.md) extended to the roadmap.
- **Scope creep into M1** — easy to start "while I'm here" wiring `.mcp.json` or `package.json`. Mitigation: the deliverable checklist above is exhaustive; anything else goes into a follow-up branch.

## Suggested next step (post-merge)

Schedule M1 (`feature/m1-toolkit-pattern-a`). M1 is one session; M2 follows naturally.
