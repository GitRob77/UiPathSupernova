import { ExecutionTrailStep, GlobalVariable } from "../types/debug";

export const executionTrailV2: ExecutionTrailStep = {
  id: "instance-root",
  name: "Instance: 57971111-a1b2-4c3d-9e8f-12345abcdef0",
  type: "instance",
  status: "cancelled",
  duration: "42 sec",
  endedAt: "2026-02-25 11:22:02",
  children: [
    {
      id: "start-event",
      name: "New iPhone Request (Start event)",
      type: "start-event",
      status: "completed",
      duration: "< 1 sec",
      endedAt: "2026-02-25 11:21:20",
    },
    {
      id: "manager-approval",
      name: "Manager Approval",
      type: "service-task",
      status: "completed",
      duration: "8 sec",
      endedAt: "2026-02-25 11:21:28",
      stepDetails: {
        input: [{ name: "requestId", value: "REQ-2026-0225" }],
        output: [{ name: "approved", value: "true" }],
        details: [
          { name: "Approver", value: "John.Manager@uipath.com" },
          { name: "Decision", value: "Approved" },
        ],
      },
    },
    {
      id: "gateway-resolution",
      name: "Is resolution required (Gateway)",
      type: "gateway",
      status: "completed",
      duration: "< 1 sec",
      endedAt: "2026-02-25 11:21:29",
    },
    {
      id: "agent-scout",
      name: "Agent Scout",
      type: "agent-run",
      status: "cancelled",
      duration: "30 sec",
      endedAt: "2026-02-25 11:21:59",
      stepDetails: {
        input: [{ name: "query", value: "Find cheapest Apple iPhone 16 with 256GB storage" }],
        output: [{ name: "result", value: "Cancelled" }],
        errors: [
          { name: "Code", value: "AGENT_RUNTIME.CANCELLED_BY_USER" },
          { name: "Message", value: "Process cancelled by user" },
          { name: "Detail", value: "The instance was manually cancelled while Agent Scout was running." },
        ],
      },
      children: [
        {
          id: "agent-run",
          name: "Agent run - Agent Scout",
          type: "agent-run",
          status: "cancelled",
          duration: "30 sec",
          endedAt: "2026-02-25 11:21:59",
          children: [
            {
              id: "llm-call",
              name: "LLM call",
              type: "llm-call",
              status: "completed",
              duration: "2 sec",
              endedAt: "2026-02-25 11:21:31",
              stepDetails: {
                rawJson: {
                  input: {
                    model: "gpt-4o",
                    temperature: 0.7,
                    system_prompt: "You are an agent that finds the cheapest phone...",
                    user_message: "Find the cheapest Apple iPhone 16 with at least 256 GB storage",
                  },
                  output: {
                    response: "I will search for the cheapest iPhone 16 with 256GB storage.",
                    tokens_used: 342,
                    finish_reason: "stop",
                  },
                },
              },
              children: [
                {
                  id: "model-run",
                  name: "Model run",
                  type: "model-run",
                  status: "completed",
                  duration: "2 sec",
                  endedAt: "2026-02-25 11:21:31",
                  stepDetails: {
                    rawJson: {
                      input: {
                        prompt_tokens: 156,
                        max_tokens: 1024,
                      },
                      output: {
                        completion_tokens: 186,
                        total_tokens: 342,
                      },
                    },
                  },
                },
              ],
            },
            {
              id: "tool-call-phone",
              name: "Tool call - Phone_Lowest_Price",
              type: "tool-call",
              status: "cancelled",
              duration: "37 sec",
              endedAt: "2026-02-25 11:21:59",
              stepDetails: {
                input: [{ name: "query", value: "cheapest Apple iPhone" }],
                output: [{ name: "output_UI", value: "Cancelled" }],
              },
              children: [
                {
                  id: "phone-lowest-price",
                  name: "Phone Lowest Price",
                  type: "tool-execution",
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
      name: "Internal notification",
      type: "service-task",
      status: "skipped",
      duration: "0 sec",
      endedAt: "2026-02-25 11:21:59",
    },
    {
      id: "end-event",
      name: "End event (End event)",
      type: "end-event",
      status: "skipped",
      duration: "0 sec",
      endedAt: "2026-02-25 11:22:02",
    },
  ],
};

export const instanceGlobalVars: GlobalVariable[] = [
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

/* ── Faulted instance trail (#5923781) ──────────────────────────── */

export const executionTrailV2_faulted: ExecutionTrailStep = {
  id: "instance-root",
  name: "Instance: c4e8a1f7-3d92-4b5e-b6c3-1a7f9e2d4b08",
  type: "instance",
  status: "faulted",
  duration: "1 min, 12 sec",
  endedAt: "2026-03-11 09:48:15",
  children: [
    {
      id: "start-event",
      name: "New iPhone Request (Start event)",
      type: "start-event",
      status: "completed",
      duration: "< 1 sec",
      endedAt: "2026-03-11 09:47:04",
    },
    {
      id: "manager-approval",
      name: "Manager Approval",
      type: "service-task",
      status: "completed",
      duration: "14 sec",
      endedAt: "2026-03-11 09:47:18",
    },
    {
      id: "gateway-resolution",
      name: "Is resolution required (Gateway)",
      type: "gateway",
      status: "completed",
      duration: "< 1 sec",
      endedAt: "2026-03-11 09:47:19",
    },
    {
      id: "agent-scout",
      name: "Agent Scout",
      type: "service-task",
      status: "faulted",
      duration: "56 sec",
      endedAt: "2026-03-11 09:48:15",
      children: [
        {
          id: "agent-run",
          name: "Agent run - Agent Scout",
          type: "agent-run",
          status: "faulted",
          duration: "56s",
          endedAt: "2026-03-11 09:48:15",
          children: [
            {
              id: "llm-call-1",
              name: "LLM call",
              type: "llm-call",
              status: "completed",
              duration: "2.1 sec",
              endedAt: "2026-03-11 09:47:21",
            },
            {
              id: "tool-call-phone",
              name: "Tool call - Phone_Lowest_Price",
              type: "tool-call",
              status: "faulted",
              duration: "54 sec",
              endedAt: "2026-03-11 09:48:15",
              stepDetails: {
                input: [
                  { name: "query", value: "cheapest Apple iPhone 16 256GB" },
                ],
                output: [],
                errors: [
                  { name: "errorCode", value: "408" },
                  { name: "errorMessage", value: "TimeoutException: Agent Scout exceeded maximum execution time (30s)" },
                  { name: "errorCategory", value: "Application" },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
};

export const instanceGlobalVars_faulted: GlobalVariable[] = [
  {
    name: "content",
    type: "string",
    source: "Agent Scout",
    value: null,
  },
  {
    name: "Error",
    type: "error",
    source: "Agent Scout",
    value: '{"code":"408","message":"TimeoutException: Agent Scout exceeded maximum execution time (30s)","category":"Application"}',
  },
];
