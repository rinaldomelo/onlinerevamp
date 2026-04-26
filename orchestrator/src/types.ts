// Cross-cutting types for the orchestrator. Mirrored from the source doc §13.2,
// adapted to use Zod for runtime validation (the Agent SDK accepts Zod schemas
// for tool inputs/outputs).
//
// Status (M7): structural definitions, not yet exercised at runtime.

import { z } from "zod";

// ─── FeatureRequest ──────────────────────────────────────────────────────────

export const FeatureRequestSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  source: z.enum(["user", "system"]).default("user"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  context: z
    .object({
      targetPages: z.array(z.string()).optional(),
      themeName: z.string().optional(),
    })
    .optional(),
});
export type FeatureRequest = z.infer<typeof FeatureRequestSchema>;

// ─── Plan + PlanTask ─────────────────────────────────────────────────────────

export const PlanTaskKind = z.enum([
  "analysis",
  "design",
  "liquid-change",
  "config-change",
  "assets-change",
  "validation",
  "deployment",
]);
export type PlanTaskKind = z.infer<typeof PlanTaskKind>;

export const TargetAgent = z.enum([
  "architect",
  "liquid",
  "config",
  "assets",
  "validation",
  "deployment",
]);
export type TargetAgent = z.infer<typeof TargetAgent>;

export const PlanTaskSchema = z.object({
  id: z.string(),
  kind: PlanTaskKind,
  targetAgent: TargetAgent,
  dependsOn: z.array(z.string()).optional(),
  payload: z.record(z.unknown()),
});
export type PlanTask = z.infer<typeof PlanTaskSchema>;

export const PlanSchema = z.object({
  planId: z.string(),
  featureRequestId: z.string(),
  tasks: z.array(PlanTaskSchema),
});
export type Plan = z.infer<typeof PlanSchema>;

// ─── ArchitectDesign ─────────────────────────────────────────────────────────

export const SectionDecisionSchema = z.object({
  type: z.enum(["new", "modify"]),
  file: z.string(),
  schemaChanges: z.unknown().optional(),
  markupChanges: z.unknown().optional(),
});

export const ArchitectDesignSchema = z.object({
  planId: z.string(),
  featureRequestId: z.string(),
  themeDecisions: z.object({
    sections: z.array(SectionDecisionSchema),
    snippets: z
      .array(z.object({ type: z.enum(["new", "modify"]), file: z.string() }))
      .optional(),
    configChanges: z
      .array(z.object({ file: z.string(), changeDescription: z.string() }))
      .optional(),
    assetsChanges: z
      .array(z.object({ file: z.string(), changeDescription: z.string() }))
      .optional(),
  }),
});
export type ArchitectDesign = z.infer<typeof ArchitectDesignSchema>;

// ─── AgentObservation ────────────────────────────────────────────────────────

export const AgentObservationSchema = z.object({
  agent: z.string(),
  planId: z.string(),
  taskId: z.string(),
  success: z.boolean(),
  notes: z.string().optional(),
  artifacts: z.record(z.unknown()).optional(),
});
export type AgentObservation = z.infer<typeof AgentObservationSchema>;

// ─── Validation decision (M9) ────────────────────────────────────────────────

export const ValidationDecision = z.enum([
  "pass",
  "needs_fixes",
  "human_review",
]);
export type ValidationDecision = z.infer<typeof ValidationDecision>;
