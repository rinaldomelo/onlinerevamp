// Architect smoke tests (M13).
//
// Verifies:
//   - ArchitectInputSchema accepts a `ready` triaged request.
//   - ArchitectInputSchema rejects a `held` triaged request (defense in depth).
//   - ArchitectOutputSchema accepts a well-formed Plan + Design.

import { describe, expect, it } from "vitest";
import {
  ArchitectInputSchema,
  ArchitectOutputSchema,
} from "../src/agents/architect/schema.js";

const minimalThemeAnalysis = { sections: [], snippets: [], templates: [] };

const readyTriaged = {
  featureRequest: {
    id: "feature-test",
    title: "Test",
    description: "Lorem",
  },
  status: "ready" as const,
  level: "L3" as const,
  estimatedEffort: {
    teamDays: 1.5,
    confidence: "high" as const,
    factors: ["baseline L3=1.5d"],
  },
  acceptanceCriteria: ["When user clicks X, Y happens."],
};

describe("ArchitectInput schema", () => {
  it("accepts a ready triaged request", () => {
    const parsed = ArchitectInputSchema.parse({
      triagedRequest: readyTriaged,
      themeAnalysis: minimalThemeAnalysis,
    });
    expect(parsed.triagedRequest.status).toBe("ready");
  });

  it("rejects a held triaged request", () => {
    expect(() =>
      ArchitectInputSchema.parse({
        triagedRequest: {
          featureRequest: {
            id: "feature-test",
            title: "Test",
            description: "Lorem",
          },
          status: "held",
          heldReason: "Insufficient input.",
        },
        themeAnalysis: minimalThemeAnalysis,
      }),
    ).toThrow(/architect rejects held requests/);
  });
});

describe("ArchitectOutput schema", () => {
  it("accepts a well-formed Plan + Design", () => {
    const parsed = ArchitectOutputSchema.parse({
      plan: {
        planId: "p1",
        featureRequestId: "f1",
        tasks: [
          {
            id: "T1",
            kind: "liquid-change",
            targetAgent: "liquid",
            payload: { filePath: "sections/section-test.liquid" },
          },
        ],
      },
      design: {
        planId: "p1",
        featureRequestId: "f1",
        themeDecisions: {
          sections: [{ type: "new", file: "sections/section-test.liquid" }],
        },
      },
    });
    expect(parsed.plan.tasks[0].targetAgent).toBe("liquid");
  });

  it("rejects a Plan with an invalid targetAgent", () => {
    expect(() =>
      ArchitectOutputSchema.parse({
        plan: {
          planId: "p1",
          featureRequestId: "f1",
          tasks: [
            {
              id: "T1",
              kind: "liquid-change",
              targetAgent: "bogus",
              payload: {},
            },
          ],
        },
        design: {
          planId: "p1",
          featureRequestId: "f1",
          themeDecisions: { sections: [] },
        },
      }),
    ).toThrow();
  });
});
