// Policy loader + enforcer. Reads `.claude/architecture/permissions.yml` and
// gates every agent write against its declared globs.
//
// Status (M11): scaffold. YAML parsing happens at first call. The actual
// "guard every write" wiring lands when each specialist's harness gets
// its real model call (M8 close-out).

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { minimatch } from "minimatch";

const POLICY_PATH = resolve(
  process.env.THEME_ROOT ?? "..",
  ".claude/architecture/permissions.yml",
);

export class PolicyViolationError extends Error {
  readonly agent: string;
  readonly path: string;
  constructor(agent: string, path: string, reason: string) {
    super(`Policy violation [${agent}] writing ${path}: ${reason}`);
    this.name = "PolicyViolationError";
    this.agent = agent;
    this.path = path;
  }
}

interface AgentPolicy {
  write_globs: string[];
  read_globs?: string[];
  forbidden?: string[];
}

interface PolicyDoc {
  agents: Record<string, AgentPolicy>;
  global_forbidden: string[];
}

let _policyCache: PolicyDoc | null = null;

async function loadPolicy(): Promise<PolicyDoc> {
  if (_policyCache) return _policyCache;
  const raw = await readFile(POLICY_PATH, "utf8");
  // Minimal YAML parse — for production, swap to `js-yaml`. Kept inline to
  // avoid adding a dep before the orchestrator boots end-to-end.
  _policyCache = parseSimpleYaml(raw) as PolicyDoc;
  return _policyCache;
}

export async function ensureCanWrite(agent: string, path: string): Promise<void> {
  const policy = await loadPolicy();

  // Global forbidden trumps everything.
  for (const pat of policy.global_forbidden ?? []) {
    if (minimatch(path, pat, { dot: true })) {
      throw new PolicyViolationError(agent, path, `globally forbidden by ${pat}`);
    }
  }

  const agentPolicy = policy.agents[agent];
  if (!agentPolicy) {
    throw new PolicyViolationError(agent, path, `unknown agent — no policy entry`);
  }

  // Agent-specific forbidden trumps write_globs.
  for (const pat of agentPolicy.forbidden ?? []) {
    if (minimatch(path, pat, { dot: true })) {
      throw new PolicyViolationError(agent, path, `forbidden for ${agent} by ${pat}`);
    }
  }

  if (!agentPolicy.write_globs.length) {
    throw new PolicyViolationError(agent, path, `${agent} has no write permissions`);
  }

  const allowed = agentPolicy.write_globs.some((pat) =>
    minimatch(path, pat, { dot: true }),
  );
  if (!allowed) {
    throw new PolicyViolationError(
      agent,
      path,
      `not in ${agent}'s write_globs (${agentPolicy.write_globs.join(", ")})`,
    );
  }
}

// ─── Tiny YAML parser (subset; replace with js-yaml when convenient) ──────────
//
// Supports the shape used by permissions.yml:
//   agents:
//     <name>:
//       write_globs: [...] OR list-of-strings on subsequent lines
//       forbidden: [...] OR list-of-strings
//   global_forbidden: [...] OR list-of-strings
//
// Status (M11): functional for the file we actually have. Replace before
// supporting nested or quoted edge cases.

function parseSimpleYaml(input: string): PolicyDoc {
  const doc: PolicyDoc = { agents: {}, global_forbidden: [] };
  const lines = input.split("\n").map((l) => l.replace(/#.*$/, "").trimEnd());

  let currentTopLevel: "agents" | "global_forbidden" | null = null;
  let currentAgent: string | null = null;
  let currentList: "write_globs" | "read_globs" | "forbidden" | "global_forbidden" | null = null;

  for (const line of lines) {
    if (!line.trim()) continue;

    // Top-level: "agents:" or "global_forbidden:"
    if (/^agents:\s*$/.test(line)) {
      currentTopLevel = "agents";
      currentAgent = null;
      currentList = null;
      continue;
    }
    if (/^global_forbidden:\s*$/.test(line)) {
      currentTopLevel = "global_forbidden";
      currentAgent = null;
      currentList = "global_forbidden";
      continue;
    }

    // Indented — agent name (2 spaces) under agents:
    const agentMatch = /^ {2}([a-z0-9-]+):\s*$/.exec(line);
    if (currentTopLevel === "agents" && agentMatch) {
      currentAgent = agentMatch[1];
      doc.agents[currentAgent] = { write_globs: [], read_globs: [], forbidden: [] };
      currentList = null;
      continue;
    }

    // 4-space-indented — field key under an agent
    const fieldMatch = /^ {4}(write_globs|read_globs|forbidden):\s*(\[\])?\s*$/.exec(line);
    if (currentTopLevel === "agents" && currentAgent && fieldMatch) {
      currentList = fieldMatch[1] as typeof currentList;
      if (fieldMatch[2] === "[]") currentList = null; // empty inline array.
      continue;
    }

    // List item — `- 'glob'` (6-space-indented under agent field, or 2-space under global)
    const itemMatch = /^\s+-\s+['"]?([^'"]+)['"]?\s*$/.exec(line);
    if (itemMatch) {
      const value = itemMatch[1];
      if (currentList === "global_forbidden") {
        doc.global_forbidden.push(value);
      } else if (currentAgent && currentList) {
        const list = doc.agents[currentAgent][currentList] as string[] | undefined;
        if (list) list.push(value);
      }
    }
  }

  return doc;
}
