# CI Workflows — Staging Directory

> **Why this exists:** The OAuth token used by my push session does not have GitHub's `workflow` scope, which is required to create or modify files under `.github/workflows/`. To keep the burn-down moving, the YAML files for M3, M4, and M5 are checked in here. After the user grants `workflow` scope (or applies them manually), they get moved to their canonical paths.

---

## How to land the workflows

### Option A — Refresh auth, then I move them

In the user's terminal:

```bash
gh auth refresh -h github.com -s workflow
```

This adds the `workflow` scope to the existing GitHub auth. After that, run:

```bash
git mv .claude/architecture/ci-staged/.github/workflows/theme-check.yml          .github/workflows/theme-check.yml
git mv .claude/architecture/ci-staged/.github/workflows/deploy-dev-preview.yml    .github/workflows/deploy-dev-preview.yml
git mv .claude/architecture/ci-staged/.github/workflows/deploy-production.yml     .github/workflows/deploy-production.yml
git commit -m "ci: activate workflow files (M3-M5)"
git push
```

(Run for whichever workflows have landed at the time. M3 only ships `theme-check.yml`; M4 adds `deploy-dev-preview.yml`; M5 adds `deploy-production.yml`.)

### Option B — Manual move per workflow

If `gh auth refresh` is blocked or you'd rather copy/paste:

1. Copy the YAML content from `ci-staged/.github/workflows/theme-check.yml`.
2. In the GitHub UI, navigate to `Add file → Create new file` → path `.github/workflows/theme-check.yml`.
3. Paste, commit on a feature branch, open PR.

The web UI bypasses the OAuth scope restriction.

## Why not just block the burn-down

Refreshing OAuth scope mid-conversation is interactive and time-bounded. The user invoked `/loop` to maximize throughput. Staging the YAMLs keeps every milestone's content in the repo (still reviewable, still versioned) without blocking M4–M5 from landing.

Once the workflows are moved out of `ci-staged/`, this folder can be deleted.

## Files in this directory

(Updated as M3, M4, M5 ship.)

- `theme-check.yml` — M3 (PR-time linting).
- `deploy-dev-preview.yml` — M4 (per-PR preview push + comment).
- `deploy-production.yml` — M5 (production deploy on merge to main).
