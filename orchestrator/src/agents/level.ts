// Single source of truth for the L1–L6 feature-level → write-glob mapping
// (ADR-010, M13). Both the planner (level classification) and the architect
// (level-signature enforcement) read from this module so prompts can't drift.
//
// Edit-vs-create disambiguation (e.g. L2 forbids new files at paths L3
// allows) is a runtime concern enforced by the agent prompt, not by these
// globs — the globs are a necessary upper bound, not a sufficient one.
// Promoting that to policy.ts is tracked as M13.1.

import { minimatch } from "minimatch";
import type { FeatureLevel } from "../types.js";

const LEVELS: readonly FeatureLevel[] = ["L1", "L2", "L3", "L4", "L5", "L6"] as const;

/**
 * Per-level write-glob ADDITIONS. Each level adds to the previous one.
 * Use composeGlobs(level) to get the full cumulative list.
 */
export const LEVEL_WRITE_GLOBS: Record<FeatureLevel, readonly string[]> = {
  L1: [
    "templates/*.json",
    "config/settings_data.json",
    "config/settings_schema.json",
    "locales/*.json",
  ],
  L2: [
    "sections/*.liquid",
    "snippets/*.liquid",
  ],
  L3: [
    "sections/section-*.liquid",
    "assets/section-*.css",
    "assets/section-*.js",
  ],
  L4: [
    "assets/global.*",
    "assets/base.*",
    "assets/*.css",
    "assets/*.js",
  ],
  L5: [
    "templates/*.liquid",
    "templates/customers/*",
    "layout/*.liquid",
  ],
  L6: [],
};

/**
 * One-line description per level — used by both prompts via {{LEVEL_TABLE}}
 * substitution at load time.
 */
export const LEVEL_NAMES: Record<FeatureLevel, string> = {
  L1: "Customizer-only (JSON / locales)",
  L2: "Liquid edit (no new files)",
  L3: "New section (scoped, section-* prefix)",
  L4: "New section + base CSS/JS additions",
  L5: "New page/template + base impact",
  L6: "Out of scope — held",
};

/**
 * Baseline team-day estimates per level. Multipliers apply on top
 * (see planner/estimate.ts).
 */
export const LEVEL_BASELINE_DAYS: Record<FeatureLevel, number> = {
  L1: 0.25,
  L2: 0.5,
  L3: 1.5,
  L4: 3,
  L5: 5,
  L6: 0,
};

/**
 * Cumulative write-glob list from L1 up to and including `level`.
 * L6 returns `[]` because L6 = held, no writes allowed.
 */
export function composeGlobs(level: FeatureLevel): readonly string[] {
  if (level === "L6") return [];
  const idx = LEVELS.indexOf(level);
  const acc: string[] = [];
  for (let i = 0; i <= idx; i++) {
    acc.push(...LEVEL_WRITE_GLOBS[LEVELS[i]]);
  }
  return acc;
}

/**
 * Returns true iff the given write path is within the level's cumulative
 * glob set. False if the path matches no glob at this level (i.e. the level
 * would be exceeded).
 */
export function pathFitsLevel(level: FeatureLevel, writePath: string): boolean {
  if (level === "L6") return false;
  return composeGlobs(level).some((g) =>
    minimatch(writePath, g, { dot: false, matchBase: false }),
  );
}

/**
 * Markdown table renderer for prompt-template substitution. The harness
 * reads prompt.md, replaces `{{LEVEL_TABLE}}` with this output, and passes
 * the substituted prompt to the model.
 */
export function renderLevelTableMarkdown(): string {
  const rows = LEVELS.map((level) => {
    const adds = LEVEL_WRITE_GLOBS[level].length
      ? LEVEL_WRITE_GLOBS[level].map((g) => `\`${g}\``).join(", ")
      : "_(none — held)_";
    return `| **${level}** | ${LEVEL_NAMES[level]} | ${adds} | ${LEVEL_BASELINE_DAYS[level]} |`;
  });
  return [
    "| Level | Name | Adds these write paths | Baseline (teamDays) |",
    "|---|---|---|---|",
    ...rows,
  ].join("\n");
}
