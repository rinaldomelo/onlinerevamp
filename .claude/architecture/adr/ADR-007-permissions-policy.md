# ADR-007 — Per-Agent File-Glob Permissions Policy

- **Status:** Accepted
- **Date:** 2026-04-26
- **Deciders:** Rinaldo (solo dev)
- **Implements:** Milestone M11
- **Related:** ADR-005 (orchestrator stack), ADR-008 (observability logs)

---

## Context

The orchestrator (M7+) runs specialist agents that write to the theme repo. Without enforced boundaries:

- A buggy assets-agent might overwrite `sections/section-x.liquid`.
- A prompt-injected planner-architect might trick a specialist into writing `.env` or `.git/config`.
- A future contributor's new agent could touch `orchestrator/` itself, modifying its own runtime.

Until M11, file-glob enforcement is procedural — each harness has a regex array. Easy to forget, easy to bypass. We need centralized policy with hard refusal at the file-system boundary.

## Decision

**A single YAML policy file at `.claude/architecture/permissions.yml` defines per-agent globs. Every write attempted by an agent passes through `orchestrator/src/orchestrator/policy.ts::ensureCanWrite()` first. Mismatches throw `PolicyViolationError` before touching the file system.**

Concretely:

- `permissions.yml` is the source of truth. Each `agents.<name>` entry has `write_globs`, optional `read_globs`, optional `forbidden`.
- `global_forbidden` covers paths NO agent may touch (`.env`, `.git/`, `node_modules/`, `.claude/logs/`).
- `policy.ts` parses the YAML, exposes `ensureCanWrite(agent, path)`. Specialists call it before every write.
- The fs-tool wrappers in `orchestrator/src/tools/fs.ts` are the natural enforcement point — every `writeTheme` could route through `ensureCanWrite` once the calling agent name is plumbed through.
- Violations are logged via the M11 observability layer (ADR-008).

## Consequences

**Positive:**

- One file to audit / change. Adding a new agent or changing an existing agent's scope is a YAML diff, not a code diff.
- Hard refusal at the boundary — no "the harness should have known" failure modes.
- Policy violations show up in audit logs (`policy_violation` record kind), making post-mortems easy.
- Read by both code AND humans — the YAML is documentation as well as configuration.

**Negative:**

- Adds a runtime dependency on YAML parsing. M11 ships a tiny inline parser sufficient for the current shape; production should swap to `js-yaml`.
- Plumbing the calling agent name through every `writeTheme` requires a bit of refactoring (post-M11).
- A bug in the YAML parser is now in the load-bearing path. Mitigation: comprehensive policy.test.ts.

**Neutral:**

- The procedural enforcement in M8's specialists (regex globs in each harness) becomes redundant once policy.ts is wired everywhere. Leave it for defense-in-depth.

## Alternatives considered

| Alternative | Why rejected |
|---|---|
| **Keep procedural enforcement** | Per-harness regexes drift. Forgetting one is a security hole. |
| **Permissions in code, not YAML** | Code changes need PRs; YAML changes feel cheaper but should also need PRs (CODEOWNERS catches it). YAML wins on auditability. |
| **OS-level chroot / unshare** | Over-engineered for a single-user solo-dev orchestrator. Revisit if multi-tenant. |
| **Run agents in containers with bind mounts** | Same — premature for the use case. |

## Verification

- M11's `policy.smoke.test.ts` verifies a glob-violation throws.
- Manual smoke: deliberately call `ensureCanWrite("liquid", "config/settings_data.json")` → should throw.
- Periodic audit: run `grep "policy_violation" .claude/logs/runs/*.jsonl` after a run; expect 0 in normal operation.

## Migration path (if we ever supersede this)

If centralized policy proves too rigid (e.g. some legitimate edits want to escape):

1. Extend `permissions.yml` with named exceptions (`exceptions: [{ path, justification }]`).
2. If even that's too coarse, move to per-call ACLs (each PlanTask carries the writes it intends to make; planner-architect issues + signs them).
3. Mark this ADR `Superseded`.
