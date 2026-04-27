// Planner smoke tests (M13).
//
// Verifies:
//   - TriagedFeatureRequestSchema accepts both ready and held variants.
//   - estimateTeamDays is deterministic at each level (no model calls).
//   - The shared LEVEL_BASELINE_DAYS is the source of truth for L6 → 0.

import { describe, expect, it } from "vitest";
import { TriagedFeatureRequestSchema } from "../src/types.js";
import { estimateTeamDays } from "../src/agents/planner/estimate.js";
import {
  composeGlobs,
  pathFitsLevel,
  LEVEL_BASELINE_DAYS,
} from "../src/agents/level.js";

describe("TriagedFeatureRequest schema", () => {
  it("accepts a ready request with level + estimate", () => {
    const t = TriagedFeatureRequestSchema.parse({
      featureRequest: {
        id: "feature-test",
        title: "Test",
        description: "Lorem",
      },
      status: "ready",
      level: "L3",
      estimatedEffort: {
        teamDays: 1.5,
        confidence: "high",
        factors: ["baseline L3=1.5d"],
      },
      acceptanceCriteria: ["When user clicks X, Y happens."],
    });
    expect(t.status).toBe("ready");
    expect(t.level).toBe("L3");
  });

  it("accepts a held request with missingInputs", () => {
    const t = TriagedFeatureRequestSchema.parse({
      featureRequest: {
        id: "feature-test",
        title: "Test",
        description: "Lorem",
      },
      status: "held",
      heldReason: "Insufficient input.",
      missingInputs: ["Confirm collection identifier."],
    });
    expect(t.status).toBe("held");
    expect(t.missingInputs).toHaveLength(1);
  });
});

describe("estimateTeamDays — deterministic", () => {
  it("L1 baseline with no factors returns 0.25d, high confidence", () => {
    const e = estimateTeamDays("L1", {});
    expect(e.teamDays).toBe(0.25);
    expect(e.confidence).toBe("high");
  });

  it("L4 with novelComponent + variantCount=4 composes multiplicatively", () => {
    const e = estimateTeamDays("L4", { novelComponent: true, variantCount: 4 });
    // 3 × 1.4 × 1.25 = 5.25
    expect(e.teamDays).toBe(5.25);
    expect(e.confidence).toBe("medium");
  });

  it("L5 with variantCount > 5 drops confidence to low", () => {
    const e = estimateTeamDays("L5", { variantCount: 6 });
    // 5 × 1.25 = 6.25
    expect(e.teamDays).toBe(6.25);
    expect(e.confidence).toBe("low");
  });

  it("L6 always returns 0d, low confidence (held)", () => {
    const e = estimateTeamDays("L6", { novelComponent: true, variantCount: 10 });
    expect(e.teamDays).toBe(0);
    expect(e.confidence).toBe("low");
  });

  it("multipliers compose multiplicatively, not additively", () => {
    // L3 × 1.15 (high copy) × 1.1 (responsive) = 1.5 × 1.265 = 1.8975 ≈ 1.9
    const e = estimateTeamDays("L3", {
      copyDensity: "high",
      responsive: true,
    });
    expect(e.teamDays).toBeCloseTo(1.9, 1);
  });
});

describe("level → write-glob composition", () => {
  it("L1 globs are limited to JSON/locales", () => {
    const globs = composeGlobs("L1");
    expect(globs).toContain("templates/*.json");
    expect(globs).toContain("locales/*.json");
    expect(globs).not.toContain("sections/*.liquid");
  });

  it("L4 includes L1+L2+L3+L4 globs cumulatively", () => {
    const globs = composeGlobs("L4");
    expect(globs).toContain("templates/*.json");
    expect(globs).toContain("sections/*.liquid");
    expect(globs).toContain("sections/section-*.liquid");
    expect(globs).toContain("assets/*.css");
  });

  it("L6 returns no allowed write paths (held)", () => {
    expect(composeGlobs("L6")).toEqual([]);
    expect(LEVEL_BASELINE_DAYS.L6).toBe(0);
  });

  it("pathFitsLevel rejects layout/ writes at L4 but accepts at L5", () => {
    expect(pathFitsLevel("L4", "layout/theme.liquid")).toBe(false);
    expect(pathFitsLevel("L5", "layout/theme.liquid")).toBe(true);
  });

  it("pathFitsLevel rejects all writes at L6", () => {
    expect(pathFitsLevel("L6", "templates/index.json")).toBe(false);
  });
});
