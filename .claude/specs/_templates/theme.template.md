---
kind: theme
schema_version: 1
base_theme:
  name: ""
  version: ""
  vendor: ""
inventory:
  templates: 0
  sections_liquid: 0
  section_groups: 0
  snippets: 0
  assets: 0
  locales: 0
  blocks_folder: false
extension_approach: ""
critical_gotchas: []
references:
  analysis: ".claude/context/OUTPUT-initial-theme-analysis.md"
  figma_analysis: ".claude/context/OUTPUT-initial-figma-analysis.md"
last_curated: ""
---

# Theme — TODO

> **Conventions live in `OUTPUT-initial-theme-analysis.md`.** This file is a stable, top-of-funnel pointer. Do not duplicate the analysis here — link to it.

## CSS

See analysis · grid system, breakpoints, page-width, color variables, spacing patterns, naming convention.

## JavaScript

See analysis · base files, existing custom elements, event patterns, third-party libraries, script loading.

## Liquid + Schema

See analysis · section wrapper pattern, padding approach, standard schema settings, snippet patterns, translation approach, block patterns.

## Critical gotchas

[List of theme-specific footguns the analysis surfaced — copy bullets, not prose.]

## What this theme does NOT have

- (e.g.) No `/blocks/` folder — blocks defined inline in section `{% schema %}`
- (e.g.) No Theme App Extensions
- (e.g.) No design tokens in Figma yet — see figma analysis
