---
name: init-specs
description: "Setup (run once). Bootstraps the .claude/specs/ folder structure after both onboard skills have run. Creates the folder tree, drops in spec templates, writes a placeholder project.md, and updates .gitignore. Run after /onboard-theme and /onboard-figma, before any other spec-* skill."
user-invocable: true
---

# Skill: Init Specs

## Description

Run this skill once at the start of every new project, after both `onboard-theme` and `onboard-figma` have produced their `OUTPUT-initial-*-analysis.md` files. It scaffolds the `.claude/specs/` folder, drops in the spec templates, writes a placeholder `project.md`, and updates `.gitignore`. Does not generate spec content — the `spec-*` skills do that.

## When to Use

- First time bootstrapping the spec hierarchy on a project.
- If the `.claude/specs/` folder is missing or partially set up.
- Re-running is **not idempotent for the placeholder** — if `project.md` already has real content, this skill aborts rather than overwriting. Move/rename the existing file first if you intentionally want to start fresh.

## Hard rules

- **Gate on both onboards.** Refuse to proceed if either `.claude/context/OUTPUT-initial-theme-analysis.md` or `.claude/context/OUTPUT-initial-figma-analysis.md` is missing. Tell the user which one is missing and which onboard skill to run.
- **Never overwrite real spec content.** If `.claude/specs/project.md` exists and its body is anything other than the placeholder TODO marker, abort with a clear message. The user moves/renames their existing file before re-running.
- **Branch check.** Refuse to run on `main`. Tell the user to switch to a working branch first.

## Inputs

- `.claude/context/OUTPUT-initial-theme-analysis.md` (existence check only)
- `.claude/context/OUTPUT-initial-figma-analysis.md` (existence check only)

## Outputs

- `.claude/specs/` tree:
  - `pages/.gitkeep`
  - `sections/.gitkeep`
  - `_assets/figma/.gitkeep`
  - `_templates/{project,theme,page,section}.template.md`
  - `project.md` (placeholder — frontmatter scaffold only, body says "run /spec-project")
- `.gitignore` — adds `.claude/specs/_viewer/` and `.claude/specs/_assets/figma/` if missing

## Steps

### Step 1 — Check prerequisites

1. Verify `.claude/context/OUTPUT-initial-theme-analysis.md` exists. If missing: stop and say "Run `/onboard-theme` first."
2. Verify `.claude/context/OUTPUT-initial-figma-analysis.md` exists. If missing: stop and say "Run `/onboard-figma` first."
3. Verify current git branch is not `main`. If on `main`: stop and say "Switch to a working branch first."

### Step 2 — Verify safe to scaffold

1. If `.claude/specs/project.md` already exists, read its body. If it contains anything beyond the placeholder TODO marker, abort and say: "`project.md` already has content. Move or rename it before re-running `/init-specs`."
2. If `.claude/specs/` doesn't exist yet, that's fine — proceed.

### Step 3 — Create folder structure

Create (idempotently):

- `.claude/specs/`
- `.claude/specs/pages/.gitkeep`
- `.claude/specs/sections/.gitkeep`
- `.claude/specs/_assets/figma/.gitkeep`
- `.claude/specs/_templates/`

### Step 4 — Drop in templates

Copy the four template files into `.claude/specs/_templates/`:

- `project.template.md`
- `theme.template.md`
- `page.template.md`
- `section.template.md`

If any already exist with identical content, leave them alone. If any exist with different content, **do not overwrite** — surface a warning ("`<path>` differs from canonical template — manual reconciliation needed") and continue with the others.

### Step 5 — Scaffold `project.md`

If `.claude/specs/project.md` does not exist, write it from `_templates/project.template.md` with the body replaced by the placeholder marker:

```markdown
# Project — TODO

## TODO — run /spec-project

This file is a placeholder. Run `/spec-project` to fill it in via interactive Q&A.
```

The frontmatter stays as the template (empty store/scope/figma_sources, references already pointing at the right files).

### Step 6 — Update `.gitignore`

If `.gitignore` does not contain `.claude/specs/_viewer/`, append it under a `# spec viewer (regenerated)` heading. Same for `.claude/specs/_assets/figma/` under a `# Figma thumbnails (regenerable)` heading. Be conservative — only append, never modify existing entries.

### Step 7 — Print summary + next steps

Print:

- Files created (paths)
- Files left untouched (e.g. `_templates/*` already current)
- `.gitignore` changes (if any)
- Suggested next: `/spec-theme` (the first verifiable spec, derived from theme analysis), then `/spec-project` (interactive).

## Important Notes

- **This skill writes no domain content.** It scaffolds. Domain content lands via `/spec-theme`, `/spec-project`, `/spec-page`, `/spec-section`.
- **Idempotent on folders + `.gitkeep` + templates.** Re-running on a clean repo is safe.
- **Not idempotent on `project.md`** — by design. Once a real spec lives at that path, the user is in charge of preserving it.

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# init-specs/SKILL.md — v1.0

# AI Shopify Developer — Spec Hierarchy (Phase 1)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
