// Liquid specialist harness. Receives a PlanTask, edits one Liquid file,
// validates via Toolkit, returns observation.
//
// Status (M8): scaffold. Wires Tier-2 `edit-liquid-section` skill conceptually.

import type { PlanTask, AgentObservation } from "../../types.js";
import { readTheme, writeTheme } from "../../tools/fs.js";

const ALLOWED_GLOBS = [
  /^sections\/.+\.liquid$/,
  /^snippets\/.+\.liquid$/,
  /^templates\/.+\.liquid$/,
];

function isAllowed(path: string): boolean {
  return ALLOWED_GLOBS.some((re) => re.test(path));
}

export async function runLiquidTask(task: PlanTask): Promise<AgentObservation> {
  const payload = task.payload as { filePath: string; description: string };
  const { filePath, description } = payload;

  if (!isAllowed(filePath)) {
    return {
      agent: "liquid",
      planId: (payload as { planId?: string }).planId ?? "unknown",
      taskId: task.id,
      success: false,
      notes: `File-glob policy violation: ${filePath} is not under sections/snippets/templates.`,
    };
  }

  // M8 scaffold: read → model edit → validate → write.
  // Real impl uses the Anthropic Agent SDK + Toolkit validateLiquid.
  const _currentContent = await readTheme(filePath);
  const _changeRequest = description;
  // TODO: callLiquidModel({ filePath, currentContent, changeRequest })
  // TODO: validateLiquid({ content: updatedContent, filePath })
  // TODO: writeTheme(filePath, updatedContent)
  void writeTheme;

  return {
    agent: "liquid",
    planId: (payload as { planId?: string }).planId ?? "unknown",
    taskId: task.id,
    success: false,
    notes: "Liquid agent harness is scaffold-only; not yet implemented at runtime.",
  };
}
