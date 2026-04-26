# ADR-008 — Observability Logs: JSONL at `.claude/logs/runs/<plan-id>.jsonl`

- **Status:** Accepted
- **Date:** 2026-04-26
- **Deciders:** Rinaldo (solo dev)
- **Implements:** Milestone M11
- **Related:** ADR-007 (permissions policy)

---

## Context

The orchestrator's autonomous loops can be hard to debug post-hoc. Without structured logging:

- "Why did the deployment agent open this PR?" — no trace.
- "Did validation actually run before deploy?" — no proof.
- "Where did this credential leak come from?" — no audit.

Standard log files (free-form text) are searchable but not analyzable. Standard observability platforms (Datadog, Honeycomb) are overkill for a solo-dev orchestrator and add a third-party dependency.

JSONL — one JSON record per line, append-only — is the sweet spot: structured enough to query with `jq`, simple enough to never fail, runs offline, no infra.

## Decision

**Every agent step writes one JSONL record to `.claude/logs/runs/<plan-id>.jsonl`. The file is append-only, gitignored (`.claude/logs/.gitignore`), and per-plan.**

Record shape:

```ts
{
  ts: string,           // ISO 8601, UTC
  planId: string,
  agent: string,
  taskId?: string,
  kind: "agent_call" | "agent_observation" | "policy_violation" | "decision" | "error",
  payload?: unknown,    // input to the call
  observation?: unknown, // output / observation
  error?: string
}
```

Implementation:

- `orchestrator/src/orchestrator/logger.ts::logRecord()` is the single write point.
- The workflow runner emits `agent_call` before invoking each specialist, `agent_observation` after.
- `policy.ts` emits `policy_violation` before throwing.
- Validation agent emits `decision` records.

## Consequences

**Positive:**

- Append-only — no risk of losing history.
- JSONL — `jq '.kind == "policy_violation"' .claude/logs/runs/*.jsonl` answers most post-mortems instantly.
- Per-plan files — easy to share a single run for triage; easy to delete a stale one.
- Gitignored — no secrets in commit history. (Combined with secret-redaction tests; see ADR-007.)
- No external infra — solo dev, no SaaS.

**Negative:**

- File-system writes per agent step. For a 50-task plan, that's 50+ writes. Negligible at our scale (writes are <1KB).
- No central aggregation. To compare across plans, the user reads multiple files. Acceptable for solo dev; revisit for team.
- Retention is manual — no auto-rotation. Document quarterly cleanup.

**Neutral:**

- JSONL is universally readable (Bash, Python, Node, anything). Future tooling integrates trivially.

## Alternatives considered

| Alternative | Why rejected |
|---|---|
| **Free-form log files** | Hard to query. Don't survive grep across plans. |
| **SQLite via better-sqlite3** | Overkill for write-heavy / read-rarely workload. Adds a binary dep. |
| **External observability (Datadog/Honeycomb)** | Solo dev, no value justifying the cost. |
| **stdout + journalctl** | Tied to the host's logging infra. Doesn't follow the repo. |
| **Structured logs in JSON-objects-per-file (.json)** | Not append-safe. JSONL is. |

## Retention

- Keep all runs for 90 days. After that, archive to a `.claude/logs/archive/` (also gitignored) or delete.
- Delete immediately if a credential leak is suspected and the log might contain it.
- Don't commit logs to the repo. Period.

## Secret hygiene

- The logger MUST NOT emit env vars or any prefix matching `sk-ant-`, `ghp_`, `glpat_`, etc.
- M11 close-out adds a unit test that runs the logger against a payload containing a known fake secret pattern and asserts the JSONL output doesn't contain it.

## Verification

- M11's `policy.smoke.test.ts` verifies the logger produces JSONL.
- Manual: run an orchestrator iteration, check the JSONL is parseable line-by-line.
- Quarterly: review log retention; archive or delete > 90 days.

## Migration path (if we ever supersede this)

If the user joins a team or scales beyond solo:

1. Add a JSONL → external-platform exporter (Datadog ingest, S3 sink, etc.).
2. Keep the local JSONL as the canonical write path; the exporter is downstream.
3. Mark this ADR `Superseded` only when the local JSONL stops being authoritative.
