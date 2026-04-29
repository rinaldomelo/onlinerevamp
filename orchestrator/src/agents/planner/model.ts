// Planner model interface (M13).
//
// Status: scaffold. M14 added the by-reference spec resolver
// (`agents/shared/resolveProjectContext.ts`) and ADR-011, but did NOT activate
// the runtime — that's M15 (open ADR-012 at that point capturing
// SDK-subprocess vs. raw-Messages-API). The signature matches
// PlannerInput → PlannerOutput.

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
 * Calls the model with the planner's system prompt and a multimodal-aware
 * input (image references should become `image` content blocks).
 *
 * The runtime choice (Claude Agent SDK as a subprocess vs. raw Anthropic
 * Messages API + a hand-rolled tool loop) is open until M15 — ADR-012 will
 * record the decision. Both surfaces can satisfy the PlannerInput → PlannerOutput
 * contract; M14's hero demo (run via in-conversation Agent sub-agents) gave
 * the by-reference shape an early proof-of-life that M15 builds on.
 */
export async function callPlannerModel(
  _input: PlannerInput,
): Promise<PlannerOutput> {
  const _systemPrompt = await loadSystemPrompt();
  // TODO (M15): wire model runtime + read_spec tool + multimodal image content blocks.
  throw new Error(
    "callPlannerModel is not yet implemented at runtime. Scaffold only — M15 wires the runtime.",
  );
}
