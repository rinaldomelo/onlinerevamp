// Architect harness — orchestrates the model call (M13).
//
// Steps:
//  1. Read theme files inventory.
//  2. (Optional, M14) fetch Shopify docs context via Shopify Dev MCP.
//  3. Validate the input — held requests are rejected at the schema layer.
//  4. Call the model.
//  5. Zod-validate the output.
//  6. Return Plan + ArchitectDesign.

import type {
  TriagedFeatureRequest,
  Plan,
  ArchitectDesign,
} from "../../types.js";
import { listThemeFiles } from "../../tools/fs.js";
import { callArchitectModel } from "./model.js";
import { ArchitectInputSchema, ArchitectOutputSchema } from "./schema.js";

export interface RunArchitectResult {
  plan: Plan;
  design: ArchitectDesign;
}

export async function runArchitect(
  triagedRequest: TriagedFeatureRequest,
): Promise<RunArchitectResult> {
  const themeFiles = await listThemeFiles();

  const input = ArchitectInputSchema.parse({
    triagedRequest,
    themeAnalysis: {
      sections: themeFiles.sections,
      snippets: themeFiles.snippets,
      templates: themeFiles.templates,
    },
  });

  const raw = await callArchitectModel(input);
  const parsed = ArchitectOutputSchema.parse(raw);
  return { plan: parsed.plan, design: parsed.design };
}
