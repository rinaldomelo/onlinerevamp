---
name: onboard-theme
description: "Setup (run once). Analyzes the full Shopify theme — CSS, JS, Liquid, schema, assets — and writes a structured report to OUTPUT-initial-theme-analysis.md. This becomes the single source of truth for how we build on this theme. Run at the start of every new project."
user-invocable: true
---

# Skill: Onboard Theme

## Description

Run this skill once at the start of every new Shopify theme project. It performs a full analysis of the theme's codebase and visual design, then writes a structured report to `.claude/context/OUTPUT-initial-theme-analysis.md`. This file becomes the single source of truth for how we build on this theme.

## When to Use

- First time working on a new theme
- When switching to a theme you haven't analyzed yet
- If the OUTPUT file is missing or outdated and needs regenerating

## Steps

### Step 1 — Scan Project Structure

Map the full file tree. Identify:

- All folders: `sections/`, `snippets/`, `assets/`, `templates/`, `config/`, `locales/`, `layout/`, `blocks/`
- Which files appear to be custom vs. theme defaults (look for naming patterns, comments, or anything that stands out)
- How many sections, snippets, templates, and assets exist
- Any unusual or non-standard files or folders

### Step 2 — CSS Analysis

Read the main CSS files (usually in `assets/`). Document:

- **Grid system** — Is it flexbox? CSS grid? A custom grid class system? How are columns handled?
- **Breakpoints** — What media query breakpoints are used? (e.g. 750px, 990px, 1200px)
- **Color variables** — What CSS custom properties exist? How are colors defined and used?
- **Naming convention** — Is it BEM? Theme-specific naming? Random? Be specific about the pattern.
- **Spacing patterns** — Are there spacing utilities? Consistent margin/padding values?
- **Page width / containers** — How is max-width handled? What class wraps content? (e.g. `page-width`, `container`, `wrapper`)

### Step 3 — JavaScript Analysis

Read the main JS files. Document:

- **Base files** — List all core JS files (e.g. `global.js`, `theme.js`, `vendor.js`). These should NOT be modified.
- **Existing web components** — List every custom element registered with `customElements.define()`. Note their tag names and what they do.
- **Event patterns** — Are there custom events? A pub/sub system? How do components communicate?
- **Third-party libraries** — What's already loaded? (e.g. Flickity, Swiper, etc.)
- **Script loading** — How are scripts loaded? `defer`? `module`? Inline? Is there a pattern?

### Step 4 — Liquid Patterns

Read at least 5-6 different section files to identify patterns. Document:

- **Section structure** — What's the common markup pattern? How are sections wrapped?
- **Snippet usage** — What snippets exist? How are they named? What are the most reused ones?
- **Settings organization** — How are schema settings typically ordered?
- **Translation patterns** — Are `t:` translation keys used? Or hardcoded text? How consistently?
- **Block patterns** — How are blocks structured? Common block types?

### Step 5 — Section Patterns Deep-Dive

Read at least 3-4 existing sections in detail and compare them. Specifically check:

- Do they use a `page-width` wrapper class? Or a different container approach?
- Do they use the section-id padding pattern?

```liquid
  .section-{{ section.id }}-padding {
    padding-top: {{ section.settings.padding_top | times: 0.5 | round: 0 }}px;
    padding-bottom: {{ section.settings.padding_bottom | times: 0.5 | round: 0 }}px;
  }
  @media screen and (min-width: 750px) {
    .section-{{ section.id }}-padding {
      padding-top: {{ section.settings.padding_top }}px;
      padding-bottom: {{ section.settings.padding_bottom }}px;
    }
  }
```

- Do they include `padding_top` / `padding_bottom` range settings in their schema?
- Do they use `color_scheme` settings?
- How do they load their own CSS/JS assets?
- How do they handle section spacing between each other?
- What's the common schema structure? (settings order, which settings appear in almost every section)

### Step 6 — Schema Conventions

Based on the sections analyzed, document:

- **Common settings** — Which settings appear across most sections? (e.g. color_scheme, padding, heading)
- **Color scheme handling** — How does the theme handle color schemes? CSS classes? Variables?
- **Padding / spacing approach** — Is there a standard padding range? What are the defaults?
- **Preset patterns** — How are presets structured? Do they include default block content?
- **Setting types** — Which Shopify setting types are commonly used? (e.g. `color_scheme`, `image_picker`, `richtext`)

