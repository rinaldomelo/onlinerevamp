// Deterministic team-day estimator (ADR-010, M13).
//
// The planner's model proposes EstimateFactors based on the feature request;
// this helper converts factors → number using a fixed multiplier table.
// Reproducible across runs. Recalibrate baselines/multipliers in level.ts
// after observation logs accumulate.

import { LEVEL_BASELINE_DAYS } from "../level.js";
import type { FeatureLevel, EstimatedEffort } from "../../types.js";

export interface EstimateFactors {
  variantCount?: number;
  copyDensity?: "low" | "medium" | "high";
  novelComponent?: boolean;
  responsive?: boolean;
}

/**
 * Compose teamDays from a level baseline and a set of factors.
 *
 * Multipliers compose multiplicatively, uncapped:
 *   - variantCount > 3        → ×1.25
 *   - copyDensity === "high"  → ×1.15
 *   - novelComponent === true → ×1.4
 *   - responsive === true     → ×1.1
 *
 * If the math exceeds the next level's baseline, that's signal — surface it
 * rather than smooth it over.
 *
 * L6 is always held: returns 0 days, low confidence.
 */
export function estimateTeamDays(
  level: FeatureLevel,
  factors: EstimateFactors,
): EstimatedEffort {
  if (level === "L6") {
    return { teamDays: 0, confidence: "low", factors: ["L6 — held, no estimate"] };
  }

  const baseline = LEVEL_BASELINE_DAYS[level];
  const applied: string[] = [`baseline ${level}=${baseline}d`];
  let multiplier = 1;

  if (typeof factors.variantCount === "number" && factors.variantCount > 3) {
    multiplier *= 1.25;
    applied.push(`variantCount=${factors.variantCount} ×1.25`);
  }
  if (factors.copyDensity === "high") {
    multiplier *= 1.15;
    applied.push("copyDensity=high ×1.15");
  }
  if (factors.novelComponent === true) {
    multiplier *= 1.4;
    applied.push("novelComponent ×1.4");
  }
  if (factors.responsive === true) {
    multiplier *= 1.1;
    applied.push("responsive ×1.1");
  }

  const teamDays = Math.round(baseline * multiplier * 100) / 100;
  const confidence = computeConfidence(level, factors);
  return { teamDays, confidence, factors: applied };
}

function computeConfidence(
  level: FeatureLevel,
  factors: EstimateFactors,
): "low" | "medium" | "high" {
  if (level === "L1" || level === "L2") return "high";
  if (level === "L3") return factors.novelComponent ? "medium" : "high";
  // L4, L5
  if (typeof factors.variantCount === "number" && factors.variantCount > 5) {
    return "low";
  }
  return "medium";
}
