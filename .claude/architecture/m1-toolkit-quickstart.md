# M1 — Shopify AI Toolkit Quickstart

> Quickstart for the [Shopify AI Toolkit](https://github.com/Shopify/Shopify-AI-Toolkit) plugin (Pattern A — see [ADR-001](./adr/ADR-001-shopify-ai-toolkit-pattern-a.md)).
>
> **Status:** Skeleton. Install + smoke-test sections have TODO markers — fill them in after running the install.

---

## What this is

The Toolkit is Shopify's official agent plugin. Once installed in Claude Code, every interactive session can call:

- `searchShopifyDocs` — current Shopify docs, no stale training data
- `searchAdminSchema` — Admin API GraphQL types
- `searchStorefrontSchema` — Storefront API types
- `validateLiquid` — Liquid syntax + Shopify-object validation
- `validateThemeBundle` — multi-file cross-reference checks
- `validateGraphQL` — GraphQL query lint
- (And whatever else the Toolkit ships now — run `/plugin list` after install for the canonical list.)

Skills are auto-updated; we don't fork or vendor them.

## Install (run once per machine)

In a Claude Code session, run:

```
/plugin marketplace add Shopify/shopify-ai-toolkit
/plugin install shopify-plugin@shopify-ai-toolkit
```

Restart Claude Code if skills don't appear immediately.

Verify install:

```
/plugin list
```

You should see `shopify-plugin` listed as enabled.

## Smoke tests

Run all three in a fresh Claude Code session and paste the highlights below.

### Test 1 — Docs search

**Prompt:** Search Shopify docs for `recommendations.products` Liquid object.

**Expected:** ≥1 result documenting the object and its accepted limit.

**Result (paste output highlights):**

```
TODO — paste a 1–3 line summary of what came back.
```

### Test 2 — Liquid validation

**Prompt:** Validate `sections/section-new-hero.liquid` (existing file, known-good).

**Expected:** No fatal errors. Possibly some style warnings.

**Result (paste output highlights):**

```
TODO — paste validation summary.
```

### Test 3 — Admin schema search

**Prompt:** Search Admin API schema for `MetafieldDefinition`.

**Expected:** Returns the GraphQL type definition with fields like `id`, `name`, `namespace`, `type`, `description`, etc. Auth may be required for this one — see Gotchas if it errors.

**Result (paste output highlights):**

```
TODO — paste schema fields summary.
```

## Skills available (post-install)

After install, run `/plugin list` and paste the skill names + one-line each below.

```
TODO — paste the skill list. Format: `<skill-name> — <one-line purpose>`.
```

## When to use which skill

Decision table (fill after smoke testing reveals exact skill names):

| If you need to… | Call this skill |
|---|---|
| Confirm a Liquid object exists or check its filters | `searchShopifyDocs` |
| Look up an Admin API mutation/type for metafields, products, etc. | `searchAdminSchema` |
| Sanity-check a section file you just edited | `validateLiquid` |
| Verify cross-file references (template → section → snippet) | `validateThemeBundle` |
| TODO — add more rows after smoke testing | TODO |

## Gotchas

- **Auth on `searchAdminSchema`:** if it errors with an auth/scope message, follow the Toolkit's setup docs to authorize the plugin against a dev store. Document the steps you took here so the next session doesn't re-debug.

  ```
  TODO — paste the steps that worked, or "no auth issue encountered."
  ```

- **Skill naming drift:** Toolkit may rename skills between releases. If a skill in this doc no longer exists, link to the current Toolkit README rather than guessing.

- **Per-machine install:** Pattern A is opt-in per Claude Code instance. If a future contributor joins or you switch machines, re-run the install commands above.

- **Coexistence with `.mcp.json`:** When [M7](./milestones/M1-toolkit-mcp-wiring.md) lands and `.mcp.json` is added at the repo root, *interactive* sessions will reach the Toolkit through both the plugin AND the MCP server. They overlap, not conflict — but be aware tool calls may have duplicate names.

## Uninstall / rollback

```
/plugin uninstall shopify-plugin
```

This returns Claude Code to the pre-Pattern-A state. The Toolkit's MCP server (Pattern B, from M7) is unaffected.

---

## Maintenance

- Re-run smoke tests when Toolkit announces a major version bump.
- If the skill list changes, update the "Skills available" + "When to use which skill" sections.
- Don't duplicate Shopify's Toolkit README — link to it.
