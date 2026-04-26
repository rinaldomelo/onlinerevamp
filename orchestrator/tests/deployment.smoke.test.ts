import { describe, expect, it } from "vitest";
import { DeploymentInputSchema } from "../src/agents/deployment/schema.js";

describe("deployment input schema", () => {
  it("defaults targetEnv to development", () => {
    const input = DeploymentInputSchema.parse({
      planId: "p1",
      branchName: "feature/foo",
      validationStatus: "pass",
      featureRequestId: "f1",
      commitMessage: "feat: foo",
      prTitle: "feat: foo",
      prBody: "Body",
    });
    expect(input.targetEnv).toBe("development");
  });

  it("rejects an unknown targetEnv", () => {
    expect(() =>
      DeploymentInputSchema.parse({
        planId: "p1",
        branchName: "feature/foo",
        validationStatus: "pass",
        featureRequestId: "f1",
        commitMessage: "feat",
        prTitle: "feat",
        prBody: "body",
        targetEnv: "production", // invalid — should be "main"
      }),
    ).toThrow();
  });
});
