// Architect model interface (M13).
//
// Status: scaffold. M14 introduced the by-reference spec resolver and
// ADR-011, but did NOT activate the runtime — that's M15 (see ADR-012 when
// it lands). Signature matches ArchitectInput → ArchitectOutput.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type { ArchitectInput, ArchitectOutput } from "./schema.js";
import { renderLevelTableMarkdown } from "../level.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function loadSystemPrompt(): Promise<string> {
  const raw = await readFile(join(__dirname, "prompt.md"), "utf8");
  return raw.replace("{{LEVEL_TABLE}}", renderLevelTableMarkdown());
}

/**
 * Calls the model with the architect's system prompt and tool surface
 * (Shopify Dev MCP + read-only fs + read_spec).
 *
 * Tools the architect should have access to once M15 wires the runtime:
 *  - shopify-dev-mcp's searchShopifyDocs / searchAdminSchema
 *  - fs.listThemeFiles, fs.readTheme (read-only)
 *  - read_spec scoped to .claude/specs and .claude/context (per ADR-011)
 *  - inspect-theme skill (Tier-2 wrapper around fs + grep)
 */
export async function callArchitectModel(
  _input: ArchitectInput,
): Promise<ArchitectOutput> {
  const _systemPrompt = await loadSystemPrompt();
  // TODO (M15): wire model runtime + Shopify Dev MCP + read_spec tools.
  throw new Error(
    "callArchitectModel is not yet implemented at runtime. Scaffold only — M15 wires the runtime.",
  );
}
