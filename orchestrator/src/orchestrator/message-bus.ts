// Minimal in-process message bus. Agents publish observations + plan tasks;
// the workflow runner subscribes.
//
// Status (M7): scaffold. Not durable — single-process only. M11 may upgrade to
// JSONL-backed or persisted store if observability needs warrant.

import type { AgentObservation, PlanTask } from "../types.js";

type Listener<T> = (msg: T) => void | Promise<void>;

class TopicBus<T> {
  private listeners = new Set<Listener<T>>();

  subscribe(fn: Listener<T>): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  async publish(msg: T): Promise<void> {
    for (const fn of this.listeners) {
      await fn(msg);
    }
  }
}

export const planTaskBus = new TopicBus<PlanTask>();
export const observationBus = new TopicBus<AgentObservation>();

export async function publishPlanTasks(tasks: PlanTask[]): Promise<void> {
  for (const task of tasks) {
    await planTaskBus.publish(task);
  }
}
