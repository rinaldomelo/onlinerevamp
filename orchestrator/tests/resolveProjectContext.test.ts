// Resolver smoke tests (M14).
//
// Verifies the spec resolver maps a FeatureRequest to the right `.claude/specs/`
// files. Runs against the live theme repo (`THEME_ROOT`), so the tests
// implicitly cover the deployed spec hierarchy — if a spec file gets renamed,
// these tests fail with a clear pointer.

import { describe, expect, it } from "vitest";
import { resolve } from "node:path";
import {
  flattenContextPaths,
  parseSectionsFromFrontmatter,
  resolveProjectContext,
} from "../src/agents/shared/resolveProjectContext.js";
import type { FeatureRequest } from "../src/types.js";

const THEME_ROOT = resolve(process.env.THEME_ROOT ?? "..");

function makeRequest(partial: Partial<FeatureRequest>): FeatureRequest {
  return {
    id: "feature-test",
    title: "Test",
    description: "Lorem ipsum",
    source: "user",
    priority: "medium",
    ...partial,
  };
}

describe("resolveProjectContext", () => {
  it("always surfaces project + theme + theme-analysis when they exist", () => {
    const ctx = resolveProjectContext(makeRequest({}), THEME_ROOT);
    expect(ctx.projectSpec).toBe(".claude/specs/project.md");
    expect(ctx.themeSpec).toBe(".claude/specs/theme.md");
    expect(ctx.themeAnalysis).toBe(
      ".claude/context/OUTPUT-initial-theme-analysis.md",
    );
  });

  it("matches the slideshow section spec when title contains 'hero'", () => {
    const ctx = resolveProjectContext(
      makeRequest({ title: "Tweak the hero — pause on hover" }),
      THEME_ROOT,
    );
    expect(ctx.sectionSpecs).toContain(".claude/specs/sections/slideshow.md");
  });

  it("expands page targetPages into matching section specs from the page's frontmatter", () => {
    const ctx = resolveProjectContext(
      makeRequest({
        title: "Refresh home stack",
        context: { targetPages: ["index"] },
      }),
      THEME_ROOT,
    );
    expect(ctx.pageSpecs).toContain(".claude/specs/pages/index.md");
    // pages/index.md frontmatter lists slideshow as the first section
    expect(ctx.sectionSpecs).toContain(".claude/specs/sections/slideshow.md");
    // ... and product-tabs is in there too
    expect(ctx.sectionSpecs).toContain(".claude/specs/sections/product-tabs.md");
  });

  it("caps section matches at 5 to avoid prompt bloat", () => {
    const ctx = resolveProjectContext(
      makeRequest({
        title: "everything everywhere all at once slideshow product-tabs collection-list multicolumn",
        context: { targetPages: ["index"] },
      }),
      THEME_ROOT,
    );
    expect(ctx.sectionSpecs.length).toBeLessThanOrEqual(5);
  });

  it("falls back gracefully when no specs match", () => {
    const ctx = resolveProjectContext(
      makeRequest({ title: "nonexistent-thing-xyz" }),
      THEME_ROOT,
    );
    // Top-level singletons still surface (they're project-wide).
    expect(ctx.projectSpec).not.toBeNull();
    // No page or section matches.
    expect(ctx.pageSpecs).toEqual([]);
  });
});

describe("flattenContextPaths", () => {
  it("orders paths project → theme → analyses → pages → sections", () => {
    const ordered = flattenContextPaths({
      projectSpec: ".claude/specs/project.md",
      themeSpec: ".claude/specs/theme.md",
      themeAnalysis: ".claude/context/OUTPUT-initial-theme-analysis.md",
      figmaAnalysis: ".claude/context/OUTPUT-initial-figma-analysis.md",
      pageSpecs: [".claude/specs/pages/index.md"],
      sectionSpecs: [".claude/specs/sections/slideshow.md"],
    });
    expect(ordered).toEqual([
      ".claude/specs/project.md",
      ".claude/specs/theme.md",
      ".claude/context/OUTPUT-initial-theme-analysis.md",
      ".claude/context/OUTPUT-initial-figma-analysis.md",
      ".claude/specs/pages/index.md",
      ".claude/specs/sections/slideshow.md",
    ]);
  });

  it("drops null singletons", () => {
    const ordered = flattenContextPaths({
      projectSpec: null,
      themeSpec: ".claude/specs/theme.md",
      themeAnalysis: null,
      figmaAnalysis: null,
      pageSpecs: [],
      sectionSpecs: [],
    });
    expect(ordered).toEqual([".claude/specs/theme.md"]);
  });
});

describe("parseSectionsFromFrontmatter", () => {
  it("parses the multi-line block-list shape (matches pages/index.md)", () => {
    const md = [
      "---",
      "kind: page",
      "sections:",
      "  - slideshow",
      "  - product-tabs",
      "  - multicolumn",
      "last_curated: 2026-04-28",
      "---",
      "",
      "# Body",
    ].join("\n");
    expect(parseSectionsFromFrontmatter(md)).toEqual([
      "slideshow",
      "product-tabs",
      "multicolumn",
    ]);
  });

  it("parses the inline-array shape", () => {
    const md = [
      "---",
      "sections: [slideshow, product-tabs, multicolumn]",
      "---",
      "",
    ].join("\n");
    expect(parseSectionsFromFrontmatter(md)).toEqual([
      "slideshow",
      "product-tabs",
      "multicolumn",
    ]);
  });

  it("returns [] when there's no frontmatter", () => {
    expect(parseSectionsFromFrontmatter("# Just a heading")).toEqual([]);
  });

  it("returns [] when sections key is absent", () => {
    const md = ["---", "kind: section", "slug: slideshow", "---"].join("\n");
    expect(parseSectionsFromFrontmatter(md)).toEqual([]);
  });
});
