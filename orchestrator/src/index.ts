// CLI entry for the orchestrator.
//
// Usage:
//   pnpm dev                                  — print help
//   pnpm run-feature <feature-id>             — run planner → architect on a feature
//
// Status (M13): scaffold. Surfaces held vs complete outcomes from the
// two-stage workflow runner. Specialist dispatch / validation / deployment
// runtime wiring arrives in M14+.

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { runFeature } from "./orchestrator/workflow-runner.js";
import { FeatureRequestSchema } from "./types.js";

const THEME_ROOT = resolve(process.env.THEME_ROOT ?? "..");

async function main(argv: string[]): Promise<void> {
  const [, , cmd, ...args] = argv;

  if (cmd === "run" || cmd === "run-feature") {
    const featureFlag = args.indexOf("--feature");
    const featureId = featureFlag >= 0 ? args[featureFlag + 1] : args[0];
    if (!featureId) {
      console.error("Usage: pnpm run-feature <feature-id>");
      process.exit(1);
    }
    await runFeatureCli(featureId);
    return;
  }

  printHelp();
  process.exit(0);
}

async function runFeatureCli(featureId: string): Promise<void> {
  const featurePath = resolve(THEME_ROOT, ".claude/features", featureId, "feature.md");
  const featureMd = await readFile(featurePath, "utf8");

  const featureRequest = FeatureRequestSchema.parse({
    id: featureId,
    title: extractTitle(featureMd) ?? featureId,
    description: featureMd.slice(0, 500),
    source: "user",
    priority: "medium",
  });

  const result = await runFeature(featureRequest);

  if (result.status === "held") {
    console.log("\n=== HELD ===");
    console.log(`Reason: ${result.reason}`);
    if (result.missingInputs.length > 0) {
      console.log("\nMissing inputs:");
      for (const m of result.missingInputs) console.log(`  - ${m}`);
    }
    console.log("\n=== Observations ===\n", result.observations);
    process.exit(2);
  }

  console.log("\n=== Triage ===");
  console.log(`Level: ${result.level}`);
  console.log(
    `Estimate: ${result.estimatedEffort.teamDays}d (${result.estimatedEffort.confidence})`,
  );
  console.log(`Factors: ${result.estimatedEffort.factors.join(", ")}`);
  console.log("\n=== Plan ===\n", JSON.stringify(result.plan, null, 2));
  console.log("\n=== Design ===\n", JSON.stringify(result.design, null, 2));
  console.log("\n=== Observations ===\n", result.observations);
}

function extractTitle(md: string): string | null {
  const match = md.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function printHelp(): void {
  console.log(`
Online Revamp Orchestrator (M13 scaffold — Phase-2 split)

Commands:
  run-feature <feature-id>   Run planner → architect on a feature folder
  help                       This message

Environment:
  THEME_ROOT                 Path to the theme repo root (default: ../)
  ANTHROPIC_API_KEY          Required when the agent SDK is wired (M14)
  GITHUB_TOKEN               Required for M10 PR creation

Exit codes:
  0   Complete  (level + estimate + plan + design printed)
  1   Error     (CLI usage or runtime failure)
  2   Held      (planner held the request — see HELD section for missingInputs)
`.trim());
}

main(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
