// Planner+Architect model interface.
//
// Status (M7): scaffold. The actual Anthropic Agent SDK call lands once the
// SDK shape is verified at install time. The signature below matches the
// reference doc §13.4 and our schema.ts contract.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type {
  PlannerArchitectInput,
  PlannerArchitectOutput,
} from "./schema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function loadSystemPrompt(): Promise<string> {
  return readFile(join(__dirname, "prompt.md"), "utf8");
}

/**
 * Calls the Anthropic Agent SDK with the planner-architect's system prompt
 * and tool surface. Returns a structured Plan + ArchitectDesign.
 *
 * Implementation will use:
 *   import { createAgent } from "@anthropic-ai/claude-agent-sdk";
 *   const agent = createAgent({ model: "claude-opus-4-7", systemPrompt, tools });
 *   const result = await agent.run({ input });
 *
 * Tools surfaced to the agent:
 *  - shopify-dev-mcp's searchShopifyDocs / searchAdminSchema
 *  - fs.listThemeFiles (read-only theme map)
 *  - inspect-theme skill (Tier-2; calls fs + grep)
 */
export async function callPlannerArchitectModel(
  _input: PlannerArchitectInput,
): Promise<PlannerArchitectOutput> {
  const _systemPrompt = await loadSystemPrompt();
  // TODO (M7 close-out / M8): wire Anthropic Agent SDK + Shopify Dev MCP tools.
  throw new Error(
    "callPlannerArchitectModel is not yet implemented at runtime. Scaffold only.",
  );
}
