# ADR-004 — Two-Tier Skills Strategy: Toolkit (Tier 1) + Custom (Tier 2)

- **Status:** Accepted
- **Date:** 2026-04-25
- **Deciders:** Rinaldo (solo dev)
- **Implements:** Milestones M1, M6
- **Related:** ADR-001 (Pattern A), ADR-002 (Pattern B), ADR-005 (orchestrator stack)

---

## Context

The reference architecture (§14, §15.2) recommends splitting skills into two tiers:

- **Tier 1 — Shopify-domain skills** (docs lookup, schema search, validation). Provided by the Shopify AI Toolkit. Auto-updated. Don't reimplement.
- **Tier 2 — Orchestration skills** (`addSectionToJsonTemplate`, `prepareFeatureBranch`, `openPullRequestWithPreview`). Domain-specific to *our* repo / agency / workflow. Must be authored and maintained in-repo.

Without this split, you end up either reinventing Shopify-native validation (wasteful) or shoving Git/CI/repo-specific logic into Toolkit-style skills (wrong layer).

The repo today has four user-facing skills under `.claude/skills/`:

- `onboard-theme` — full theme analysis pass.
- `start-feature` — branch + folder scaffold.
- `scope-feature` — three-round scoping conversation.
- `plan-feature-implemenation` — implementation plan + QA checklist.

These are **already Tier 2**. They're orchestration / workflow skills, not Shopify-domain skills.

## Decision

**Adopt the two-tier model explicitly. Tier 1 = Shopify AI Toolkit (via Pattern A in M1, Pattern B in M7). Tier 2 = `.claude/skills/`.** Tier 2 skills may *call* Tier 1 skills internally; the reverse never happens.

Concretely:

- **Tier 1 ownership:** Shopify. We don't fork, don't vendor (per ADR-001), don't duplicate. We invoke Toolkit skills by name from Tier 2 procedures and from agent prompts (M7+).
- **Tier 2 ownership:** us. Lives in `.claude/skills/<skill-name>/SKILL.md`. Format mirrors the existing `scope-feature` template. Each skill documents Description / When to Use / Inputs / Process / Output / Important Notes.
- **Existing skills stay where they are.** No renames. M6 *adds* to this folder.
- **Naming convention for Tier 2:** verb-noun, kebab-case (`edit-liquid-section`, `run-validation`). The four existing skills already follow this loosely; new ones must.
- **Boundary rule:** if a procedure could be a Toolkit skill, it doesn't belong in Tier 2. If we find ourselves writing "search Shopify docs for X" as a Tier 2 skill, stop and use the Toolkit's `searchShopifyDocs`.

## Consequences

**Positive:**

- Clean ownership: when Shopify ships a new docs API, we get it for free. When our git workflow changes, we update one Tier-2 skill, not a dozen scattered files.
- Tier 2 skills double as instructions for both humans-in-Claude-Code *and* the orchestrator agent (M7+). Same surface, two consumers.
- The four existing skills don't need restructuring. M6 simply expands the folder.
- LLM alignment improves: the model picks "which skill" not "which 200 lines of code" — `prepareFeatureBranch` reads better than a raw shell script.

**Negative:**

- Risk of drift when Toolkit skills overlap with what we'd want a Tier 2 skill to do (e.g. is "validate the whole theme bundle" Tier 1 or Tier 2?). Mitigation: lean Tier 1 whenever possible; Tier 2 only wraps Tier 1 with our custom orchestration around it (e.g. "validate then post the result as a PR comment").
- Tier 2 maintenance is on us. Skills will rot. Mitigation: every skill has a `When to Use` section that flags when it's reasonable to call vs. an alternative — easy to spot a stale skill.
- Some skills sit ambiguously between tiers (e.g. `inspectSectionSchema` — is parsing `{% schema %}` Shopify-domain or repo-domain?). Default rule: if Shopify ships it as a skill, use theirs. If they don't, write our own under Tier 2.

**Neutral:**

- Solo-dev today. Tier 2 skills are also useful for the hypothetical future team — they encode our conventions in a form humans + agents can follow.

## Alternatives considered

| Alternative | Why rejected |
|---|---|
| **Single tier — write everything ourselves** | Reinvents free Shopify capability. Drifts from canonical Shopify behavior. |
| **Single tier — use only Toolkit skills** | Toolkit doesn't know our git workflow, our feature folder structure, our QA conventions. Half the skills we need don't exist there. |
| **Skills tier per agent** (Liquid agent's skills, Config agent's skills, etc.) | Overcomplicated. Skills are reusable across agents — the planner-architect calls `prepareFeatureBranch` and so does the deployment agent. Per-agent silos break that. |
| **Inline procedures into agent prompts** (no skills layer at all) | Hard to test, hard to reuse, hard to evolve. Skills layer is the abstraction that lets the LLM call semantic actions instead of paste boilerplate. |

## What gets added in M6 (not authoritative — M6 spec governs)

Tentative Tier 2 skills planned for M6, in dependency order:

1. `inspect-theme` — given a feature description, returns relevant sections/snippets/settings. Used by planner-architect (M7).
2. `edit-liquid-section` — read → propose → write, gates on Toolkit `validateLiquid`.
3. `edit-config-json` — surgical edits to `templates/*.json`, `config/*.json`, preserving unrelated structure.
4. `edit-assets` — CSS/JS edits with idempotency.
5. `run-validation` — wraps theme-check + Toolkit `validateThemeBundle` + Lighthouse against a preview URL.
6. `manage-feature-branch` — encodes `.claude/rules/git-workflow.md` into a single callable procedure.

## Verification

- Every existing skill (`onboard-theme`, `start-feature`, `scope-feature`, `plan-feature-implemenation`) is reviewed once after M1 closes to confirm it doesn't duplicate Toolkit functionality. If it does, refactor to call Toolkit skills internally.
- Every M6 skill author follows the boundary rule: "if Shopify could ship this, don't write it."
- ADR is "working" if no Tier 2 skill ends up duplicating a Toolkit capability.

## Migration path (if we ever supersede this)

If the Shopify AI Toolkit changes scope dramatically (subsumes our Tier 2, or drops Tier 1 features), we'd:

1. Re-evaluate the boundary rule.
2. Possibly collapse to a single tier of `.claude/skills/` — using Toolkit only as raw tools rather than skills.
3. Mark this ADR `Superseded`.
