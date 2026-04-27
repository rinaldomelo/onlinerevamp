// Planner harness — orchestrates the model call (M13).
//
// Steps:
//  1. Enumerate .claude/features/<id>/reference/ to build FeatureReference[].
//  2. Read the theme file inventory.
//  3. Call the planner model with the multimodal-aware input.
//  4. Zod-validate the output.
//  5. If `ready`: re-derive teamDays via the deterministic estimator
//     (the model proposes factors; the helper produces the number).
//  6. Return the TriagedFeatureRequest.

import { readdir, stat } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import type {
  FeatureRequest,
  FeatureReference,
  TriagedFeatureRequest,
} from "../../types.js";
import { listThemeFiles } from "../../tools/fs.js";
import { callPlannerModel } from "./model.js";
import { PlannerOutputSchema } from "./schema.js";
import { estimateTeamDays, type EstimateFactors } from "./estimate.js";

const THEME_ROOT = resolve(process.env.THEME_ROOT ?? "..");

export async function runPlanner(
  featureRequest: FeatureRequest,
): Promise<TriagedFeatureRequest> {
  const references = await enumerateReferences(featureRequest.id);
  const themeFiles = await listThemeFiles();

  const raw = await callPlannerModel({
    featureRequest,
    references,
    themeAnalysis: {
      sections: themeFiles.sections,
      snippets: themeFiles.snippets,
      templates: themeFiles.templates,
    },
  });

  const triaged = PlannerOutputSchema.parse(raw);

  if (triaged.status === "ready" && triaged.level) {
    const factors = (triaged.estimatedEffort?.factors ?? []).reduce<EstimateFactors>(
      readFactorsFromModelHints,
      {},
    );
    return { ...triaged, estimatedEffort: estimateTeamDays(triaged.level, factors) };
  }

  return triaged;
}

async function enumerateReferences(featureId: string): Promise<FeatureReference[]> {
  const refDir = join(THEME_ROOT, ".claude/features", featureId, "reference");
  let entries: string[];
  try {
    entries = await readdir(refDir);
  } catch {
    return [];
  }

  const refs: FeatureReference[] = [];
  for (const entry of entries) {
    const full = join(refDir, entry);
    try {
      const s = await stat(full);
      if (!s.isFile()) continue;
    } catch {
      continue;
    }
    refs.push({
      kind: detectKind(entry),
      path: join(".claude/features", featureId, "reference", entry),
      mime: detectMime(entry),
    });
  }
  return refs;
}

function detectKind(filename: string): FeatureReference["kind"] {
  const ext = extname(filename).toLowerCase();
  if ([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"].includes(ext)) {
    return "image";
  }
  if ([".html", ".htm"].includes(ext)) return "html";
  if ([".fig", ".sketch", ".xd"].includes(ext)) return "design";
  return "text";
}

function detectMime(filename: string): string | undefined {
  const ext = extname(filename).toLowerCase();
  const map: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".html": "text/html",
    ".htm": "text/html",
    ".md": "text/markdown",
    ".txt": "text/plain",
  };
  return map[ext];
}

/**
 * The model surfaces estimate factors as free-form strings in
 * `estimatedEffort.factors`. We parse a small vocabulary back into the
 * structured `EstimateFactors` shape consumed by `estimateTeamDays`.
 *
 * Recognized hints:
 *  - "variantCount=N"    → factors.variantCount = N
 *  - "copyDensity=high"  → factors.copyDensity = "high"
 *  - "novelComponent"    → factors.novelComponent = true
 *  - "responsive"        → factors.responsive = true
 */
function readFactorsFromModelHints(
  acc: EstimateFactors,
  hint: string,
): EstimateFactors {
  const lower = hint.toLowerCase();
  const variantMatch = lower.match(/variantcount\s*=\s*(\d+)/);
  if (variantMatch) acc.variantCount = parseInt(variantMatch[1], 10);
  if (/copydensity\s*=\s*high/.test(lower)) acc.copyDensity = "high";
  if (/copydensity\s*=\s*medium/.test(lower)) acc.copyDensity = "medium";
  if (/copydensity\s*=\s*low/.test(lower)) acc.copyDensity = "low";
  if (/novelcomponent/.test(lower)) acc.novelComponent = true;
  if (/\bresponsive\b/.test(lower)) acc.responsive = true;
  return acc;
}
