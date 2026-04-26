// Config specialist harness. Surgical JSON edits with cross-reference checks.
//
// Status (M8): scaffold.

import type { PlanTask, AgentObservation } from "../../types.js";
import { readJsonTheme, writeJsonTheme } from "../../tools/fs.js";

const ALLOWED_GLOBS = [
  /^templates\/.+\.json$/,
  /^config\/(settings_data|settings_schema)\.json$/,
  /^locales\/.+\.json$/,
];

function isAllowed(path: string): boolean {
  return ALLOWED_GLOBS.some((re) => re.test(path));
}

export async function runConfigTask(task: PlanTask): Promise<AgentObservation> {
  const payload = task.payload as { filePath: string; description: string };
  const { filePath } = payload;

  if (!isAllowed(filePath)) {
    return {
      agent: "config",
      planId: (payload as { planId?: string }).planId ?? "unknown",
      taskId: task.id,
      success: false,
      notes: `File-glob policy violation: ${filePath} is not config-managed.`,
    };
  }

  const _currentJson = await readJsonTheme(filePath);
  // TODO: callConfigModel({ filePath, currentJson, changeRequest })
  // TODO: validateThemeBundle to check cross-references
  // TODO: writeJsonTheme(filePath, updatedJson)
  void writeJsonTheme;

  return {
    agent: "config",
    planId: (payload as { planId?: string }).planId ?? "unknown",
    taskId: task.id,
    success: false,
    notes: "Config agent harness is scaffold-only; not yet implemented at runtime.",
  };
}
