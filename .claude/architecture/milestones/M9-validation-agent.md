# M9 — Validation Agent

**Status:** Code merged, awaiting verification. **Scaffold (theme-check shell-out is real; Toolkit + Lighthouse stubbed).**
**Effort:** M.
**Owner:** Rinaldo.
**Branch:** `feature/m9-validation-agent`.
**PR target:** `development`.

---

## Goal

Close the validation loop. Three tiers (Toolkit + theme-check + Lighthouse), one decision (`pass | needs_fixes | human_review`). On `needs_fixes`, route specific file:line issues back to the right specialist agent.

## Why

Without M9, M8 specialists can edit but no one checks the result. M9 is the gate between "specialists wrote something" and "deployment agent ships it" (M10).

## Scope

In:

- `orchestrator/src/agents/validation/{prompt.md, harness.ts, schema.ts, index.ts}`.
- `orchestrator/tests/validation.smoke.test.ts`.
- `harness.ts` real-shells `shopify theme check --output json`, parses, returns findings.
- Toolkit + Lighthouse paths stubbed (return `ran: false`); explicitly marked in code with TODOs.

Out:

- Wiring validation into the workflow runner — that's M9 close-out (a separate small commit) or M10's deployment loop.
- ADR-007 (permissions policy) — M11.

## Files in this PR

- `orchestrator/src/agents/validation/{prompt.md, harness.ts, schema.ts, index.ts}` (4 new)
- `orchestrator/tests/validation.smoke.test.ts` (new)
- `.claude/architecture/milestones/M9-validation-agent.md` (this file)
- `.claude/architecture/milestones/README.md` (M9 stub trimmed)
- `.claude/architecture/ROADMAP.md` (status row updated)
- `.claude/context/OUTPUT-project-log.md` (entry appended)

## Pre-flight (user actions to mark M9 Done)

- [ ] Merge M0–M8.
- [ ] `pnpm install` + `pnpm test` (validation smoke tests pass).
- [ ] Wire Toolkit calls inside `harness.ts` once MCP client is real (M7 close-out).
- [ ] Wire Lighthouse runner — recommend `@lhci/cli` invoked via shell; or a JS API call.
- [ ] Test routing: deliberately break a Liquid file, confirm validation returns `needs_fixes` with `routing[].agent === "liquid"`.

## Acceptance criteria

- [ ] All 4 files exist and parse.
- [ ] `runThemeCheck` actually shells out to `shopify theme check` and parses JSON output.
- [ ] Toolkit + Lighthouse failures fall through to `human_review` with explicit reasons (not silent skips).
- [ ] Smoke tests verify ValidationInput / ValidationOutput Zod shapes.
- [ ] PR merged to `development`.

## Risks

- **theme-check shell-out is fragile.** If Shopify CLI is missing or the JSON format changes, `runThemeCheck` returns `ran: false` and falls through to `human_review`. Better to fail loud than silently report `pass`.
- **Lighthouse is stubbed.** Without it, performance regressions ship. Mitigation: M5 prod deploy is human-gated with a 5-min wait timer; the validation agent doesn't directly drive prod.
- **Routing logic is naive.** Today, routing is empty `[]` — the harness doesn't yet know how to map a Liquid validation error to the liquid-agent. Real routing logic lands when M8 model calls return file-level error messages we can match.

## Dependencies

- M7 + M8 merged.
- Shopify CLI installed (for theme-check).
- Toolkit (Pattern A or B) for tier-1.
- Lighthouse runner (deferred until M9 close-out).

## Out of scope

- Actual Toolkit + Lighthouse wiring (TODO in harness).
- Routing logic (returns empty array today).
- ADR-007 (permissions) — M11.
- Theme files.
