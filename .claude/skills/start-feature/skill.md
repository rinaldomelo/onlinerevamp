---
name: start-feature
description: "Phase 0 of feature development. Sets up a new feature: creates a feature branch, duplicates the _template folder, and guides the user to fill in the brief. Run before /scope-feature."
user-invocable: true
---

# Skill: Start Feature

## Description

Phase 0 of the feature development process. Handles the setup work so the user can jump straight into writing their brief. This is the entry point — run this whenever someone says they want to work on a new feature.

## When to Use

- When the user says they want to start a new feature
- When the user asks to set up a feature folder
- Before running `/scope-feature`

## Process

### Step 1 — Get the Feature Name

Ask the user: **"What's the name for this feature?"**

Explain that the name should be short and descriptive, using kebab-case (e.g. `size-guide`, `product-tabs`, `newsletter-popup`). This name will be used for:
- The feature folder: `.claude/features/feature-[name]/`
- The git branch: `feature/[name]`

If the user gives a name with spaces or mixed case, normalize it to kebab-case and confirm.

Wait for the user's answer before continuing.

---

### Step 2 — Create the Feature Branch

Check the current git branch. If the user is already on a feature branch, ask if they want to stay on it or create a new one.

If on `main` (or `master`):

**"You're on `main`. I'll create a feature branch `feature/[name]` to keep main clean. Sound good?"**

- If yes → create and switch to the branch
- If no → continue on the current branch (warn that they should not push to main)

If already on a different feature branch:

**"You're currently on `[branch-name]`. Want me to create a new branch `feature/[name]` from main, or keep working on this branch?"**

- If new branch → switch to main first, pull if remote exists, then create and switch to the new branch
- If stay → continue on the current branch

---

### Step 3 — Create the Feature Folder

Duplicate `.claude/features/_template/` to `.claude/features/feature-[name]/`.

This copies:
- `feature.md` — the brief template
- `OUTPUT-Implementation.md` — the implementation plan placeholder
- `reference/` — empty folder for designs, screenshots, etc.

Confirm the folder was created.

---

### Step 4 — Guide the User

Tell the user:

**"Your feature folder is ready at `.claude/features/feature-[name]/`.**

**Next step: Open `feature.md` and fill in the Brief section at the top — describe what you want to build in your own words. If you have any reference material (designs, screenshots, examples), drop them in the `reference/` folder.**

**When your brief is ready, run `/scope-feature` to start the scoping conversation."**

---

## Important Notes

- Don't skip the branch step — working on main is a non-negotiable no-go per project rules
- If a feature folder with the same name already exists, warn the user and ask how to proceed (rename, overwrite, or pick a different name)
- Keep this fast — the whole skill should take under a minute. No analysis, no reading theme files. That happens in `/scope-feature`

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# start-feature/SKILL.md — v1.0

# AI Shopify Developer Bootcamp

# by Coding with Jan

# https://codingwithjan.com

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
