import { describe, expect, it } from "vitest";

// Note: full integration tests need a working policy.yml fixture and
// process.env.THEME_ROOT pointed at it. M11 ships the unit-level smoke;
// integration coverage layers on once minimatch + js-yaml deps are pinned.

describe("policy module shape", () => {
  it("exports ensureCanWrite and PolicyViolationError", async () => {
    const mod = await import("../src/orchestrator/policy.js");
    expect(typeof mod.ensureCanWrite).toBe("function");
    expect(mod.PolicyViolationError).toBeDefined();
    expect(mod.PolicyViolationError.name).toBe("PolicyViolationError");
  });
});

describe("logger module shape", () => {
  it("exports logRecord", async () => {
    const mod = await import("../src/orchestrator/logger.js");
    expect(typeof mod.logRecord).toBe("function");
  });
});