### Step 7 — Asset Loading Patterns

Document:

- How are CSS files loaded? (`stylesheet_tag`? Inline `<style>` tags? Both?)
- How are JS files loaded? (`script_tag`? `<script defer>`? `<script type="module">`?)
- Is there any lazy loading pattern?
- What's render-critical vs. deferred?

### Step 8 — Reference Images (if available)

Check `.claude/context/reference/` for any uploaded files — screenshots, design mockups, brand guidelines, PDFs.

If images exist, analyze them for:

- **Layout patterns** — How is content laid out? Single column? Multi-column? Sidebar?
- **Typography hierarchy** — What heading sizes are visible? How is text styled?
- **Spacing rhythm** — How much whitespace between sections? Between elements?
- **Color usage** — What colors dominate? How are accents used?
- **Component patterns** — What UI components are visible? Cards? Sliders? Modals?

If no reference images exist, note this in the output and move on.

### Step 9 — Write the Output

Write everything to `.claude/context/OUTPUT-initial-theme-analysis.md` using the structure below.

Be specific. Don't write "standard BEM" — write the actual class names you found. Don't write "uses CSS variables" — list the actual variables. The more concrete this file is, the more useful it becomes for every future feature.

## Output Structure

Write the following to `.claude/context/OUTPUT-initial-theme-analysis.md`:

```markdown
# Theme Analysis — [Theme Name]

Generated: [date]

## Summary

[2-3 sentence overview: what theme, what version, key characteristics.
Note if this is a heavily customized theme or mostly stock.]

## File Structure Overview

[What exists, what's custom, what's untouched.
Total counts: X sections, X snippets, X templates, X asset files.
Note any custom files that stand out.]

## CSS Conventions

### Grid System

[Specific grid approach with actual class names]

### Breakpoints

[List every breakpoint found, e.g. 750px, 990px, 1200px]

### Color Variables

[List key CSS custom properties and what they control]

### Naming Convention

[Specific pattern with real examples from the theme]

### Spacing Patterns

[How spacing is handled — utilities, variables, or manual values]

### Page Width / Containers

[Exact class name and max-width value, e.g. `.page-width { max-width: 1200px }`]

## JavaScript Conventions

### Base Files (do not modify)

[List each file and brief description of what it does]

### Existing Components

[List every custom element: tag name, file, what it does]

### Event Patterns

[Custom events, pub/sub, or other communication patterns]

### Third-Party Libraries

[What's loaded, version if identifiable, what it's used for]

### Script Loading

[The standard pattern for loading scripts in this theme]

## Liquid Conventions

### Section Wrapper Pattern

[The exact wrapper markup pattern used across sections]

### Section Padding Approach

[How padding is handled — the specific pattern with code example]

### Standard Schema Settings

[Settings that appear in most/all sections — list them]

### Section Structure

[Common section file anatomy in this theme]

### Snippet Patterns

[Key snippets, naming convention, how they're included]

### Translation Approach

[Are t: keys used? How consistently? Any gaps?]

### Block Patterns

[Common block types and structures]

## Schema Conventions

### Common Settings

[Settings present across most sections]

### Color Scheme Handling

[How the theme implements color schemes]

### Padding / Spacing Approach

[Standard range values, defaults, the pattern]

### Preset Patterns

[How presets are typically structured]

## Visual Analysis

[Only if reference images were found in .claude/context/reference/]

### Layout Patterns

[What layouts are visible in screenshots/designs]

### Typography Hierarchy

[Heading sizes, font usage, text styling observed]

### Color Usage

[Dominant colors, accent usage, contrast patterns]

### Component Patterns

[UI components visible: cards, sliders, modals, etc.]

## Recommendations

[Anything notable:

- Inconsistencies in the codebase
- Gotchas to watch out for
- Patterns that should be followed carefully
- Things that deviate from Shopify best practices
- Potential conflicts to be aware of]
```

## Important Notes

- Read actual files. Never guess or assume content based on file names alone.
- Use the Shopify Dev MCP to validate any Liquid patterns you're unsure about.
- If the theme is very large, prioritize the most commonly used sections and the main CSS/JS files.
- Be concrete — use real class names, real variable names, real examples from the theme.
- If something is unclear or inconsistent in the theme, say so in the Recommendations section.

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# onboard-theme/SKILL.md — v1.0

# AI Shopify Developer Bootcamp

# by Coding with Jan

# https://codingwithjan.com

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
