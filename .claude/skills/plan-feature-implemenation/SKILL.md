---
name: plan-feature-implemenation
description: "Phase 2 of feature development. Takes the scoped spec from /scope-feature and creates a step-by-step implementation plan: (1) Human-first breakdown — admin setup tasks, code preparation, live behavior in plain language, (2) Concrete build steps with files, details, and verification. Output goes to OUTPUT-implementation-plan.md. Run after scoping, before building."
user-invocable: true
---

# Skill: Plan Feature Implementation

## Description

Phase 2 of the feature development process. Takes the scoped feature spec (from the `/scope-feature` skill) and turns it into a concrete, step-by-step implementation plan. No code gets written during this phase — only the plan.

The plan has two layers:
1. **Human-first breakdown** — describe the feature as if watching someone use it, in plain language
2. **Build steps** — translate that understanding into concrete file-level implementation steps

The human-first layer ensures everyone truly understands the feature before any code is written. The build steps make it actionable.

## When to Use

- After `/scope-feature` has been completed and the Extended Brief exists in `feature.md`
- Before writing any code for the feature

## Inputs

Read and understand:

1. **Feature spec** — `.claude/features/[feature-name]/feature.md` — the full spec including the Extended Brief
2. **Reference material** — `.claude/features/[feature-name]/reference/` — designs, screenshots, notes
3. **Theme analysis** — `.claude/context/OUTPUT-initial-theme-analysis.md` — conventions, patterns, existing components
4. **Project log** — `.claude/context/OUTPUT-project-log.md` — for context on past decisions
5. **Other feature summaries** — if dependencies were flagged during scoping, read the relevant OUTPUT files

## Process

### Step 1 — Human-First Breakdown

Before thinking about files or code, describe the feature in three phases as if you're walking someone through it in real time:

**ADMIN SETUP (human tasks)** — What does the human need to do in the Shopify admin before any code can work?
Think about data that needs to exist: pages, collections, products, metafield definitions, metaobjects, navigation items, etc. These are things we can't do through theme code — the human has to set them up manually.

Group these tasks by purpose. Each group gets:
- A **headline** explaining what we're setting up
- A **brief explanation** of why — so the human understands the reason, not just the steps
- A **checklist** with specific instructions

Be specific: don't say "set up metafields" — say "create a metafield definition on Products called `size_guide` (type: file) under Settings > Custom data > Products."

If there are no admin tasks needed, say so explicitly: "No admin setup required — this feature works entirely with theme code and section settings."

**CODE PREPARATION** — What needs to exist in the code before any visitor touches the page?
Think about what elements need to be in place, what should be visible or hidden by default, what markup structure is needed.

**LIVE BEHAVIOR** — What happens when a user actually interacts with the page?
Walk through it step by step. Describe it like a human sitting in front of the screen.

Rules for the breakdown:
- Each step should be ONE single action
- Don't skip steps that feel obvious
- No code — just plain language
- Number every step within each phase

**Example:**

Feature: "Show a size guide popup on product pages. The size guide content comes from a metafield."

```
ADMIN SETUP (human tasks in Shopify admin)

#### Create a metafield to store size guide images
Each product needs a place to store its size guide image. Shopify doesn't have this by default,
so we need to create a custom metafield definition. Once it exists, you (or the client) can
upload a size guide image per product — and our code will pull it from there.

- [ ] Go to Settings > Custom data > Products
- [ ] Create a new metafield definition called "Size Guide" with namespace "custom.size_guide" and type "file"

#### Add size guide data to products
Now that the metafield exists, add the actual size guide images to the products that need them.

- [ ] Go to a product that needs a size guide
- [ ] Scroll down to the metafields section and upload the size guide image to the "Size Guide" field
- [ ] Repeat for any other products that need size guides

CODE PREPARATION (before any visitor touches the page)
1. I'd create a button that says "Size Guide" on the product page
2. I'd create a popup/modal container — hidden by default
3. Inside the modal, I'd pull the size guide image from the product metafield
4. If no metafield exists for a product, I'd hide the button entirely

LIVE BEHAVIOR (when a user interacts)
1. Page loads — I'd check if this product has a size guide metafield
2. If yes, show the "Size Guide" button. If no, hide it.
3. Customer clicks the button — open the modal
4. Show the size guide image
5. Customer clicks outside the modal or hits the X — close it
6. Customer presses Escape — also close it
```

