// Workflow runner — drives planner → architect → specialist dispatch (M13).
//
// Two upstream stages:
//   1. Planner triages the FeatureRequest into a TriagedFeatureRequest.
//      If `held`, the runner returns immediately — no architect, no dispatch.
//   2. Architect maps the ready triaged request to Plan + ArchitectDesign.
// Then specialist dispatch runs each PlanTask (existing M8 behavior).

import type {
  FeatureRequest,
  Plan,
  ArchitectDesign,
  AgentObservation,
  FeatureLevel,
  EstimatedEffort,
} from "../types.js";
import { runPlanner } from "../agents/planner/index.js";
import { runArchitect } from "../agents/architect/index.js";
import { observationBus } from "./message-bus.js";
import { dispatchTask } from "./dispatch.js";

export type RunFeatureResult =
  | {
      status: "held";
      reason: string;
      missingInputs: string[];
      observations: AgentObservation[];
    }
  | {
      status: "complete";
      level: FeatureLevel;
      estimatedEffort: EstimatedEffort;
      plan: Plan;
      design: ArchitectDesign;
      observations: AgentObservation[];
    };

export async function runFeature(
  featureRequest: FeatureRequest,
): Promise<RunFeatureResult> {
  const observations: AgentObservation[] = [];
  const unsubscribe = observationBus.subscribe((obs) => {
    observations.push(obs);
  });

  try {
    // Stage 1 — Planner
    const triaged = await runPlanner(featureRequest);
    if (triaged.status === "held") {
      return {
        status: "held",
        reason: triaged.heldReason ?? "(planner did not provide a reason)",
        missingInputs: triaged.missingInputs ?? [],
        observations,
      };
    }

    if (!triaged.level || !triaged.estimatedEffort) {
      throw new Error(
        "Planner returned status=ready but missing level or estimatedEffort — schema invariant violated",
      );
    }

    // Stage 2 — Architect
    const { plan, design } = await runArchitect(triaged);

    // Stage 3 — Specialist dispatch (existing M8 behavior)
    for (const task of plan.tasks) {
      const obs = await dispatchTask(task);
      await observationBus.publish(obs);
    }

    return {
      status: "complete",
      level: triaged.level,
      estimatedEffort: triaged.estimatedEffort,
      plan,
      design,
      observations,
    };
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
