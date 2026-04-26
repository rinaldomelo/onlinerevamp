# Skill: Edit Assets

## Description

Tier-2 orchestration skill. Edits CSS and JS files under `assets/` with idempotency guarantees — never duplicates existing rules, never wraps the whole file in a new IIFE just to add one behavior. Used by the orchestrator's `assets-agent` (M8) and by humans-in-Claude-Code for routine asset edits.

## When to Use

- A new CSS rule for an existing section.
- A small JS behavior tweak inside an existing web component.
- Refreshing a CSS variable or a media-query breakpoint.

Don't use this for:

- Net-new web components / sections — that's a feature, goes through `/start-feature`.
- Mass refactors — split per file.
- Adding npm dependencies — out of scope; needs an ADR.

## Inputs

- `file_path` (string, required) — under `assets/`.
- `change_description` (string, required).
- `target_selector` (string, optional) — CSS selector or JS function name to focus the edit.
- `dry_run` (boolean, default `false`).

## Process

1. **Read the file.** Note line count, existing structure, comment style.
2. **Read the theme analysis** for FoxTheme conventions:
   - Root font-size 62.5% → `1rem = 10px`.
   - RGB-triplet color vars consumed via `rgb(var(--color-X))`.
   - Tailwind-style breakpoints `sm/md/lg/xl/xxl` (640/768/1024/1280/1536).
   - Custom-element pattern: `if (!customElements.get(...)) { customElements.define(...) }`.
3. **Check for existing rules / functions** that match the target. If found, edit in place rather than appending a duplicate.
4. **Generate the edit.** Match the file's existing comment style and indentation.
5. **Validate:** for CSS, basic syntax check (matching braces, no orphan selectors). For JS, check it parses (if Node available).
6. **Diff preview.** Surface duplicate-rule warnings.
7. **Write** if not `dry_run`.
8. Return structured observation.

## Output

```markdown
# Edit — <file_path>

## Change applied
<one-line summary>

## Diff
\`\`\`diff
<unified diff>
\`\`\`

## Idempotency check
- Existing rule matched: <yes/no — if yes, edited in place>
- Adjacent duplicates found: <list>

## Validation
- Syntax: <pass/fail>
- File size: <before → after>

## FoxTheme conventions
- <list any deviations from the conventions, e.g. used `1.5rem` instead of the theme's `--space-*` token>

## Watch-outs
- <e.g. "this rule depends on --color-foreground; verify in the relevant color schemes">
```

## Important Notes

- **Never bundle / minify.** Shopify handles that on push.
- **Vanilla JS only** — no frameworks unless theme already uses them. Sleek/FoxEcom uses raw web components + Swiper for carousels.
- **No CDN-loaded libraries.** Anything new lives in `assets/`.
- **Don't add inline styles to Liquid sections** to compensate for missing CSS — fix the CSS file.
- File-glob policy (M11): writes only to `assets/*.{css,js}`. Anything else throws.
- For new web components, always use the `if (!customElements.get(...))` guard so registering twice doesn't error.

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# edit-assets/SKILL.md — v1.0 (M6)
