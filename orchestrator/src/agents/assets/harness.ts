// Assets specialist harness. CSS/JS edits with idempotency.
//
// Status (M8): scaffold.

import type { PlanTask, AgentObservation } from "../../types.js";
import { readTheme, writeTheme } from "../../tools/fs.js";

const ALLOWED_GLOBS = [/^assets\/.+\.(css|js|svg|png|jpg|jpeg|webp)$/];

function isAllowed(path: string): boolean {
  return ALLOWED_GLOBS.some((re) => re.test(path));
}

export async function runAssetsTask(task: PlanTask): Promise<AgentObservation> {
  const payload = task.payload as { filePath: string; description: string };
  const { filePath } = payload;

  if (!isAllowed(filePath)) {
    return {
      agent: "assets",
      planId: (payload as { planId?: string }).planId ?? "unknown",
      taskId: task.id,
      success: false,
      notes: `File-glob policy violation: ${filePath} is not under assets/.`,
    };
  }

  const _currentContent = await readTheme(filePath);
  // TODO: idempotency check — search for existing rule/function matching target.
  // TODO: callAssetsModel({ filePath, currentContent, changeRequest })
  // TODO: writeTheme(filePath, updatedContent)
  void writeTheme;

  return {
    agent: "assets",
    planId: (payload as { planId?: string }).planId ?? "unknown",
    taskId: task.id,
    success: false,
    notes: "Assets agent harness is scaffold-only; not yet implemented at runtime.",
  };
}
