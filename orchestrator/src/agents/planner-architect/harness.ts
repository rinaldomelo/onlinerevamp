// Planner+Architect harness — orchestrates the model call:
// 1. Read theme files inventory.
// 2. Optionally fetch Shopify docs context via Toolkit.
// 3. Call the model.
// 4. Validate output shape (Zod).
// 5. Persist Plan + Design back to feature folder.
//
// Status (M7): scaffold; runtime wiring lands when MCP client is real.

import type {
  FeatureRequest,
  Plan,
  ArchitectDesign,
} from "../../types.js";
import { listThemeFiles } from "../../tools/fs.js";
import { callPlannerArchitectModel } from "./model.js";
import { PlannerArchitectOutputSchema } from "./schema.js";

export interface RunPlannerArchitectResult {
  plan: Plan;
  design: ArchitectDesign;
}

export async function runPlannerArchitect(
  featureRequest: FeatureRequest,
): Promise<RunPlannerArchitectResult> {
  const themeFiles = await listThemeFiles();

  // M7 scaffold: skip Toolkit docs lookup until MCP client is real.
  // const docs = await mcp.searchShopifyDocs({ query: featureRequest.title, maxResults: 5 });

  const raw = await callPlannerArchitectModel({
    featureRequest,
    themeAnalysis: {
      sections: themeFiles.sections,
      snippets: themeFiles.snippets,
      templates: themeFiles.templates,
    },
  });

  const parsed = PlannerArchitectOutputSchema.parse(raw);
  return { plan: parsed.plan, design: parsed.design };
}