Present this breakdown to the user and confirm it matches their mental model before proceeding.

### Step 2 — Identify Files & Components

Based on the spec and the human-first breakdown, determine exactly what needs to be created or modified:

**New files** (follow the standard pattern from CLAUDE.md):
- `sections/section-[feature-name].liquid` — markup, schema, asset loading
- `assets/section-[feature-name].css` — component styles
- `assets/[feature-name].js` — web component (only if the feature is interactive)

**Existing files that may need changes:**
- Templates that need to include the new section
- Snippets that could be reused or need modification
- Schema or settings files
- Translation/locale files

**Theme components to reuse:**
- Identify existing patterns from the theme analysis (grid classes, button styles, modal systems, etc.)
- Note specific class names, wrappers, or components you'll build on

### Step 3 — Define Build Steps

Translate the human-first breakdown into concrete implementation steps. Each step should be:

- **Small enough to verify** — you can test/preview after each step
- **Self-contained** — completing one step shouldn't break anything
- **In logical order** — foundation first, then layers of complexity

A typical build order:

1. **Section skeleton** — basic Liquid file with schema, empty markup, asset loading
2. **Static markup** — HTML structure with hardcoded content to verify layout
3. **CSS** — styles to match the design, using theme conventions
4. **Dynamic data** — replace hardcoded content with Liquid variables and schema settings
5. **JavaScript** — web component for interactivity (if needed)
6. **Responsive behavior** — mobile/tablet adjustments
7. **Edge cases** — empty states, error handling, loading states
8. **Schema polish** — final settings, presets, translations

Not every feature needs all steps. A simple static section might only need 1-4. Use judgment.

For each step, specify:

- **What to do** — clear description of the work
- **Which file(s)** — exact file paths to create or edit
- **Key details** — specific classes to use, Liquid objects to reference, settings to create, components to reuse from the theme
- **How to verify** — what should work/look like after this step is complete

The level of detail matters. Each step should be specific enough that it can be executed without re-reading the entire spec. Think of it like writing instructions for someone who only sees one step at a time.

### Step 4 — Generate QA Checklist (separate file)

After the build steps, generate a separate QA file at `.claude/features/[feature-name]/OUTPUT-qa-debugging.md`. This file lives outside the planning document because it's an active, living document — users annotate it with test results, and it gets reset between QA rounds.

Include tests for:
- Core feature behavior (does the main thing work?)
- Edge cases from the spec (empty states, error states, missing data)
- Mobile / responsive behavior
- Accessibility (keyboard, focus, screen readers)
- JavaScript disabled fallback (if applicable)
- Any platform-specific behavior (e.g., Shopify notification emails, customizer preview)

Keep each item specific and actionable — not "test the feature" but "select Option X, verify Field Y appears."

See the **QA File Format** section below for the exact template and QA workflow.

### Step 5 — Flag Risks & Open Questions

Call out:

- Anything that could go wrong or needs extra caution
- Steps that depend on assumptions not yet verified
- Performance considerations
- Potential conflicts with existing theme functionality
- Any remaining items from scoping that need client clarification

### Step 6 — Present & Confirm

Present the full plan to the user. Ask: **"Does this build order make sense? Anything you'd like to adjust before we start?"**

Only write the OUTPUT file after the user confirms.

## Output

Write two files:

1. **Implementation plan** → `.claude/features/[feature-name]/OUTPUT-implementation-plan.md`
2. **QA checklist** → `.claude/features/[feature-name]/OUTPUT-qa-debugging.md`

### Implementation Plan Format

Write to `.claude/features/[feature-name]/OUTPUT-implementation-plan.md`:

