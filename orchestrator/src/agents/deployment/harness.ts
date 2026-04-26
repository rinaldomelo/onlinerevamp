// Deployment agent harness. Encodes the 3-env git workflow.
//
// Status (M10): scaffold. The git + GitHub API calls are wired against
// the existing tool wrappers; the actual end-to-end run is gated by the
// rest of the orchestrator being live.

import type { DeploymentInput, DeploymentOutput } from "./schema.js";
import { DeploymentOutputSchema } from "./schema.js";
import { commit, currentBranch, isClean, push } from "../../tools/git.js";
import { openPullRequest } from "../../tools/github-api.js";

export async function runDeployment(input: DeploymentInput): Promise<DeploymentOutput> {
  // ─── Refuse on bad validation ────────────────────────────────────────────
  if (input.validationStatus === "needs_fixes") {
    return DeploymentOutputSchema.parse({
      action: "refused",
      notes: "Validation returned needs_fixes; loop back to specialist agents.",
      pairReviewRequired: false,
    });
  }

  // ─── Pre-flight git checks ───────────────────────────────────────────────
  const branch = await currentBranch();
  if (!branch || ["main", "staging", "development"].includes(branch)) {
    return DeploymentOutputSchema.parse({
      action: "refused",
      notes: `On ${branch || "(detached)"} — refusing to deploy from an env branch.`,
      pairReviewRequired: false,
    });
  }
  if (!(await isClean())) {
    // Caller should have committed already; this is defensive.
    await commit(input.commitMessage);
  }

  // ─── Push + PR ───────────────────────────────────────────────────────────
  await push(input.branchName);
  const prRef = await openPullRequest({
    branchName: input.branchName,
    title: input.prTitle,
    body: input.prBody,
    base: input.targetEnv,
  });

  // ─── Decide action based on env ──────────────────────────────────────────
  const pairReviewRequired = input.targetEnv === "staging" || input.targetEnv === "main";
  const action =
    input.validationStatus === "human_review" || pairReviewRequired
      ? "wait_for_human"
      : "open_pr";

  return DeploymentOutputSchema.parse({
    action,
    prRef,
    notes: pairReviewRequired
      ? `PR opened against ${input.targetEnv}; pair review required per .claude/rules/git-workflow.md.`
      : `PR opened against ${input.targetEnv}.`,
    pairReviewRequired,
  });
}
