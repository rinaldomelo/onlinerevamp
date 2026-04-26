import { z } from "zod";
import { ValidationDecision } from "../../types.js";

export const DeploymentInputSchema = z.object({
  planId: z.string(),
  branchName: z.string(),
  validationStatus: ValidationDecision,
  featureRequestId: z.string(),
  commitMessage: z.string(),
  prTitle: z.string(),
  prBody: z.string(),
  targetEnv: z.enum(["development", "staging", "main"]).default("development"),
});
export type DeploymentInput = z.infer<typeof DeploymentInputSchema>;

export const DeploymentOutputSchema = z.object({
  action: z.enum(["open_pr", "auto_merge", "wait_for_human", "refused"]),
  prRef: z
    .object({
      number: z.number(),
      url: z.string().url(),
      base: z.string(),
    })
    .optional(),
  notes: z.string(),
  pairReviewRequired: z.boolean().default(false),
});
export type DeploymentOutput = z.infer<typeof DeploymentOutputSchema>;
