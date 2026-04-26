// Zod schemas for the planner-architect's input/output contract.

import { z } from "zod";
import { FeatureRequestSchema, PlanSchema, ArchitectDesignSchema } from "../../types.js";

export const PlannerArchitectInputSchema = z.object({
  featureRequest: FeatureRequestSchema,
  themeAnalysis: z.object({
    sections: z.array(z.string()),
    snippets: z.array(z.string()),
    templates: z.array(z.string()),
    settingsSchema: z.unknown().optional(),
  }),
  shopifyDocsContext: z
    .object({
      results: z.array(
        z.object({ title: z.string(), url: z.string(), snippet: z.string() }),
      ),
    })
    .optional(),
});
export type PlannerArchitectInput = z.infer<typeof PlannerArchitectInputSchema>;

export const PlannerArchitectOutputSchema = z.object({
  plan: PlanSchema,
  design: ArchitectDesignSchema,
});
export type PlannerArchitectOutput = z.infer<typeof PlannerArchitectOutputSchema>;
