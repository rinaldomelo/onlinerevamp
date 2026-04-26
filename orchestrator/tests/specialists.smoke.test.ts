// Specialist agent smoke tests. File-glob policy enforcement is the most
// critical contract; tests verify it via mocked PlanTasks.
//
// Status (M8): scaffold. Real I/O assertions added when M11 wires the
// permissions.yml policy loader.

import { describe, expect, it } from "vitest";
import { runLiquidTask } from "../src/agents/liquid/index.js";
import { runConfigTask } from "../src/agents/config/index.js";
import { runAssetsTask } from "../src/agents/assets/index.js";
import type { PlanTask } from "../src/types.js";

function makeTask(targetAgent: PlanTask["targetAgent"], filePath: string): PlanTask {
  return {
    id: "T1",
    kind: "liquid-change",
    targetAgent,
    payload: { filePath, description: "test", planId: "P1" },
  };
}

describe("liquid agent file-glob policy", () => {
  it("refuses to write outside sections/snippets/templates", async () => {
    const obs = await runLiquidTask(makeTask("liquid", "assets/foo.css"));
    expect(obs.success).toBe(false);
    expect(obs.notes).toContain("File-glob policy violation");
  });
});

describe("config agent file-glob policy", () => {
  it("refuses to write outside templates/config/locales", async () => {
    const obs = await runConfigTask(makeTask("config", "sections/x.liquid"));
    expect(obs.success).toBe(false);
    expect(obs.notes).toContain("File-glob policy violation");
  });
});

describe("assets agent file-glob policy", () => {
  it("refuses to write outside assets/", async () => {
    const obs = await runAssetsTask(makeTask("assets", "templates/index.json"));
    expect(obs.success).toBe(false);
    expect(obs.notes).toContain("File-glob policy violation");
  });
});
