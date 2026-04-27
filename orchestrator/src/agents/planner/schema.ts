// Zod schemas for the planner's input/output contract (M13).
//
// The planner consumes raw human intent (FeatureRequest + assets in the
// feature folder's reference/) and emits a TriagedFeatureRequest — either
// `ready` (level + estimate + acceptance criteria) or `held` (missingInputs).

import { z } from "zod";
import {
  FeatureRequestSchema,
  FeatureReferenceSchema,
  TriagedFeatureRequestSchema,
} from "../../types.js";

export const PlannerInputSchema = z.object({
  featureRequest: FeatureRequestSchema,
  references: z.array(FeatureReferenceSchema).default([]),
  themeAnalysis: z.object({
    sections: z.array(z.string()),
    snippets: z.array(z.string()),
    templates: z.array(z.string()),
  }),
});
export type PlannerInput = z.infer<typeof PlannerInputSchema>;

export const PlannerOutputSchema = TriagedFeatureRequestSchema;
export type PlannerOutput = z.infer<typeof PlannerOutputSchema>;
