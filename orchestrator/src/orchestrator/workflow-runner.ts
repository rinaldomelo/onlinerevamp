// Workflow runner — drives the planner-architect, then dispatches plan tasks
// to specialist agents (M8+), validation (M9), deployment (M10).
//
// Status (M7): scaffold with planner-architect wired; specialist dispatch is
// a stub that will be filled by M8.

import type { FeatureRequest, Plan, ArchitectDesign, AgentObservation } from "../types.js";
import { runPlannerArchitect } from "../agents/planner-architect/index.js";
import { observationBus } from "./message-bus.js";
import { dispatchTask } from "./dispatch.js";

export interface RunFeatureResult {
  plan: Plan;
  design: ArchitectDesign;
  observations: AgentObservation[];
}

export async function runFeature(
  featureRequest: FeatureRequest,
): Promise<RunFeatureResult> {
  const observations: AgentObservation[] = [];
  const unsubscribe = observationBus.subscribe((obs) => {
    observations.push(obs);
  });

  try {
    // M7 — planner-architect produces both Plan and ArchitectDesign.
    const { plan, design } = await runPlannerArchitect(featureRequest);

    // M8 — dispatch each task to its specialist agent.
    for (const task of plan.tasks) {
      const obs = await dispatchTask(task);
      await observationBus.publish(obs);
    }

    // M9 — aggregate validation. Stubbed.
    // M10 — deployment. Stubbed.

    return { plan, design, observations };
  } finally {
    unsubscribe();
  }
}

export async function updatePlanWithDesign(
  _planId: string,
  _design: ArchitectDesign,
  _newTasks: Plan["tasks"],
): Promise<void> {
  // Persistence stub. Real impl writes back to .claude/features/<id>/.
}
