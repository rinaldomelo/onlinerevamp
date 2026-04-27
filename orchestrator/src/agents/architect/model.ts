// Architect model interface (M13).
//
// Status: scaffold. The actual Anthropic Agent SDK call lands when M14 wires
// runtime activation. Signature matches ArchitectInput → ArchitectOutput.

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
 * Calls the Anthropic Agent SDK with the architect's system prompt and tool
 * surface (Shopify Dev MCP + read-only fs).
 *
 * Implementation will use:
 *   import { createAgent } from "@anthropic-ai/claude-agent-sdk";
 *   const agent = createAgent({ model: "claude-opus-4-7", systemPrompt, tools });
 *   const result = await agent.run({ input });
 *   return ArchitectOutputSchema.parse(result);
 *
 * Tools surfaced:
 *  - shopify-dev-mcp's searchShopifyDocs / searchAdminSchema
 *  - fs.listThemeFiles, fs.readTheme (read-only)
 *  - inspect-theme skill (Tier-2 wrapper around fs + grep)
 */
export async function callArchitectModel(
  _input: ArchitectInput,
): Promise<ArchitectOutput> {
  const _systemPrompt = await loadSystemPrompt();
  // TODO (M14): wire Anthropic Agent SDK + Shopify Dev MCP tools.
  throw new Error(
    "callArchitectModel is not yet implemented at runtime. Scaffold only.",
  );
}
