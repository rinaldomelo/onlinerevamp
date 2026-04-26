// JSONL append-only audit logger.
//
// One file per plan: .claude/logs/runs/<plan-id>.jsonl
// One record per agent step: { ts, agent, taskId, planId, kind, payload, observation }.
//
// Status (M11): scaffold. Used by the workflow runner once wired.

import { mkdir, appendFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const LOGS_ROOT = resolve(
  process.env.THEME_ROOT ?? "..",
  ".claude/logs/runs",
);

export interface LogRecord {
  ts: string; // ISO 8601
  planId: string;
  agent: string;
  taskId?: string;
  kind: "agent_call" | "agent_observation" | "policy_violation" | "decision" | "error";
  payload?: unknown;
  observation?: unknown;
  error?: string;
}

export async function logRecord(record: Omit<LogRecord, "ts">): Promise<void> {
  const full: LogRecord = { ts: new Date().toISOString(), ...record };
  const path = resolve(LOGS_ROOT, `${record.planId}.jsonl`);
  await mkdir(dirname(path), { recursive: true });
  await appendFile(path, JSON.stringify(full) + "\n", "utf8");
}
