// Spec-hierarchy resolver (M14).
//
// Maps a FeatureRequest to the set of `.claude/specs/*.md` files the planner
// and architect should consult as input context. By-reference: returns
// repo-relative paths only; the agent reads them via the `read_spec` tool.
// Pure function with deterministic output — no model calls, no network I/O.
//
// Heuristic:
//   - project.md, theme.md, OUTPUT-initial-theme-analysis.md always included
//     (when present on disk).
//   - OUTPUT-initial-figma-analysis.md included when present.
//   - Page specs match by request.context.targetPages (exact slug), then by
//     title-substring fallback against page slugs.
//   - Section specs from each matched page's frontmatter `sections[]`, plus
//     a small alias map (e.g. "hero" → slideshow), plus word-boundary
//     substring against the title. Capped at MAX_SECTION_MATCHES.
//
// All matches deduplicated; returns repo-relative paths so they can be
// printed verbatim into the agent's user message.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { FeatureRequest } from "../../types.js";

export interface ProjectContext {
  /** ".claude/specs/project.md" if present, else null. */
  projectSpec: string | null;
  /** ".claude/specs/theme.md" if present, else null. */
  themeSpec: string | null;
  /** ".claude/context/OUTPUT-initial-theme-analysis.md" if present, else null. */
  themeAnalysis: string | null;
  /** ".claude/context/OUTPUT-initial-figma-analysis.md" if present, else null. */
  figmaAnalysis: string | null;
  /** Repo-relative paths to matched page specs. */
  pageSpecs: string[];
  /** Repo-relative paths to matched section specs (capped). */
  sectionSpecs: string[];
}

/**
 * Title keywords that map to a canonical section slug. Keep small and
 * intentional — broader inference belongs to the planner, not this resolver.
 */
const TITLE_ALIASES: Record<string, string> = {
  hero: "slideshow",
  carousel: "slideshow",
  banner: "slideshow",
};

/** Hard cap on section spec matches. Prevents prompt bloat from a sweeping title. */
const MAX_SECTION_MATCHES = 5;

export function resolveProjectContext(
  request: FeatureRequest,
  themeRoot: string,
): ProjectContext {
  const root = resolve(themeRoot);
  const specRoot = join(root, ".claude", "specs");
  const ctxRoot = join(root, ".claude", "context");

  const projectSpec = relIfExists(root, specRoot, "project.md");
  const themeSpec = relIfExists(root, specRoot, "theme.md");
  const themeAnalysis = relIfExists(root, ctxRoot, "OUTPUT-initial-theme-analysis.md");
  const figmaAnalysis = relIfExists(root, ctxRoot, "OUTPUT-initial-figma-analysis.md");

  const titleLower = (request.title ?? "").toLowerCase();
  const targetPages = request.context?.targetPages ?? [];

  const pagesDir = join(specRoot, "pages");
  const sectionsDir = join(specRoot, "sections");
  const pageFiles = listMdFiles(pagesDir);
  const sectionFiles = listMdFiles(sectionsDir);

  const matchedPagePaths = new Set<string>();

  // Pass 1 — exact targetPages
  for (const slug of targetPages) {
    if (pageFiles.includes(`${slug}.md`)) {
      matchedPagePaths.add(`.claude/specs/pages/${slug}.md`);
    }
  }

  // Pass 2 — title substring fallback
  for (const file of pageFiles) {
    const slug = file.replace(/\.md$/, "");
    if (titleLower.includes(slug)) {
      matchedPagePaths.add(`.claude/specs/pages/${file}`);
    }
  }

  const matchedSectionPaths = new Set<string>();

  // Pass A — pull sections from each matched page's frontmatter
  for (const rel of matchedPagePaths) {
    const abs = join(root, rel);
    let body: string;
    try {
      body = readFileSync(abs, "utf8");
    } catch {
      continue;
    }
    for (const slug of parseSectionsFromFrontmatter(body)) {
      if (sectionFiles.includes(`${slug}.md`)) {
        matchedSectionPaths.add(`.claude/specs/sections/${slug}.md`);
      }
    }
  }

  // Pass B — title alias map
  for (const [alias, canonical] of Object.entries(TITLE_ALIASES)) {
    if (titleLower.includes(alias) && sectionFiles.includes(`${canonical}.md`)) {
      matchedSectionPaths.add(`.claude/specs/sections/${canonical}.md`);
    }
  }

  // Pass C — word-boundary substring on the title
  const titleWords = new Set(titleLower.split(/\W+/).filter(Boolean));
  for (const file of sectionFiles) {
    const slug = file.replace(/\.md$/, "");
    if (titleWords.has(slug)) {
      matchedSectionPaths.add(`.claude/specs/sections/${file}`);
    }
  }

  return {
    projectSpec,
    themeSpec,
    themeAnalysis,
    figmaAnalysis,
    pageSpecs: [...matchedPagePaths],
    sectionSpecs: [...matchedSectionPaths].slice(0, MAX_SECTION_MATCHES),
  };
}

/**
 * Flatten a ProjectContext into the ordered list of repo-relative paths the
 * agent should be told about. Stable ordering: project → theme → analyses →
 * pages → sections. Empty entries dropped.
 */
export function flattenContextPaths(ctx: ProjectContext): string[] {
  const out: string[] = [];
  if (ctx.projectSpec) out.push(ctx.projectSpec);
  if (ctx.themeSpec) out.push(ctx.themeSpec);
  if (ctx.themeAnalysis) out.push(ctx.themeAnalysis);
  if (ctx.figmaAnalysis) out.push(ctx.figmaAnalysis);
  out.push(...ctx.pageSpecs);
  out.push(...ctx.sectionSpecs);
  return out;
}

function relIfExists(root: string, dir: string, file: string): string | null {
  const abs = join(dir, file);
  if (!existsSync(abs)) return null;
  return abs.startsWith(root + "/") ? abs.slice(root.length + 1) : abs;
}

function listMdFiles(dir: string): string[] {
  try {
    return readdirSync(dir).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }
}

/**
 * Extract a `sections:` array from a YAML frontmatter block. Supports both
 * inline (`sections: [a, b]`) and multi-line block-list (`sections:\n  - a`)
 * forms — the only two shapes the spec-* skills emit. Returns [] when the
 * frontmatter or the `sections:` key is absent.
 *
 * Hand-parsed because adding a YAML dep just for this would violate the
 * "Never Add dependencies without approval" rule in CLAUDE.md.
 */
export function parseSectionsFromFrontmatter(md: string): string[] {
  const fm = md.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!fm) return [];
  const body = fm[1];

  const inline = body.match(/^sections:\s*\[([^\]]*)\]/m);
  if (inline) {
    return inline[1]
      .split(",")
      .map((s) => s.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }

  const blockMatch = body.match(/^sections:\s*\n((?:[ \t]+-[^\n]*\n?)+)/m);
  if (blockMatch) {
    return blockMatch[1]
      .split("\n")
      .map((l) => l.replace(/^[ \t]+-\s*/, "").trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }

  return [];
}
