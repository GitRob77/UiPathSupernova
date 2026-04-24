export type InstanceStatus = "running" | "completed" | "faulted" | "cancelled" | "paused";

export interface Instance {
  id: string;
  processId: string;
  status: InstanceStatus;
  version: string;
  startedAt: string;
  lastUpdate: string;
  duration: string;
  startedBy: string;
  limitedView?: boolean;
}
