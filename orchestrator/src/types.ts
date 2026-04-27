// Cross-cutting types for the orchestrator. Mirrored from the source doc §13.2,
// adapted to use Zod for runtime validation (the Agent SDK accepts Zod schemas
// for tool inputs/outputs).
//
// Status (M13): Phase-2 split landed. `TriagedFeatureRequest` is the bridge
// type between planner and architect; see ADR-010.

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

// ─── Feature level (M13) ─────────────────────────────────────────────────────

export const FeatureLevel = z.enum(["L1", "L2", "L3", "L4", "L5", "L6"]);
export type FeatureLevel = z.infer<typeof FeatureLevel>;

// ─── References (planner intake — M13) ───────────────────────────────────────

export const FeatureReferenceSchema = z.object({
  kind: z.enum(["image", "html", "url", "text", "design"]),
  path: z.string(),
  mime: z.string().optional(),
  note: z.string().optional(),
});
export type FeatureReference = z.infer<typeof FeatureReferenceSchema>;

// ─── Estimated effort (M13) ──────────────────────────────────────────────────

export const EstimatedEffortSchema = z.object({
  teamDays: z.number().nonnegative(),
  confidence: z.enum(["low", "medium", "high"]),
  factors: z.array(z.string()),
});
export type EstimatedEffort = z.infer<typeof EstimatedEffortSchema>;

// ─── TriagedFeatureRequest (planner → architect bridge — M13) ────────────────
//
// NOTE: This is a flat schema with optional fields, NOT a Zod discriminated
// union. The optional fields (`level`, `estimatedEffort`, `heldReason`,
// `missingInputs`) are gated by `status` semantically — the planner emits
// `level` + `estimatedEffort` iff `status === "ready"`, and `heldReason` +
// `missingInputs` iff `status === "held"`. The workflow runner enforces this
// at the boundary (see workflow-runner.ts's "schema invariant violated" guard).
//
// Do NOT refactor this into z.discriminatedUnion("status", [...]) without
// also updating the architect's `ArchitectInputSchema.refine()` and every
// caller that destructures from the parse result — TS narrowing changes
// shape and the architect's contract breaks silently.

export const TriagedFeatureRequestSchema = z.object({
  featureRequest: FeatureRequestSchema,
  status: z.enum(["ready", "held"]),
  level: FeatureLevel.optional(),
  estimatedEffort: EstimatedEffortSchema.optional(),
  acceptanceCriteria: z.array(z.string()).optional(),
  references: z.array(FeatureReferenceSchema).optional(),
  heldReason: z.string().optional(),
  missingInputs: z.array(z.string()).optional(),
});
export type TriagedFeatureRequest = z.infer<typeof TriagedFeatureRequestSchema>;

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
  "planner",
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
