// Smoke tests for the planner-architect agent. Mocks the model + Toolkit
// calls; verifies the harness's input/output shape.
//
// Status (M7): scaffold. Real assertions added when model.ts has runtime impl.

import { describe, expect, it } from "vitest";
import { FeatureRequestSchema, PlanSchema, ArchitectDesignSchema } from "../src/types.js";

describe("planner-architect schemas", () => {
  it("parses a minimal FeatureRequest", () => {
    const fr = FeatureRequestSchema.parse({
      id: "feature-test",
      title: "Test feature",
      description: "Lorem ipsum",
    });
    expect(fr.priority).toBe("medium");
    expect(fr.source).toBe("user");
  });

  it("rejects an invalid Plan (missing tasks)", () => {
    expect(() =>
      PlanSchema.parse({ planId: "p1", featureRequestId: "f1" }),
    ).toThrow();
  });

  it("accepts a well-formed ArchitectDesign", () => {
    const d = ArchitectDesignSchema.parse({
      planId: "p1",
      featureRequestId: "f1",
      themeDecisions: {
        sections: [{ type: "new", file: "sections/section-test.liquid" }],
      },
    });
    expect(d.themeDecisions.sections[0].type).toBe("new");
  });
});

// TODO (M7 close-out): mock the Anthropic Agent SDK + MCP client and run
// runPlannerArchitect end-to-end against a fixture FeatureRequest.
