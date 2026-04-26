# M1 — Shopify AI Toolkit (Pattern A — Plugin Install)

**Status:** Not started. Ready to start once M0 merges.
**Effort:** S (1 day, mostly setup + smoke testing).
**Owner:** Rinaldo.
**Branch:** `feature/m1-toolkit-pattern-a`.
**PR target:** `development`.

---

## Goal

Get the [Shopify AI Toolkit](https://github.com/Shopify/Shopify-AI-Toolkit) plugin running in Claude Code so every interactive session can call `searchShopifyDocs`, `validateLiquid`, `searchAdminSchema`, etc. Verify the skills work against this repo. Document opt-in for any future contributors.

**Pattern A only.** Pattern B (declaring `@shopify/dev-mcp` in `.mcp.json` for autonomous orchestrator use) is deferred to M7 — see [ADR-002](../adr/ADR-002-mcp-server-wiring.md).

## Why

Right now, when an agent (or me) needs current Shopify docs, the only options are: (a) trust training data — stale, (b) WebFetch shopify.dev — slow + URL-fragile, (c) read a local copy — out of date. Pattern A solves all three by routing every Shopify question through Shopify's official skills, free, with auto-updates.

Day-1 ROI: every `/scope-feature` / `/plan-feature-implemenation` session benefits without changing those skills.

## Scope

In:

1. Install the Toolkit plugin in Claude Code (this user's machine).
2. Run a smoke-test conversation that exercises at least 3 Toolkit skills against this repo.
3. Write `.claude/architecture/m1-toolkit-quickstart.md` — a one-pager covering install commands, skills available, gotchas, and rollback.
4. Update `CLAUDE.md` with one new line under the "Shopify Dev MCP" stack section pointing to the quickstart.
5. Update ROADMAP.md M1 row to `Done`.
6. Append a project-log entry.

Out:

- `.mcp.json` at repo root — that's M7.
- Vendoring skills into `skills/shopify-toolkit/` (Pattern C) — deferred. Pattern A's plugin install gives us the same skills without the vendor cost.
- Cursor / Gemini CLI / Codex install — solo dev uses Claude Code only.
- Any code changes to existing sections, snippets, or settings.

## Implementation steps

### Step 1 — Install the plugin

Per [Toolkit README](https://github.com/Shopify/Shopify-AI-Toolkit), in Claude Code:

```
/plugin marketplace add Shopify/shopify-ai-toolkit
/plugin install shopify-plugin@shopify-ai-toolkit
```

Verify: a new section appears under available skills. Restart Claude Code if needed.

### Step 2 — Smoke tests

Run three tests in a fresh Claude Code session and capture the result lines for the quickstart doc:

| # | Test | Expected behavior |
|---|---|---|
| 1 | "Search Shopify docs for `recommendations.products` Liquid object" | Returns ≥1 result with `recommendations.products` documentation |
| 2 | Open `sections/section-new-hero.liquid`, ask "validate this Liquid file" | Returns Liquid validation report with no fatal errors |
| 3 | "Search Admin API schema for `MetafieldDefinition`" | Returns the GraphQL type definition with fields |

If any test fails, do **not** mark M1 done — debug or escalate first.

### Step 3 — Write `m1-toolkit-quickstart.md`

Content outline:

- **What it is** — 2-sentence Toolkit description.
- **Install** — exact commands (above).
- **Smoke tests** — the 3 above, with copy-pasteable prompts.
- **Skills available** — list returned by the plugin, with one-line each.
- **When to use which skill** — quick decision table.
- **Gotchas** — anything surfaced during smoke testing.
- **Uninstall / rollback** — `/plugin uninstall shopify-plugin`.

### Step 4 — Update `CLAUDE.md`

Add one line under the existing "Shopify Dev MCP" bullet:

> The Shopify AI Toolkit plugin is installed. See `.claude/architecture/m1-toolkit-quickstart.md` for the skills and how to invoke them.

### Step 5 — Close-out

- Update ROADMAP.md M1 row: `Status: Done`.
- Append project-log entry: what was installed, what skills are now available, gotchas.

## Acceptance criteria

- [ ] Plugin install commands run without error.
- [ ] All 3 smoke tests pass.
- [ ] `.claude/architecture/m1-toolkit-quickstart.md` exists and answers "how do I use this on day 1?" in under 100 lines.
- [ ] CLAUDE.md updated with the pointer.
- [ ] ROADMAP M1 marked `Done`.
- [ ] Project log entry added.
- [ ] PR `feature/m1-toolkit-pattern-a → development` opened and merged.

## Risks

- **Plugin scope creep** — Toolkit ships many skills; resist documenting all of them. Quickstart should focus on the 4–6 we'll actually invoke (docs search, Liquid validation, Admin schema search, theme bundle validation). The full list can stay one `/plugin list` away.
- **Skill name drift** — Toolkit may rename skills between versions. The quickstart should link to the Toolkit's own README, not duplicate skill definitions.
- **Authentication pitfalls** — some Toolkit features (store execute) need auth. Pattern A's plugin handles auth for interactive sessions, but if smoke test 3 (`searchAdminSchema`) needs auth and fails, document the auth setup as part of the quickstart rather than working around it.

## Dependencies

- M0 must be merged (so `.claude/architecture/` exists for the quickstart doc).
- Claude Code v2 or later (Toolkit's plugin marketplace requirement — verify before starting).

## Out of scope (recorded so they don't get forgotten)

- Vendoring skills (Pattern C) — only revisit if we ship a client-deliverable that pins to a Toolkit version.
- Adding `@shopify/dev-mcp` to `.mcp.json` — M7.
- Wiring Toolkit into a CI workflow — needs M3 (CI foundation) first.
