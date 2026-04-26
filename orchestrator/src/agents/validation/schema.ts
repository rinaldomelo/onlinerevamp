import { z } from "zod";
import { ValidationDecision } from "../../types.js";

export const ValidationInputSchema = z.object({
  planId: z.string(),
  filesTouched: z.array(z.string()),
  previewUrl: z.string().url().optional(),
  lighthouseThreshold: z.number().min(0).max(100).default(90),
});
export type ValidationInput = z.infer<typeof ValidationInputSchema>;

export const ValidationOutputSchema = z.object({
  decision: ValidationDecision,
  tiers: z.object({
    toolkit: z.object({
      ran: z.boolean(),
      errors: z.array(z.object({ file: z.string(), message: z.string() })),
      warnings: z.array(z.object({ file: z.string(), message: z.string() })),
    }),
    themeCheck: z.object({
      ran: z.boolean(),
      errors: z.number(),
      suggestions: z.number(),
      findings: z.array(
        z.object({ file: z.string(), line: z.number().optional(), message: z.string() }),
      ),
    }),
    lighthouse: z
      .object({
        ran: z.boolean(),
        performance: z.number(),
        accessibility: z.number(),
        seo: z.number(),
      })
      .optional(),
  }),
  routing: z.array(
    z.object({
      filePath: z.string(),
      agent: z.enum(["liquid", "config", "assets"]),
      issue: z.string(),
    }),
  ),
  humanReviewReasons: z.array(z.string()).optional(),
});
export type ValidationOutput = z.infer<typeof ValidationOutputSchema>;
