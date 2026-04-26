# Skill: Edit Liquid Section

## Description

Tier-2 orchestration skill. Reads an existing section file, applies a described change, validates via the Shopify Toolkit (`validateLiquid`), and writes the result. Used by the orchestrator's `liquid-agent` (M8) and by humans-in-Claude-Code for routine section edits.

This skill is for **edits to existing sections.** New sections still go through `/start-feature` → `/scope-feature` → `/plan-feature-implemenation`.

## When to Use

- A section needs a setting added/removed/renamed.
- A section's markup needs adjustment (a class, an attribute, a Liquid loop).
- A bug fix that's contained to one section file.

Don't use this for:

- Net-new sections — that's a feature, not an edit.
- Cross-section refactors — split into per-section invocations.
- Schema-only changes that touch other config (use `edit-config-json`).

## Inputs

- `file_path` (string, required) — path under `sections/` (e.g. `sections/section-new-hero.liquid`).
- `change_description` (string, required) — natural-language description of the desired change.
- `constraints` (string[], optional) — explicit dos and don'ts (e.g. "preserve all existing motion-element data attributes").
- `dry_run` (boolean, default `false`) — if true, return proposed content without writing.

## Process

1. **Read the file.** Capture current content + line count + schema settings.
2. **Read the theme analysis** for FoxTheme conventions (padding pattern, schema setting order, color_scheme handling).
3. **Generate updated content** that respects:
   - Existing structure (don't rewrite untouched sections).
   - Theme analysis conventions.
   - The user's constraints.
4. **Validate** the proposed content via Toolkit `validateLiquid`. If errors, attempt one auto-correction; if still failing, return the validation report and stop.
5. **Diff preview** — return a unified diff of `before` → `after` for confirmation.
6. **Write** (only if not `dry_run` AND validation passed).
7. **Re-validate** the on-disk file via `validateThemeBundle` to catch cross-file regressions (template references, snippet renders).
8. **Return** a structured observation.

## Output

```markdown
# Edit — <file_path>

## Change applied
<one-line summary>

## Diff
\`\`\`diff
<unified diff>
\`\`\`

## Validation
- validateLiquid: <pass/fail + summary>
- validateThemeBundle: <pass/fail + summary>

## Schema impact
- Settings added: <list>
- Settings removed: <list — flag risks>
- Settings renamed: <list — flag breaking change>

## Files NOT touched
- <enumerate adjacent files we considered but left alone>

## Watch-outs
- <any edge cases or follow-ups>
```

## Important Notes

- **Never rewrite the whole file** unless `change_description` explicitly demands it. Surgical edits only.
- **Schema-renames are breaking** for stores using the section. Surface this in `Watch-outs` with a migration note.
- **Don't introduce new global JS or CSS.** That's `edit-assets`'s job.
- **If `validateLiquid` fails on the existing file** (pre-edit), surface that as a baseline issue and ask whether to proceed.
- File-glob policy (M11): this skill only writes to `sections/**/*.liquid`. Calling it with any other path throws.

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# edit-liquid-section/SKILL.md — v1.0 (M6)
