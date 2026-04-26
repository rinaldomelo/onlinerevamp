# Git Workflow

Independent feature-branch promotion across three environments. Feature branches are the **only** source for PRs into any environment — never promote one environment into another.

## Environments

- `development` — integration sandbox
- `staging` — pre-prod QA
- `main` — production

## The flow

Each arrow is an **independent PR from the feature branch** to that target.

```
feature/foo ──► development   (integration test)
feature/foo ──► staging       (pre-prod QA, requires pair review)
feature/foo ──► main          (production, requires pair review)
```

Not allowed:

- ❌ `development → staging`
- ❌ `staging → main`

## Rules

1. **Always PR from the feature branch to the target environment.** Never open a PR with another environment as the source.
   - ✅ `feature-branch → development`
   - ✅ `feature-branch → staging`
   - ✅ `feature-branch → main`
   - ❌ `development → staging`
   - ❌ `staging → main`

2. **Peer review is required for `staging` and `main`.**
   - Open PR → assign a pair → wait for approval → merge.
   - No self-approval.
   - Recommended (not required) for `development` to keep turnaround fast.

3. **Staging deployment requires explicit sign-off.**
   - PR description must include test scenarios: what was tested, how to verify.
   - Pair reviews and approves on GitHub.
   - Merge only after approval.

4. **Main (production) follows the same review process** as staging — open PR from the feature branch, pair reviews and approves, then merge.

## Key principles

- **Feature branches are independent.** They can be merged to any environment without waiting for other PRs.
- **Staging validation is mandatory.** Every change to `staging` must have pair sign-off before merge.
- **No environment contamination.** `development` and `staging` are isolated environments with independent histories. A feature in `development` doesn't automatically go to `staging`.
- **Rollback is clean.** If staging testing fails, revert that PR without affecting `development`.

## Example — two features in flight

```
Feature A (fix/auth-callback)
  └─ PR #10: fix/auth-callback → development   ✅ merged
  └─ PR #11: fix/auth-callback → staging       ⏳ waiting for pair review

Feature B (feat/bulk-order)
  └─ PR #12: feat/bulk-order → development     ⏳ in review
  └─ (no staging PR yet — opens once author is ready, independent of Feature A)
```

Features don't block each other: A is in staging validation while B is still in development review.

## When in doubt

- **"Can I merge `development` into `staging`?"** → No. Open a new PR from the feature branch to `staging`.
- **"Can I merge `staging` into `main`?"** → No. Open a new PR from the feature branch to `main`.
- **"Do I need pair review for `development`?"** → Recommended, but not required. Pair review **is** required for `staging` and `main`.
- **"My staging PR conflicts with `main`."** → Resolve in the feature branch (merge latest `main`, retest, push), then re-request review on the PR.

## Pre-launch note

Once the production site is live, add a pre-merge backup step: duplicate the live theme in Shopify Admin (e.g. `Emergency Theme YYYY-MM-DD`) before any merge to `main`, so we can roll back instantly. Not required while the site is pre-launch.
