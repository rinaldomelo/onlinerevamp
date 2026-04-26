# ADR-002 — MCP Server Wiring via Repo `.mcp.json` for `@shopify/dev-mcp`

- **Status:** Accepted (implementation deferred to M7)
- **Date:** 2026-04-25
- **Deciders:** Rinaldo (solo dev)
- **Implements:** Milestone M7
- **Related:** ADR-001 (Pattern A plugin install), ADR-005 (orchestrator stack)

---

## Context

ADR-001 covers the **interactive** Toolkit access path (Pattern A). When we get to M7 — the first autonomous orchestrator built on the Anthropic Agent SDK — the agent runs **outside** an IDE and cannot reach plugin-provided skills. It needs the Toolkit's capabilities exposed as MCP tools that a TypeScript harness can call directly.

The Toolkit ships exactly this as `@shopify/dev-mcp`, an MCP server runnable via `npx`. Two questions:

1. **Where do we declare it?** Options: per-project `.mcp.json` at repo root, user-global `~/.claude.json`, or a private orchestrator-side config.
2. **When do we declare it?** Now (M0/M1) or just-in-time (M7)?

## Decision

**When the orchestrator (M7) is being built, declare `@shopify/dev-mcp` in `.mcp.json` at the repo root.** Do not add `.mcp.json` until M7 — there is no consumer for it before then.

Concretely, in M7:

1. Add `.mcp.json` at the repo root with this content (subject to verification against the Toolkit's then-current README):

   ```json
   {
     "mcpServers": {
       "shopify-dev-mcp": {
         "command": "npx",
         "args": ["-y", "@shopify/dev-mcp@latest"]
       }
     }
   }
   ```

2. The orchestrator's harness reads `.mcp.json` (or accepts the path explicitly) and instantiates an MCP client. The Agent SDK supports MCP natively; no custom client code beyond a thin typed wrapper.

3. Tool names exposed by the MCP server (e.g. `searchShopifyDocs`, `validateLiquid`, `validateThemeBundle`, `searchAdminSchema`) are listed in the orchestrator's `tools.md` so future maintainers can see what's reachable.

## Consequences

**Positive:**

- Repo-local `.mcp.json` keeps the orchestrator portable: anyone who clones the repo and runs the orchestrator gets the same MCP tool surface.
- Versioning the file means we have a Git-tracked record of which MCP servers the orchestrator depends on. ADR diffs explain *why*.
- Pattern A (plugin) and Pattern B (`.mcp.json`) coexist cleanly — interactive sessions still get plugin skills; orchestrator gets MCP server. No duplication, just different access paths.
- `npx -y @shopify/dev-mcp@latest` always pulls the latest published Toolkit, matching the auto-update story from ADR-001.

**Negative:**

- `.mcp.json` at the repo root is read by Claude Code automatically, which means once it's added (in M7), the *interactive* sessions also start using the MCP server in addition to the plugin. That's fine — they overlap, not conflict — but it's a behavior change worth documenting in the M7 spec.
- `npx` cold-starts each invocation. If the orchestrator is sensitive to MCP startup latency, M7 may need to switch to a long-running server process. Defer until measured.
- Pinning to `@latest` means a Toolkit-side breaking change could regress the orchestrator. Mitigation: M7's CI runs the agent's smoke tests; M11's observability catches drift. If we hit a real regression, pin via `@shopify/dev-mcp@<version>` and bump deliberately.

**Neutral:**

- The reference doc (§15.3) shows this exact `.mcp.json` shape. Following the canonical example reduces the chance of subtle config errors.

## Alternatives considered

| Alternative | Why rejected |
|---|---|
| **Add `.mcp.json` in M0 or M1** | No consumer until M7. Adding earlier is dead config that may rot or confuse contributors. |
| **User-global `~/.claude.json`** | Hides the dependency from the repo. Cloning the repo wouldn't be enough to reproduce the orchestrator. Worse for collaboration / future-team scenarios. |
| **Private orchestrator-side MCP config (not in `.mcp.json`)** | Same downside as user-global, plus surprises future contributors who expect repo-local config. |
| **Skip MCP, call Toolkit via WebFetch / shell** | Fragile, slower, loses the structured tool-call contract. The whole point of MCP is the typed surface. |
| **Build a custom MCP server wrapping `theme-check` + `WebFetch`** | Reinventing what Shopify ships free. Only revisit if Toolkit becomes unavailable. |

## Migration path (if we ever supersede this)

- **If Toolkit's API changes incompatibly:** pin a known-good version in `.mcp.json` (`@shopify/dev-mcp@1.x`), open an issue, evaluate alternatives.
- **If we move to a non-Anthropic agent runtime:** the MCP standard is portable across vendors. `.mcp.json` itself may need a different filename, but the underlying server is reusable.
- **If the orchestrator runs in a container without `npx`:** the alternative is `docker run shopify/dev-mcp` or pinning a binary release. M7 will document the runtime dependency.

## Verification (Pattern B is "working")

(Performed in M7, not M0.)

- A standalone Node process running the orchestrator's harness can call `searchShopifyDocs({ query: "section blocks" })` and receive structured results.
- Tool list returned by the MCP server includes at least `searchShopifyDocs`, `searchAdminSchema`, `validateLiquid`, `validateThemeBundle`.
- A deliberately broken Liquid file routed through `validateLiquid` returns errors with file/line.
- Removing `.mcp.json` and re-running the orchestrator produces a deterministic startup error (not silent fallback) — confirms the dependency is real and visible.
