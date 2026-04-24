export type StepStatus = "success" | "error" | "pending";

export type DrawerTabId = "server" | "action" | "prompt" | "config";

export interface Step {
  id: number;
  label: string;
  status: StepStatus;
  action: string;
  observation: string;
  reasoning: string;
  summary: string;
  actionJson: Record<string, unknown> | null;
  time: string;
  tokensIn: string;
  tokensOut: string;
  cost: string;
}

export interface AssistantMessage {
  role: "user" | "assistant";
  text: string;
}
