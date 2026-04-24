export type LogLevel = "info" | "trace" | "success" | "error";

export interface LogEntry {
  id: string;
  time: string;
  message: string;
  level: LogLevel;
  duration?: string;
}

export interface RunStepItem {
  id: string;
  label: string;
  icon?: "tool" | "llm" | "sparkles" | "shield" | "send" | "output";
  badge?: string;
  duration?: string;
  status?: "success" | "in-progress" | "canceled";
  isCurrent?: boolean;
  children?: RunStepItem[];
}

export interface RunHistoryItem {
  id: string;
  label: string;
  timestamp: string;
  icon?: "play" | "mail" | "arrow" | "document";
  duration?: string;
  status?: "in-progress" | "success" | "canceled";
  steps?: RunStepItem[];
}

export interface Breakpoint {
  id: string;
  label: string;
}

export interface WatchItem {
  id: string;
  expression: string;
  value?: string;
  type?: "string" | "number" | "boolean" | "object" | "error";
  children?: { name: string; value: string; type: string }[];
}

export type LocalsVarType = "string" | "object" | "boolean" | "number" | "array";

export interface LocalsVariable {
  name: string;
  type: LocalsVarType;
  value?: string;
  children?: LocalsVariable[];
}

export interface LocalsSection {
  id: string;
  label: string;
  items: LocalsVariable[];
  defaultOpen?: boolean;
  direction?: "IN" | "OUT";
}
