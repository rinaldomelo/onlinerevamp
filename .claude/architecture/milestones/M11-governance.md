# M11 — Governance + Observability

**Status:** Code merged, awaiting verification. **Scaffold (policy + logger files real, full wiring pending).**
**Effort:** M.
**Owner:** Rinaldo.
**Branch:** `feature/m11-governance`.
**PR target:** `development`.

---

## Goal

Centralized file-glob policy for every agent (`permissions.yml` + `policy.ts`) and JSONL append-only audit logging (`.claude/logs/runs/<plan-id>.jsonl` + `logger.ts`). Plus orchestrator-rollback runbook.

## Why

Without governance:
- Specialists can write outside their lane (today, only procedurally enforced — easy to forget).
- Bad runs leave no trace.
- Credential leaks have no audit.

M11 wraps the orchestrator in the safety belt that makes any unattended run defensible.

## Scope

In:

- `.claude/architecture/permissions.yml` — central policy.
- `orchestrator/src/orchestrator/policy.ts` — loader + enforcer.
- `orchestrator/src/orchestrator/logger.ts` — JSONL append-only.
- `.claude/logs/.gitignore` + `.claude/logs/runs/.gitkeep` — directory exists in repo, content is local.
- `runbooks/orchestrator-rollback.md` — 4 scenarios with timed fixes.
- `.claude/architecture/adr/ADR-007-permissions-policy.md`.
- `.claude/architecture/adr/ADR-008-observability-logs.md`.
- `orchestrator/tests/policy.smoke.test.ts`.
- `minimatch` added to `orchestrator/package.json` deps.

Out:

- Wiring `ensureCanWrite` into every `writeTheme` call — needs the calling agent name plumbed through, lands as part of M8 close-out.
- JSONL exporter to external observability platform (deferred; not needed for solo dev).
- Auto-rotation of logs (manual quarterly; documented).
- Secret-redaction unit tests (TODO — added when full M11 wiring lands).

## Files in this PR

- `.claude/architecture/permissions.yml` (new)
- `.claude/architecture/adr/ADR-007-permissions-policy.md` (new)
- `.claude/architecture/adr/ADR-008-observability-logs.md` (new)
- `.claude/architecture/milestones/M11-governance.md` (this file)
- `.claude/architecture/milestones/README.md` (M11 stub trimmed)
- `.claude/architecture/ROADMAP.md` (status row updated; ADRs 7+8 listed)
- `.claude/logs/.gitignore` (new)
- `.claude/logs/runs/.gitkeep` (new — empty)
- `runbooks/orchestrator-rollback.md` (new)
- `orchestrator/src/orchestrator/policy.ts` (new)
- `orchestrator/src/orchestrator/logger.ts` (new)
- `orchestrator/tests/policy.smoke.test.ts` (new)
- `orchestrator/package.json` (minimatch dep added)
- `.claude/context/OUTPUT-project-log.md` (entry appended)

## Pre-flight (user actions to mark M11 Done)

- [ ] Merge M0–M10.
- [ ] `cd orchestrator && pnpm install` — pulls minimatch.
- [ ] `pnpm test` — policy.smoke.test verifies module shapes load.
- [ ] Plumb `ensureCanWrite(agent, path)` into every `writeTheme` call in the specialist harnesses (post-merge follow-up).
- [ ] Run a deliberate policy-violation smoke test: invoke `liquid` agent against `assets/foo.css`. Expect `PolicyViolationError`.
- [ ] Add a JSONL log emission to the workflow runner before/after each `dispatchTask` call.
- [ ] **Schedule the first quarterly rollback drill.** Pick a date, walk through `runbooks/orchestrator-rollback.md` Scenario A end-to-end against a throwaway PR.
- [ ] (Pre-launch) Replace inline YAML parser in `policy.ts` with `js-yaml` once the orchestrator is hot.

## Acceptance criteria

- [ ] `permissions.yml` covers all 6 agents (planner-architect, liquid, config, assets, validation, deployment).
- [ ] `global_forbidden` blocks `.env`, `.git/`, `node_modules/`, `.claude/logs/`.
- [ ] `policy.ts::ensureCanWrite` throws `PolicyViolationError` on mismatch.
- [ ] `logger.ts::logRecord` appends one JSONL line per call.
- [ ] `.claude/logs/runs/.gitkeep` ensures the directory exists in the repo; `.gitignore` keeps real logs out.
- [ ] ADR-007 + ADR-008 status `Accepted`, with Consequences + Migration paths.
- [ ] Rollback runbook covers ≥3 scenarios with timing estimates.
- [ ] PR merged to `development`.

## Risks

- **Inline YAML parser** is a homegrown subset. Bug risk. Mitigation: replace with `js-yaml` post-merge; documented as a TODO.
- **Calling agent name plumbing** isn't yet done — `writeTheme` doesn't know which agent invoked it. Until plumbed, policy enforcement happens at the harness boundary, not the fs boundary. Defense-in-depth (regex globs in harness + central policy) covers the gap.
- **JSONL secret hygiene.** Logger doesn't yet redact secrets. A leak via log payload is plausible. Tests for redaction land in a follow-up commit.
- **Log retention is manual.** Without rotation, `.claude/logs/runs/` grows without bound. Quarterly cleanup is on the user.

## Dependencies

- M0–M10 merged.
- `minimatch` resolved by `pnpm install`.

## Out of scope

- Plumbing `ensureCanWrite` into specialists (M8 close-out follow-up).
- JSONL exporter to external platform.
- Auto-rotation.
- Secret redaction unit tests (follow-up).
- Theme files.
- M12 (conditional, not entered).