```markdown
# Implementation Plan: [Feature Name]

Generated: [date]
Feature spec: `.claude/features/[feature-name]/feature.md`

## Summary

[2-3 sentence description of what this feature is and does. This summary is used by other features to quickly check for dependencies — keep it concise and informative.]

## Human-First Breakdown

### Admin Setup (human tasks in Shopify admin)

[Or: "No admin setup required — this feature works entirely with theme code and section settings."]

#### [What we're setting up]
[Why this is needed — brief explanation so the human understands the purpose]

- [ ] [specific step]
- [ ] [specific step]

#### [Next thing to set up]
[Why]

- [ ] [specific step]

### Code Preparation (before any visitor touches the page)

1. [step]
2. [step]
...

### Live Behavior (when a user interacts)

1. [step]
2. [step]
...

## Files

### New Files
- `sections/section-[feature-name].liquid` — [purpose]
- `assets/section-[feature-name].css` — [purpose]
- `assets/[feature-name].js` — [purpose, only if needed]

### Modified Files
- [file path] — [what changes and why]

### Theme Components Reused
- [component/class/pattern] — [how it's being used]

## Build Steps

### Step 1: [Title]

**Do:** [Clear description]
**Files:** [paths]
**Details:**
- [Specific implementation notes]
- [Classes, Liquid objects, settings to use]
- [Theme conventions to follow]

**Verify:** [What to check after this step]

### Step 2: [Title]

...

## Risks & Considerations

- [Anything that needs caution]
- [Assumptions being made]
- [Performance notes]

## Open Questions

- [Any unresolved items — or "None" if everything is clear]
```

### QA File Format

Write to `.claude/features/[feature-name]/OUTPUT-qa-debugging.md`:

```markdown
# QA: [Feature Name]

Feature spec: `.claude/features/[feature-name]/feature.md`
Implementation plan: `.claude/features/[feature-name]/OUTPUT-implementation-plan.md`

## How to Use This File

1. Run through the checklist after implementation — check items that pass, add notes on items that fail
2. Tell AI to read this file — it will fix the issues and reset the checklist for another round
3. Repeat until everything passes
4. Previous rounds are kept as a log below the current round

## Current Round (Round 1)

Status: Testing

### Core behavior
- [ ] [specific test]
- [ ] [specific test]

### Validation
- [ ] [specific test]

### Edge cases
- [ ] [specific test]

### Mobile
- [ ] [specific test]

### Accessibility
- [ ] [specific test]

### [Platform-specific section, e.g. "Shopify admin"]
- [ ] [specific test]

## Previous Rounds

[Empty on first generation. After each QA round, AI moves the completed round here with results preserved.]
```

### QA Workflow

When the user reports test results (by annotating the QA file or telling you in chat):

1. **Read the QA file** — check which items failed and any notes the user added
2. **Fix the issues** in code
3. **Archive the current round** — move it to "Previous Rounds" using this format for each item:

   ```markdown
   #### [PASS] Original checklist item text

   #### [FAIL] Original checklist item text
   **User feedback:** "what the user actually wrote or reported"
   **Fix:** Description of what was changed and why.

   #### [SKIPPED] Remaining items
   Could not be verified due to above blockers.
   ```

   This preserves the full story: what was tested, what the user saw, and what was fixed. Anyone reading the log later can understand the issue without guessing.

4. **Generate a fresh round** — increment the round number, reset all checkboxes. Include the full checklist again (not just the items that failed) so the user can verify fixes didn't break anything else
5. Tell the user the QA file is ready for another round of testing

## Important Notes

- Don't start coding during this phase. The plan is the deliverable.
- Each build step should be small enough to execute and verify independently. If a step feels too big, break it down further.
- Reference specific theme conventions by name — don't say "use the theme's grid system," say "use the `page-width` wrapper and `grid--2-col-desktop` classes."
- The Summary section at the top is important — other features reference it to check for dependencies without reading the full plan.
- The Human-First Breakdown is not optional. It's the sanity check that proves you understand the feature before planning any code.
- After the plan is confirmed, the user can say "let's build" and you follow the steps in order.

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# plan-feature-implemenation/SKILL.md — v1.0

# AI Shopify Developer Bootcamp

# by Coding with Jan

# https://codingwithjan.com

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
