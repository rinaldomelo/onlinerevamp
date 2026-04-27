// Planner model interface (M13).
//
// Status: scaffold. The actual Anthropic Agent SDK call lands when M14 wires
// runtime activation. The signature matches PlannerInput → PlannerOutput.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type { PlannerInput, PlannerOutput } from "./schema.js";
import { renderLevelTableMarkdown } from "../level.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Loads prompt.md and substitutes the {{LEVEL_TABLE}} placeholder with the
 * canonical markdown rendering of LEVEL_WRITE_GLOBS. This keeps the prompt
 * in sync with the level constant — the agent never sees a stale table.
 */
async function loadSystemPrompt(): Promise<string> {
  const raw = await readFile(join(__dirname, "prompt.md"), "utf8");
  return raw.replace("{{LEVEL_TABLE}}", renderLevelTableMarkdown());
}

/**
 * Calls the Anthropic Agent SDK with the planner's system prompt and a
 * multimodal-content-aware input (image references become `image` content
 * blocks).
 *
 * Implementation will use:
 *   import { createAgent } from "@anthropic-ai/claude-agent-sdk";
 *   const agent = createAgent({ model: "claude-opus-4-7", systemPrompt, tools: [/ref-fs/] });
 *   const result = await agent.run({ input });
 *   return PlannerOutputSchema.parse(result);
 */
export async function callPlannerModel(
  _input: PlannerInput,
): Promise<PlannerOutput> {
  const _systemPrompt = await loadSystemPrompt();
  // TODO (M14): wire Anthropic Agent SDK + multimodal image content blocks.
  throw new Error(
    "callPlannerModel is not yet implemented at runtime. Scaffold only.",
  );
}
