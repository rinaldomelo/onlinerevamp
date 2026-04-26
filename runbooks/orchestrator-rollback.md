# Runbook — Orchestrator Rollback

> Different from `runbooks/rollback.md` (which covers production theme rollbacks). This runbook is for when the *orchestrator itself* (M7+ TypeScript code) ships a bad change to the repo.

---

## Scenarios

### Scenario A — orchestrator opened a bad PR

The deployment agent (M10) opened a PR to `development` with code the user doesn't want.

**Fix (~30 seconds):**

1. Close the PR via GitHub UI.
2. Delete the feature branch: `git push --delete origin feature/<name>` (or via the PR's "delete branch" button).
3. Inspect `.claude/logs/runs/<plan-id>.jsonl` — confirm what happened.
4. If repeatable, file an issue describing the prompt/input that produced the bad output.

### Scenario B — orchestrator violated permissions.yml

`PolicyViolationError` thrown mid-run. The orchestrator should have refused to write but made it through somehow (bug in policy.ts).

**Fix (~5 minutes):**

1. Check the JSONL log — find the `policy_violation` record (or the absence thereof if the bug let it through).
2. Inspect the file the orchestrator touched. Revert with `git restore <path>`.
3. **Patch policy.ts** to close the loophole. Add a unit test that fails before the fix, passes after.
4. Open a fix PR.

### Scenario C — orchestrator credentials leaked

`ANTHROPIC_API_KEY` or `GITHUB_TOKEN` shows up in logs, commits, or PR bodies.

**Fix (~10 minutes):**

1. **Revoke immediately.** Anthropic Console → revoke the API key. GitHub → Settings → Developer settings → Personal access tokens → revoke.
2. Audit recent orchestrator runs in `.claude/logs/runs/` for any other secret exposure.
3. Generate fresh credentials. Update local `.env` and any GitHub secrets.
4. **Patch the leak source.** Most likely: a log statement included an env var. Add a test that fails if the JSONL contains anything matching `/sk-ant-/` or `/ghp_/`.
5. Force-rotate if anyone outside the dev team had access to the leaked log.

### Scenario D — orchestrator stuck in a loop

Validation returns `needs_fixes`, specialist edits, validation still returns `needs_fixes`. Repeat.

**Fix (~immediate):**

1. **Kill the process.** `Ctrl+C` if interactive. `kill <pid>` if backgrounded.
2. Check the JSONL log for the failing validation finding — is it the same finding each cycle? If yes, the specialist isn't applying the fix correctly. If no, the validation is finding new errors as edits land — same root cause.
3. **Add a max-iterations guard** to the workflow runner (currently absent — file a follow-up to add it). Recommended cap: 3 cycles.
4. Open an issue with the JSONL excerpt for triage.

## Pre-flight before any unattended run

- [ ] Most-recent permissions.yml unit tests pass.
- [ ] No credentials in `.env` that aren't expected.
- [ ] Latest JSONL log from a successful run reviewed; no anomalies.
- [ ] Working tree clean — `git status` shows nothing.
- [ ] On a feature branch, not main/staging/development.

## See also

- [`runbooks/rollback.md`](./rollback.md) — production theme rollback.
- [`.claude/architecture/permissions.yml`](../.claude/architecture/permissions.yml) — agent file-glob policy.
- [`.claude/architecture/adr/ADR-007-permissions-policy.md`](../.claude/architecture/adr/ADR-007-permissions-policy.md) — policy rationale.
- [`.claude/architecture/adr/ADR-008-observability-logs.md`](../.claude/architecture/adr/ADR-008-observability-logs.md) — log format + retention.
