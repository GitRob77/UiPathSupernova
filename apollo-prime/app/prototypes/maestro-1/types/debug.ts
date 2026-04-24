export type StepStatus = "completed" | "faulted" | "running" | "skipped" | "paused" | "cancelled";

export type VariableType = "string" | "object" | "number" | "boolean" | "null" | "array";

export interface LocalVariable {
  name: string;
  type: VariableType;
  value: string | null;
  children?: LocalVariable[];
}

export interface DebugStep {
  id: string;
  name: string;
  status: StepStatus;
  duration: string;
  timestamp: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  locals?: LocalVariable[];
  details?: { label: string; value: string }[];
}

export interface DebugInstance {
  instanceId: string;
  steps: DebugStep[];
}

// Execution trail types for instance detail view
export type TrailStepType = "instance" | "start-event" | "end-event" | "service-task" | "agent-run" | "llm-call" | "model-run" | "tool-call" | "tool-execution" | "gateway" | "robot-job" | "assign" | "log-message" | "agent-output" | "loop";

export interface ExecutionTrailStep {
  id: string;
  name: string;
  type: TrailStepType;
  status: StepStatus;
  endedAt: string;
  duration: string;
  children?: ExecutionTrailStep[];
  stepDetails?: StepDetails;
  /** When present, the node is a loop and children represent one iteration template. iterations holds all iteration groups. */
  iterations?: ExecutionTrailStep[][];
}

export interface GlobalVariable {
  name: string;
  type: "string" | "object" | "number" | "boolean" | "null" | "array" | "error";
  source: string;
  value: string | null;
}

export interface StepDetailItem {
  name: string;
  value: string;
}

export interface StepDetails {
  input?: StepDetailItem[];
  output?: StepDetailItem[];
  variables?: StepDetailItem[];
  details?: StepDetailItem[];
  errors?: StepDetailItem[];
  rawJson?: Record<string, unknown>;
}
