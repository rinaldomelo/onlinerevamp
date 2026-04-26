// Validation agent harness. Runs three tiers, aggregates, decides.
//
// Status (M9): scaffold. Toolkit + theme-check + Lighthouse calls are stubbed
// until the orchestrator goes live.

import { spawn } from "node:child_process";
import type { ValidationInput, ValidationOutput } from "./schema.js";
import { ValidationOutputSchema } from "./schema.js";

export async function runValidation(input: ValidationInput): Promise<ValidationOutput> {
  // ─── Tier 1 — Toolkit (stubbed) ──────────────────────────────────────────
  const toolkit = {
    ran: false,
    errors: [] as Array<{ file: string; message: string }>,
    warnings: [] as Array<{ file: string; message: string }>,
  };
  // TODO: const mcp = await createShopifyDevMcpClient();
  // TODO: const bundle = await mcp.validateThemeBundle({ files: input.filesTouched });
  // TODO: per-file validateLiquid for *.liquid touched files.

  // ─── Tier 2 — theme-check (real, but optional based on availability) ─────
  const themeCheck = await runThemeCheck();

  // ─── Tier 3 — Lighthouse (stubbed; no preview URL today) ─────────────────
  const lighthouse = input.previewUrl
    ? { ran: false, performance: 0, accessibility: 0, seo: 0 }
    : undefined;

  // ─── Decide ──────────────────────────────────────────────────────────────
  const reasons: string[] = [];
  if (!toolkit.ran) reasons.push("Toolkit unavailable — Pattern A not installed or MCP unreachable.");
  if (!themeCheck.ran) reasons.push("theme-check binary not on PATH or returned non-JSON.");

  let decision: ValidationOutput["decision"] = "pass";
  if (reasons.length) decision = "human_review";
  else if (toolkit.errors.length || themeCheck.errors > 0) decision = "needs_fixes";

  return ValidationOutputSchema.parse({
    decision,
    tiers: { toolkit, themeCheck, lighthouse },
    routing: [],
    humanReviewReasons: reasons.length ? reasons : undefined,
  });
}

async function runThemeCheck(): Promise<{
  ran: boolean;
  errors: number;
  suggestions: number;
  findings: Array<{ file: string; line?: number; message: string }>;
}> {
  return new Promise((resolve) => {
    const proc = spawn(
      "shopify",
      ["theme", "check", "--config", ".theme-check.yml", "--output", "json"],
      { cwd: process.env.THEME_ROOT ?? ".." },
    );
    let stdout = "";
    proc.stdout.on("data", (d) => (stdout += d.toString()));
    proc.on("error", () =>
      resolve({ ran: false, errors: 0, suggestions: 0, findings: [] }),
    );
    proc.on("close", () => {
      try {
        const parsed = JSON.parse(stdout) as Array<{
          path: string;
          offenses: Array<{ check: string; severity: string; message: string; start_row?: number }>;
        }>;
        const findings: Array<{ file: string; line?: number; message: string }> = [];
        let errors = 0;
        let suggestions = 0;
        for (const file of parsed) {
          for (const offense of file.offenses ?? []) {
            findings.push({ file: file.path, line: offense.start_row, message: offense.message });
            if (offense.severity === "error") errors++;
            else suggestions++;
          }
        }
        resolve({ ran: true, errors, suggestions, findings });
      } catch {
        resolve({ ran: false, errors: 0, suggestions: 0, findings: [] });
      }
    });
  });
}
