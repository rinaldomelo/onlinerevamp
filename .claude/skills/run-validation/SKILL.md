# Skill: Run Validation

## Description

Tier-2 orchestration skill. Runs the full validation stack — Shopify Toolkit `validateThemeBundle` + `validateLiquid`, theme-check (M2 config), and (when wired) Lighthouse against the dev preview URL. Aggregates results into a single decision: `pass | needs_fixes | human_review`.

Used by the orchestrator's `validation-agent` (M9) and by humans-in-Claude-Code as a pre-PR sanity check.

## When to Use

- Right before opening a PR (sanity check).
- After applying a multi-file change.
- The orchestrator (M9) calls this between specialist agent edits and deployment.

Don't use this for:

- Single-file syntax checks — use Toolkit's `validateLiquid` directly.
- Performance benchmarking unrelated to a PR — Lighthouse has its own CLI.

## Inputs

- `files_touched` (string[], optional) — list of files changed. If omitted, validates the whole bundle.
- `preview_url` (string, optional) — for Lighthouse. Skips Lighthouse if absent.
- `lighthouse_threshold` (number, default `90`) — fail threshold for performance score.

## Process

1. **Tier-1: Shopify-native validation** (always runs).
   - `validateThemeBundle({ files: files_touched ?? <all theme files> })` via Toolkit.
   - For each `.liquid` file in `files_touched`, also call `validateLiquid`.

2. **Tier-2: theme-check** (M2 config).
   - Spawn `shopify theme check --config .theme-check.yml --output json`.
   - Parse JSON output. Map errors/warnings to file:line.

3. **Tier-3: Lighthouse** (optional, requires `preview_url`).
   - Run Lighthouse CI against the preview URL. 3 runs, take median.
   - Threshold: performance ≥ `lighthouse_threshold`. Accessibility ≥ 95. SEO ≥ 90.

4. **Decide.**
   - All pass → `pass`.
   - Tier-1 errors only → `needs_fixes`, route back to specialist agent with file:line.
   - Tier-2 errors that aren't auto-fixable, or any tier-3 regression > 5 points → `human_review`.
   - Anything ambiguous → `human_review`.

5. **Return** structured observation with all findings.

## Output

```markdown
# Validation Report — <timestamp>

## Decision
<pass | needs_fixes | human_review>

## Tier 1 — Shopify Toolkit
- validateThemeBundle: <pass/fail>; <error count>
- validateLiquid (per-file): <summary table>

## Tier 2 — theme-check
- Errors: <count>
- Suggestions: <count>
- Top findings: <list, file:line>

## Tier 3 — Lighthouse (if run)
- Performance: <score> (threshold <threshold>)
- Accessibility: <score>
- SEO: <score>
- Best-practices: <score>

## Routing
- Files needing liquid-agent: <list>
- Files needing config-agent: <list>
- Files needing assets-agent: <list>

## Human-review reasons
- <if any>
```

## Important Notes

- Tier-1 is mandatory; if Toolkit is unavailable (Pattern A not installed, MCP not wired), surface a `human_review` with reason "Toolkit unavailable" rather than skipping.
- Tier-2 respects `.theme-check.yml`. Don't bypass.
- Tier-3 is optional but warned-against-skipping if a `preview_url` is provided — Lighthouse drift is a real risk.
- "Routing" maps file globs to agents per the file-glob policy from M11. The validation skill does NOT do the actual edit — it just identifies which agent to route back to.
- If multiple tiers fail, return ALL findings, not just the first.

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# run-validation/SKILL.md — v1.0 (M6)
