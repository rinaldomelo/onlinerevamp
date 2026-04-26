# Skill: Inspect Theme

## Description

Tier-2 orchestration skill. Given a feature description (or a partial idea), returns a structured map of the theme assets relevant to that feature: which sections, snippets, templates, settings, and translation keys are likely involved. Used by the planner-architect agent (M7+) before any code is written, and by humans-in-Claude-Code as a quick "where would this live?" lookup.

This skill **calls** Tier-1 Shopify Toolkit skills (`searchShopifyDocs`, `validateThemeBundle`) for canonical info; it does NOT duplicate them.

## When to Use

- A new feature is being scoped — feed the rough description and see what's already in the theme.
- A bug is reported in vague terms — narrow it to specific files.
- Before running `/scope-feature` or `/plan-feature-implemenation`, if the theme analysis hasn't been touched in a while.
- The orchestrator agent (M7+) calls this as the first step of every plan.

## Inputs

- `feature_description` (string, required) — natural-language description of what's being built or investigated.
- `target_pages` (string[], optional) — page types: `home`, `product`, `collection`, `cart`, `customer`, `blog`, etc.
- `keywords` (string[], optional) — domain terms the user already knows (e.g. `recommendations`, `metafield`, `slider`).

## Process

1. **Read the theme analysis** at `.claude/context/OUTPUT-initial-theme-analysis.md`. If it doesn't exist, suggest running `/onboard-theme` first.
2. **Map keywords to file paths.** Combine the inputs with grep across `sections/`, `snippets/`, `templates/`, `config/settings_schema.json`, `locales/en.default.json`. Build a relevance score per file.
3. **Resolve template references.** For each candidate `templates/*.json`, list the section types it uses; cross-reference against `sections/`.
4. **Resolve snippet usage.** For each candidate section, list snippets it `render`s.
5. **Surface settings and translations.** From `config/settings_schema.json` and `locales/en.default.schema.json`, list relevant settings paths and translation keys.
6. **Call Toolkit `searchShopifyDocs`** if the feature description references a Liquid object/filter we're unsure about. Cite results.
7. **Return** a structured report.

## Output

Markdown report with these sections (omit any section that has no findings):

```markdown
# Theme Inspection — <feature description>

## Templates
- `templates/<file>.json` — <why it's relevant>

## Sections
- `sections/<file>.liquid` — <what it does, settings exposed, blocks>

## Snippets
- `snippets/<file>.liquid` — <what it does, where it's rendered>

## Settings
- `<settings_schema path>` — <what it controls>

## Translations
- `<locale key>` — <where it's surfaced>

## Liquid objects (from Shopify docs, via Toolkit)
- `<object>` — <one-line summary; link to Shopify docs>

## Confidence
- High / Medium / Low — <reason>

## Open questions
- <anything the input was ambiguous about>
```

## Important Notes

- This skill is **read-only.** Never edits theme files.
- If the theme analysis is older than 30 days or the theme has shifted significantly (e.g. a vendor update from FoxEcom), recommend re-running `/onboard-theme` rather than trusting stale data.
- Do not invent file references. If grep doesn't find a match, say so — don't speculate.
- Cap output at ~150 lines. For larger feature scopes, return the top relevance buckets and offer to expand specific sections.

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# inspect-theme/SKILL.md — v1.0 (M6)
