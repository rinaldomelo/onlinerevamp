# Skill: Edit Config JSON

## Description

Tier-2 orchestration skill. Surgical JSON edits to `templates/*.json`, `config/settings_data.json`, and `config/settings_schema.json`. Preserves untouched structure, validates JSON post-edit, and surfaces breaking changes (renamed keys, removed sections, settings type changes) in the response.

Used by the orchestrator's `config-agent` (M8) and by humans-in-Claude-Code for routine config changes.

## When to Use

- A new section is being registered in a template (`templates/*.json`).
- A theme setting is being added/removed from `config/settings_schema.json`.
- A `color_scheme`, `padding_top`, or other section setting needs adjustment in `config/settings_data.json`.

Don't use this for:

- Liquid section schema (the `{% schema %}` block) — that's `edit-liquid-section`.
- Mass renames across multiple JSON files — split per file.
- Locale JSON (`locales/*.json`) — different format, validate via Toolkit.

## Inputs

- `file_path` (string, required) — path under `templates/` or `config/`.
- `change_description` (string, required) — natural-language description of the change.
- `target_path` (string, optional) — JSON path expression for surgical edits (e.g. `sections.testimonials.settings.heading`).
- `dry_run` (boolean, default `false`).

## Process

1. **Read the file** as JSON. If it's invalid JSON on read, report and stop — don't try to "fix" it as a side effect.
2. **Apply the change** at the target path (or wherever the change_description points). Preserve key ordering where possible.
3. **Re-serialize** with 2-space indent (matches existing files). Trailing newline preserved.
4. **Validate** the new content parses as JSON.
5. **Validate cross-references**: if a section type is added to a template, confirm a matching `sections/<type>.liquid` exists. If a setting is removed, grep for usages.
6. **Diff preview** for confirmation.
7. **Write** if not `dry_run`.
8. **Call Toolkit `validateThemeBundle`** to catch theme-wide regressions.
9. Return structured observation.

## Output

```markdown
# Edit — <file_path>

## Change applied
<one-line summary; cite the JSON path>

## Diff
\`\`\`diff
<unified diff>
\`\`\`

## Validation
- JSON parse: <pass>
- Cross-reference: <list of confirmed targets, e.g. "sections/testimonials.liquid exists">
- validateThemeBundle: <pass/fail summary>

## Breaking-change risks
- Renamed keys: <flag any merchant-data implications>
- Removed sections from order: <flag merchant-visible drops>
- Settings type changes: <flag data migration needs>

## Files NOT touched
- <enumerate>
```

## Important Notes

- **Never reorder unrelated keys.** Only the change-target key may move.
- **Don't clobber `settings_data.json` deltas the merchant made in admin.** That file flows from admin → repo via theme push/pull cycles; treat it as data, not code.
- **Locale JSON files use lenient parsing** — Shopify accepts trailing commas there. Don't auto-correct trailing commas elsewhere.
- File-glob policy (M11): writes only to `templates/*.json`, `config/settings_data.json`, `config/settings_schema.json`. Other paths throw.
- For new sections being registered in `templates/*.json`, also confirm the section file's `disabled_on` config doesn't conflict.

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# edit-config-json/SKILL.md — v1.0 (M6)
