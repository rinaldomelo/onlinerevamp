// Zod schemas for the architect's input/output contract (M13).
//
// The architect consumes only `ready` (non-held) TriagedFeatureRequests
// produced by the planner, and emits the existing Plan + ArchitectDesign
// shape that downstream specialists (M8) consume. Refusing held inputs
// at the schema layer is defense-in-depth: the workflow runner already
// short-circuits on held, but enforcing it here too means tests can
// assert the invariant directly.

import { z } from "zod";
import {
  TriagedFeatureRequestSchema,
  PlanSchema,
  ArchitectDesignSchema,
} from "../../types.js";

const ReadyTriagedFeatureRequestSchema = TriagedFeatureRequestSchema.refine(
  (t) => t.status === "ready",
  { message: "architect rejects held requests" },
);

export const ArchitectInputSchema = z.object({
  triagedRequest: ReadyTriagedFeatureRequestSchema,
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
export type ArchitectInput = z.infer<typeof ArchitectInputSchema>;

export const ArchitectOutputSchema = z.object({
  plan: PlanSchema,
  design: ArchitectDesignSchema,
});
export type ArchitectOutput = z.infer<typeof ArchitectOutputSchema>;
