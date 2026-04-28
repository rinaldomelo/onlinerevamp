---
name: spec-project
description: "Interactive 3-round Q&A that fills .claude/specs/project.md — store metadata, why we're customizing, in/out scope, locales, Figma sources, stakeholders, decisions. Mirrors the scope-feature conversation pattern but at project (not feature) level. Run after /init-specs."
user-invocable: true
---

# Skill: Spec Project

## Description

Interactive skill that fills `.claude/specs/project.md` via a 3-round conversation. Round 1 establishes the store + why + scope. Round 2 confirms Figma sources discovered by `onboard-figma` and identifies stakeholders. Round 3 renders the full file, confirms with the user, and writes it. Mirrors the structure of `scope-feature` but at project (not per-feature) granularity — the artifact is global, read by every downstream spec and feature workflow.

## When to Use

- After `/init-specs` has scaffolded the placeholder `project.md`.
- When the project's high-level context shifts substantially (new store, new scope, new Figma source) — re-run to refresh.

## Hard rules

- **Gate on both onboards.** Refuse to run if either `OUTPUT-initial-theme-analysis.md` or `OUTPUT-initial-figma-analysis.md` is missing.
- **Don't overwrite real content.** If `project.md` body has been edited beyond the placeholder TODO marker, ask the user explicitly "rewrite from scratch" vs. "merge with existing" before continuing.
- **Pull Figma sources from the analysis, don't re-ask.** `onboard-figma` already captured `file_key` + URL + included pages. Round 2 confirms and supplements; it does not re-collect what's already known.
- **Locales policy is non-negotiable.** The project spec always carries: "Specs track structure only. Translations live in /locales — referenced by t: key, never inlined." Don't let the user override this — locale JSON files are the source of truth for copy.

## Inputs

- `.claude/context/OUTPUT-initial-theme-analysis.md` (existence check; theme metadata for context)
- `.claude/context/OUTPUT-initial-figma-analysis.md` (Figma file key + URL + included page list)
- `.claude/context/client-notes.md` (if present and non-empty, surface relevant facts)
- `.claude/specs/project.md` (existing placeholder OR previously curated content)
- Locale count: `ls locales/*.json | wc -l`

## Outputs

- `.claude/specs/project.md` (written from `_templates/project.template.md` + user answers)

## Steps

### Step 1 — Gate + intake

1. Verify both onboard outputs exist. If missing, halt with the specific skill to run.
2. Read `project.md`. If body is anything other than the placeholder TODO marker, ask: "rewrite from scratch" vs. "merge with current content".
3. Read `client-notes.md`. If it contains non-template content (anything other than empty headers), surface a 3-bullet summary of what's there before Round 1, so the user knows you've seen it.
4. Read the figma analysis and extract: file_key, original URL, file name (or URL slug), included page names. These are pre-known answers for Round 2 — don't re-ask.
5. Count locales from filesystem. This is `locales.count` for the spec.

### Step 2 — Round 1: Why + scope

Ask the user, in one combined turn (use AskUserQuestion when sensible):

1. **Store name** — friendly name (e.g. "Rhythm Rocks").
2. **myshopify URL** — `<store>.myshopify.com` (or "not yet set up" if pre-launch).
3. **Production theme ID** — Shopify theme ID number, if known. Optional.
4. **Why we're customizing** — one paragraph. The reason behind this engagement. Driving force / business motivation. Not "build a website" — the *why*.
5. **In scope** — bulleted list of what's in (e.g. "All public-facing pages", "PDP customizations", "Custom collection filters").
6. **Out of scope** — bulleted list of what's explicitly NOT in (e.g. "Checkout (Plus required)", "Backend integrations", "Customer account customizations").
7. **Primary locale** — single locale code (e.g. `en`, `en-US`, `fr`).

Capture answers in working memory. Confirm key facts back to the user in one sentence before moving on.

### Step 3 — Round 2: Figma + stakeholders + decisions

1. **Confirm Figma sources** — show the user what was discovered:

   > Found in your Figma analysis: `<file_name>` (`<file_key>`), URL `<url>`, with `<N>` Ready-for-Dev pages. Should I record this as the primary design source? Any *additional* Figma files (component libraries, brand kits, separate iconography) to add?

   Default: record the discovered file as the single source. If user adds files, capture each as `{ label, file_key, url }`.

2. **Stakeholders** — who owns what? Names + roles. Optional but useful for the spec body. If user says "just me", record that.

3. **Decisions made + alternatives considered** — any major calls already made about the project? (e.g. "decided to keep base theme rather than rewrite", "deferred PWA features", "skipping i18n beyond English"). Optional.

4. **Open questions** — anything still unresolved that future spec/feature work needs? Optional. These get listed in the body so they're surfaced when downstream agents read the spec.

### Step 4 — Round 3: Review + write

1. Render the full `project.md` content from gathered answers (frontmatter + body) using `_templates/project.template.md` as the base. Set `last_curated` to today's date.
2. **Show the rendered file to the user** before writing. Use a single message with the full file content in a code block. Ask: "Looks good? I'll write it to `.claude/specs/project.md`."
3. On confirmation, write the file.
4. Print: file path + summary (locale count, Figma source count, in-scope bullet count, out-of-scope bullet count).
5. Suggest next: `/spec-page <template>` (e.g. `/spec-page index`) to start cataloging pages, then `/spec-section <slug>` for sections.

## Frontmatter assembly

```yaml
kind: project
schema_version: 1
store:
  name: "<from Round 1>"
  myshopify: "<from Round 1, or null>"
  prod_theme_id: <int or null>
why: "<from Round 1>"
scope:
  in:
    - "<bullet>"
  out:
    - "<bullet>"
locales:
  primary: "<from Round 1>"
  count: <from filesystem>
  policy: "Specs track structure only. Translations live in /locales — referenced by t: key, never inlined."
figma_sources:
  - label: "<from analysis or user-supplied label>"
    file_key: "<from analysis>"
    url: "<from analysis>"
    pages_included: <int>          # from figma analysis
links:
  client_notes: ".claude/context/client-notes.md"
  theme_analysis: ".claude/context/OUTPUT-initial-theme-analysis.md"
  figma_analysis: ".claude/context/OUTPUT-initial-figma-analysis.md"
  project_log: ".claude/context/OUTPUT-project-log.md"
last_curated: <YYYY-MM-DD>
```

## Body assembly

```markdown
# Project — <store name>

## Why we're customizing

<paragraph from Round 1 Q4>

## Stakeholders

<list from Round 2 Q2; "Solo — Rinaldo @ Evosem" if user said "just me">

## Decisions made

<bullets from Round 2 Q3; or "None yet recorded.">

## Open questions

<bullets from Round 2 Q4; or "None.">

## In scope

- <bullets from Round 1 Q5>

## Out of scope

- <bullets from Round 1 Q6>
```

## Important Notes

- **No copy in specs.** Even if the user pastes hero copy or button text during the conversation, do not put it in `project.md`. Translation keys + the locale JSON files own copy.
- **Don't probe past 3 rounds.** If something's unclear after Round 2, stub it as an open question and move on. The user can re-run later.
- **The placeholder's frontmatter pre-seeds `links.*`** — preserve those paths verbatim. They're the canonical pointers downstream skills will follow.

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# spec-project/SKILL.md — v1.0

# AI Shopify Developer — Spec Hierarchy (Phase 2)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
