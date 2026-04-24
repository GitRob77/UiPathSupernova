/* ------------------------------------------------------------------ */
/* Mock data for instance #5797111 (cancelled)                         */
/* ------------------------------------------------------------------ */

export interface ExecutionTrailNode {
  id: string;
  label: string;
  status: "completed" | "cancelled" | "skipped" | "running" | "faulted";
  duration: string;
  endedAt: string;
  children?: ExecutionTrailNode[];
  errorCode?: string;
  errorMessage?: string;
  errorDetail?: string;
  errorCategory?: string;
  errorStatus?: number;
  input?: Record<string, string>;
  output?: Record<string, string>;
}

export const executionTrail: ExecutionTrailNode = {
  id: "instance-root",
  label: "Instance: 57971111-a1b2-4c3d-9e8f-12345abcdef0",
  status: "cancelled",
  duration: "42 sec",
  endedAt: "2026-02-25 11:22:02",
  children: [
    {
      id: "start-event",
      label: "New iPhone Request (Start event)",
      status: "completed",
      duration: "< 1 sec",
      endedAt: "2026-02-25 11:21:20",
    },
    {
      id: "manager-approval",
      label: "Manager Approval",
      status: "completed",
      duration: "8 sec",
      endedAt: "2026-02-25 11:21:28",
    },
    {
      id: "gateway-resolution",
      label: "Is resolution required (Gateway)",
      status: "completed",
      duration: "< 1 sec",
      endedAt: "2026-02-25 11:21:29",
    },
    {
      id: "agent-scout",
      label: "Agent Scout",
      status: "cancelled",
      duration: "30 sec",
      endedAt: "2026-02-25 11:21:59",
      errorCode: "AGENT_RUNTIME.CANCELLED_BY_USER",
      errorMessage: "Process cancelled by user",
      errorDetail:
        "The instance was manually cancelled while Agent Scout was running. The agent execution was terminated before completion.",
      errorCategory: "User",
      errorStatus: 499,
      children: [
        {
          id: "agent-run",
          label: "Agent run - Agent Scout",
          status: "cancelled",
          duration: "30 sec",
          endedAt: "2026-02-25 11:21:59",
          children: [
            {
              id: "llm-call",
              label: "LLM call",
              status: "completed",
              duration: "2 sec",
              endedAt: "2026-02-25 11:21:31",
              children: [
                {
                  id: "model-run",
                  label: "Model run",
                  status: "completed",
                  duration: "2 sec",
                  endedAt: "2026-02-25 11:21:31",
                },
              ],
            },
            {
              id: "tool-call-phone",
              label: "Tool call - Phone_Lowest_Price",
              status: "cancelled",
              duration: "37 sec",
              endedAt: "2026-02-25 11:21:59",
              input: { query: "cheapest Apple iPhone" },
              output: { output_UI: "Cancelled" },
              children: [
                {
                  id: "phone-lowest-price",
                  label: "Phone Lowest Price",
                  status: "cancelled",
                  duration: "37 sec",
                  endedAt: "2026-02-25 11:21:59",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "notification",
      label: "Internal notification",
      status: "skipped",
      duration: "0 sec",
      endedAt: "2026-02-25 11:21:59",
    },
    {
      id: "end-event",
      label: "End event (End event)",
      status: "skipped",
      duration: "0 sec",
      endedAt: "2026-02-25 11:22:02",
    },
  ],
};

export interface GlobalVariable {
  name: string;
  type: string;
  source: string;
  value: string | null;
}

export const globalVariables: GlobalVariable[] = [
  {
    name: "content",
    type: "string",
    source: "Agent Scout",
    value: null,
  },
  {
    name: "Error",
    type: "object",
    source: "Agent Scout",
    value: '{"code":"408","message":"TimeoutException: Agent Scout exceeded maximum execution time (30s)"}',
  },
  {
    name: "Error",
    type: "string",
    source: "Internal notification",
    value: null,
  },
];

/* ------------------------------------------------------------------ */
/* Agent Scout step drill-down: canvas nodes                           */
/* ------------------------------------------------------------------ */

export interface AgentCanvasNode {
  id: string;
  label: string;
  status: "completed" | "cancelled" | "faulted" | "running";
  x: number;
  y: number;
  /** Category for the edge label: "escalations" | "context" | "tools" */
  category?: "escalations" | "context" | "tools";
  /** Icon type for the node */
  icon?: "user" | "document" | "workflow" | "email";
}

export const agentCanvasNodes: AgentCanvasNode[] = [
  { id: "approve-module", label: "Approve Module", status: "cancelled", x: 80, y: 60, category: "escalations", icon: "user" },
  { id: "acquisition-policy", label: "Acquisition policy item", status: "cancelled", x: 320, y: 60, category: "context", icon: "document" },
  { id: "cheapest-iphone", label: "Cheapest Apple iPhone", status: "cancelled", x: 80, y: 180, category: "tools", icon: "workflow" },
  { id: "send-email", label: "Send Email", status: "cancelled", x: 320, y: 180, category: "tools", icon: "email" },
];
