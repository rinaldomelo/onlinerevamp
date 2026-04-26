import { describe, expect, it } from "vitest";
import { ValidationInputSchema, ValidationOutputSchema } from "../src/agents/validation/schema.js";

describe("validation schemas", () => {
  it("parses minimal ValidationInput with default threshold", () => {
    const input = ValidationInputSchema.parse({
      planId: "p1",
      filesTouched: ["sections/section-x.liquid"],
    });
    expect(input.lighthouseThreshold).toBe(90);
  });

  it("parses a human_review ValidationOutput", () => {
    const output = ValidationOutputSchema.parse({
      decision: "human_review",
      tiers: {
        toolkit: { ran: false, errors: [], warnings: [] },
        themeCheck: { ran: false, errors: 0, suggestions: 0, findings: [] },
      },
      routing: [],
      humanReviewReasons: ["Toolkit unavailable"],
    });
    expect(output.decision).toBe("human_review");
  });
});
