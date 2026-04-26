// Specialist dispatch — routes a PlanTask to the right agent based on
// `task.targetAgent`. Used by the workflow runner.
//
// Status (M8): wires liquid / config / assets. Validation (M9) and
// deployment (M10) get added in their own milestones.

import type { PlanTask, AgentObservation } from "../types.js";
import { runLiquidTask } from "../agents/liquid/index.js";
import { runConfigTask } from "../agents/config/index.js";
import { runAssetsTask } from "../agents/assets/index.js";

export async function dispatchTask(task: PlanTask): Promise<AgentObservation> {
  switch (task.targetAgent) {
    case "liquid":
      return runLiquidTask(task);
    case "config":
      return runConfigTask(task);
    case "assets":
      return runAssetsTask(task);
    case "validation":
      return notImplemented(task, "validation", "M9");
    case "deployment":
      return notImplemented(task, "deployment", "M10");
    case "architect":
      throw new Error(
        `dispatchTask received targetAgent "architect"; planner-architect runs upstream`,
      );
    default: {
      const _exhaustive: never = task.targetAgent;
      throw new Error(`Unknown targetAgent: ${String(_exhaustive)}`);
    }
  }
}

function notImplemented(
  task: PlanTask,
  agent: string,
  milestone: string,
): AgentObservation {
  return {
    agent,
    planId: (task.payload as { planId?: string }).planId ?? "unknown",
    taskId: task.id,
    success: false,
    notes: `${agent} agent not implemented yet — see ${milestone}.`,
  };
}
