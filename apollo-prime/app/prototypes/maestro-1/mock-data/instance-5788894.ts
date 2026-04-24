import { ExecutionTrailStep, GlobalVariable } from "../types/debug";
import type { ExecutionTrailNode, AgentCanvasNode } from "./instance-5797111";

/* ------------------------------------------------------------------ */
/* Mock data for instance #5788894 (completed)                         */
/* Instance UUID: 7a2f1e3d-9b84-4c6a-a1d7-8e5f3c2b9a04               */
/* Started: 2026-03-10 09:15:02 — Ended: 2026-03-10 09:32:06          */
/* ------------------------------------------------------------------ */

/* ── ExecutionTrailV2 (instance detail view) ────────────────────── */

export const executionTrailV2_5788894: ExecutionTrailStep = {
  id: "instance-root",
  name: "Instance: 7a2f1e3d-9b84-4c6a-a1d7-8e5f3c2b9a04",
  type: "instance",
  status: "completed",
  duration: "17 min, 4 sec",
  endedAt: "2026-03-10 09:32:06",
  children: [
    {
      id: "start-event",
      name: "New iPhone Request (Start event)",
      type: "start-event",
      status: "completed",
      duration: "< 1 sec",
      endedAt: "2026-03-10 09:15:02",
    },
    {
      id: "manager-approval",
      name: "Manager Approval",
      type: "service-task",
      status: "completed",
      duration: "12 sec",
      endedAt: "2026-03-10 09:15:14",
      stepDetails: {
        input: [{ name: "requestId", value: "REQ-2026-0310" }],
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
      endedAt: "2026-03-10 09:15:15",
    },
    {
      id: "agent-scout",
      name: "Agent Scout",
      type: "agent-run",
      status: "completed",
      duration: "14 min, 22 sec",
      endedAt: "2026-03-10 09:29:37",
      stepDetails: {
        input: [{ name: "query", value: "Find cheapest Apple iPhone 16 with 256GB storage" }],
        output: [
          { name: "result", value: "Success" },
          { name: "bestMatch", value: "Apple iPhone 16 — 256GB — Ultramarine — $829.00" },
        ],
        details: [
          { name: "Agent", value: "Price Scout Phone" },
          { name: "Model", value: "gpt-4o" },
          { name: "Total tokens", value: "4,218" },
        ],
      },
      children: [
        {
          id: "agent-run-scout",
          name: "Agent run - Agent Scout",
          type: "agent-run",
          status: "completed",
          duration: "5 min, 26 sec",
          endedAt: "2026-03-10 09:29:37",
          children: [
            {
              id: "llm-call-1",
              name: "LLM call",
              type: "llm-call",
              status: "completed",
              duration: "2.27 sec",
              endedAt: "2026-03-10 09:18:29",
              stepDetails: {
                rawJson: {
                  input: {
                    model: "gpt-4o",
                    temperature: 0.7,
                    system_prompt: "You are an agent that finds the cheapest phone and handles acquisition workflows...",
                    user_message: "Find the cheapest Apple iPhone 16 with at least 256 GB storage",
                  },
                  output: {
                    response: "I will search for the cheapest iPhone 16 with 256GB storage using the Phone Lowest Price tool.",
                    tokens_used: 387,
                    finish_reason: "tool_calls",
                    tool_calls: [{ name: "Phone_Lowest_Price", arguments: { query: "cheapest Apple iPhone 16 256GB" } }],
                  },
                },
              },
            },
            {
              id: "tool-call-phone",
              name: "Tool call - Phone_Lowest_Price",
              type: "tool-call",
              status: "completed",
              duration: "4 min, 32 sec",
              endedAt: "2026-03-10 09:22:58",
              stepDetails: {
                input: [{ name: "query", value: "cheapest Apple iPhone 16 256GB" }],
                output: [
                  { name: "output_UI", value: "Completed" },
                  { name: "bestPrice", value: "$829.00" },
                  { name: "retailer", value: "apple.com" },
                  { name: "model", value: "iPhone 16" },
                  { name: "color", value: "Ultramarine" },
                  { name: "storage", value: "256GB" },
                ],
              },
            },
            {
              id: "tool-call-acquisition",
              name: "Tool call - Acquisition_Policy_Item",
              type: "tool-call",
              status: "completed",
              duration: "3.98 sec",
              endedAt: "2026-03-10 09:22:62",
              stepDetails: {
                input: [
                  { name: "itemName", value: "Apple iPhone 16 256GB" },
                  { name: "price", value: "$829.00" },
                  { name: "vendor", value: "apple.com" },
                ],
                output: [
                  { name: "requiresApproval", value: "true" },
                  { name: "approvalLevel", value: "manager" },
                  { name: "policyRef", value: "ACQ-POLICY-2026-MOBILE-001" },
                  { name: "budgetCategory", value: "Employee Equipment" },
                ],
              },
            },
            {
              id: "llm-call-2",
              name: "LLM call",
              type: "llm-call",
              status: "completed",
              duration: "2.68 sec",
              endedAt: "2026-03-10 09:23:02",
              stepDetails: {
                rawJson: {
                  input: {
                    model: "gpt-4o",
                    temperature: 0.7,
                    context: "Phone found: iPhone 16 $829. Acquisition rules: requires manager approval under ACQ-POLICY-2026-MOBILE-001.",
                  },
                  output: {
                    response: "The phone costs $829 which requires manager approval per policy. I will escalate to the approve module.",
                    tokens_used: 512,
                    finish_reason: "tool_calls",
                    tool_calls: [{ name: "escalate_approve_module", arguments: { item: "Apple iPhone 16 256GB", amount: 829 } }],
                  },
                },
              },
            },
            {
              id: "tool-call-approve",
              name: "Tool call - escalate_approve_module",
              type: "tool-call",
              status: "completed",
              duration: "27 sec",
              endedAt: "2026-03-10 09:23:28",
              stepDetails: {
                input: [
                  { name: "item", value: "Apple iPhone 16 256GB Ultramarine" },
                  { name: "amount", value: "$829.00" },
                  { name: "policyRef", value: "ACQ-POLICY-2026-MOBILE-001" },
                  { name: "requestedBy", value: "Mihai.Bozgan@uipath.com" },
                ],
                output: [
                  { name: "approved", value: "true" },
                  { name: "approvedBy", value: "John.Manager@uipath.com" },
                  { name: "approvalId", value: "APR-2026-0310-7291" },
                ],
              },
            },
            {
              id: "llm-call-3",
              name: "LLM call",
              type: "llm-call",
              status: "completed",
              duration: "3.03 sec",
              endedAt: "2026-03-10 09:23:31",
              stepDetails: {
                rawJson: {
                  input: {
                    model: "gpt-4o",
                    temperature: 0.7,
                    context: "Approval granted by John.Manager. Sending confirmation email to requester.",
                  },
                  output: {
                    response: "The purchase has been approved. I will now send a confirmation email to the requester.",
                    tokens_used: 298,
                    finish_reason: "tool_calls",
                    tool_calls: [{ name: "Send_Email", arguments: { to: "Mihai.Bozgan@uipath.com", subject: "iPhone 16 Purchase Approved" } }],
                  },
                },
              },
            },
            {
              id: "tool-call-email",
              name: "Tool call - Send_Email",
              type: "tool-call",
              status: "completed",
              duration: "3.53 sec",
              endedAt: "2026-03-10 09:29:34",
              stepDetails: {
                input: [
                  { name: "to", value: "Mihai.Bozgan@uipath.com" },
                  { name: "subject", value: "iPhone 16 Purchase Approved" },
                  { name: "body", value: "Your request for Apple iPhone 16 256GB Ultramarine ($829.00) has been approved by John.Manager@uipath.com. Approval ID: APR-2026-0310-7291." },
                ],
                output: [{ name: "status", value: "sent" }],
              },
            },
            {
              id: "llm-call-4",
              name: "LLM call",
              type: "llm-call",
              status: "completed",
              duration: "2.35 sec",
              endedAt: "2026-03-10 09:29:37",
              stepDetails: {
                rawJson: {
                  input: {
                    model: "gpt-4o",
                    temperature: 0.7,
                    context: "Email sent successfully. All tasks complete.",
                  },
                  output: {
                    response: "All tasks completed. The cheapest iPhone 16 with 256GB was found at $829 from apple.com, approval was obtained, and the requester has been notified via email.",
                    tokens_used: 421,
                    finish_reason: "stop",
                  },
                },
              },
            },
          ],
        },
        {
          id: "agent-output",
          name: "Agent output",
          type: "agent-output",
          status: "completed",
          duration: "< 1 ms",
          endedAt: "2026-03-10 09:29:37",
          stepDetails: {
            output: [
              { name: "bestMatch", value: "Apple iPhone 16 — 256GB — Ultramarine — $829.00" },
              { name: "retailer", value: "apple.com" },
              { name: "approvalStatus", value: "Approved" },
              { name: "approvalId", value: "APR-2026-0310-7291" },
              { name: "emailSent", value: "true" },
            ],
          },
        },
      ],
    },
    {
      id: "gateway-resolved",
      name: "Resolved (Gateway)",
      type: "gateway",
      status: "completed",
      duration: "< 1 sec",
      endedAt: "2026-03-10 09:29:38",
    },
    {
      id: "approve-invoice",
      name: "Approve Invoice",
      type: "service-task",
      status: "completed",
      duration: "7 sec",
      endedAt: "2026-03-10 09:29:45",
      stepDetails: {
        input: [
          { name: "invoiceId", value: "INV-2026-0310-001" },
          { name: "amount", value: "$829.00" },
          { name: "vendor", value: "Apple Inc." },
          { name: "approvalId", value: "APR-2026-0310-7291" },
        ],
        output: [
          { name: "approved", value: "true" },
          { name: "approvedBy", value: "Finance.Dept@uipath.com" },
          { name: "poNumber", value: "PO-2026-03-10-8412" },
        ],
      },
    },
    {
      id: "notification",
      name: "Internal Notification",
      type: "service-task",
      status: "completed",
      duration: "12 sec",
      endedAt: "2026-03-10 09:32:06",
      stepDetails: {
        input: [
          { name: "channel", value: "robot-job" },
          { name: "jobId", value: "cba86258-b2e1-4fa0-8f2a-acacd550b0f9" },
        ],
        output: [{ name: "status", value: "delivered" }],
      },
      children: [
        {
          id: "robot-job",
          name: "Robot Job cba86258-b2e1-4fa0-8f2a-acacd550b0f9",
          type: "robot-job",
          status: "completed",
          duration: "2 min, 18 sec",
          endedAt: "2026-03-10 09:32:06",
          children: [
            {
              id: "manual-trigger",
              name: "Manual Trigger",
              type: "start-event",
              status: "completed",
              duration: "< 1 sec",
              endedAt: "2026-03-10 09:30:00",
            },
            {
              id: "read-range",
              name: "Read range",
              type: "service-task",
              status: "completed",
              duration: "3 sec",
              endedAt: "2026-03-10 09:30:03",
              stepDetails: {
                input: [
                  { name: "workbook", value: "Notifications_Template.xlsx" },
                  { name: "sheet", value: "Recipients" },
                  { name: "range", value: "A1:D50" },
                ],
                output: [
                  { name: "rowCount", value: "12" },
                  { name: "dataTable", value: "DataTable (12 rows × 4 columns)" },
                ],
              },
            },
            {
              id: "for-each-row",
              name: "For each row in data table",
              type: "loop",
              status: "completed",
              duration: "1 min, 52 sec",
              endedAt: "2026-03-10 09:31:55",
              iterations: (() => {
                const recipients = [
                  { name: "John Smith", email: "john.smith@company.com", department: "Security" },
                  { name: "Sarah Connor", email: "sarah.connor@company.com", department: "Finance" },
                  { name: "Mike Johnson", email: "mike.johnson@company.com", department: "Procurement" },
                  { name: "Emily Davis", email: "emily.davis@company.com", department: "IT" },
                  { name: "Robert Wilson", email: "robert.wilson@company.com", department: "HR" },
                  { name: "Lisa Anderson", email: "lisa.anderson@company.com", department: "Compliance" },
                  { name: "David Martinez", email: "david.martinez@company.com", department: "Operations" },
                  { name: "Jennifer Taylor", email: "jennifer.taylor@company.com", department: "Legal" },
                  { name: "Chris Brown", email: "chris.brown@company.com", department: "Engineering" },
                  { name: "Amanda White", email: "amanda.white@company.com", department: "Marketing" },
                  { name: "James Garcia", email: "james.garcia@company.com", department: "Sales" },
                  { name: "Patricia Lee", email: "patricia.lee@company.com", department: "Executive" },
                ];
                return recipients.map((r, i) => {
                  const idx = i + 1;
                  const baseSec = 6 + i * 9;
                  const m = Math.floor(baseSec / 60);
                  const s = baseSec % 60;
                  const sendDuration = 5 + (i % 5);
                  const sendSec = baseSec + sendDuration;
                  const sm = Math.floor(sendSec / 60);
                  const ss = sendSec % 60;
                  const ts = (min: number, sec: number) =>
                    `2026-03-10 09:${String(30 + min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
                  const assignTime = ts(m, s);
                  const sendTime = ts(sm, ss);
                  const subject = `[PO-2026-03-10-8412] iPhone 16 Purchase — ${r.department} notification`;
                  const body = `Hello ${r.name},\n\nPurchase order PO-2026-03-10-8412 for Apple iPhone 16 256GB ($829.00) has been approved and is being processed.\n\nRegards,\nMaestro RPA`;
                  return [
                    {
                      id: `iter${idx}-extract-fields`,
                      name: "Assign — Extract row fields",
                      type: "assign" as const,
                      status: "completed" as const,
                      duration: "< 1 sec",
                      endedAt: assignTime,
                      stepDetails: {
                        input: [
                          { name: "recipientName", value: 'CurrentRow("Name").ToString' },
                          { name: "recipientEmail", value: 'CurrentRow("Email").ToString' },
                          { name: "department", value: 'CurrentRow("Department").ToString' },
                        ],
                        output: [
                          { name: "recipientName", value: r.name },
                          { name: "recipientEmail", value: r.email },
                          { name: "department", value: r.department },
                        ],
                      },
                    },
                    {
                      id: `iter${idx}-compose-subject`,
                      name: "Assign — Compose subject",
                      type: "assign" as const,
                      status: "completed" as const,
                      duration: "< 1 sec",
                      endedAt: assignTime,
                      stepDetails: {
                        output: [{ name: "emailSubject", value: subject }],
                      },
                    },
                    {
                      id: `iter${idx}-compose-body`,
                      name: "Assign — Compose body",
                      type: "assign" as const,
                      status: "completed" as const,
                      duration: "< 1 sec",
                      endedAt: assignTime,
                      stepDetails: {
                        output: [{ name: "emailBody", value: body }],
                      },
                    },
                    {
                      id: `iter${idx}-send-email`,
                      name: "Send email",
                      type: "service-task" as const,
                      status: "completed" as const,
                      duration: `${sendDuration} sec`,
                      endedAt: sendTime,
                      stepDetails: {
                        input: [
                          { name: "to", value: r.email },
                          { name: "subject", value: subject },
                          { name: "body", value: body },
                        ],
                        output: [{ name: "status", value: "sent" }],
                      },
                    },
                    {
                      id: `iter${idx}-increment`,
                      name: "Assign — Increment counter",
                      type: "assign" as const,
                      status: "completed" as const,
                      duration: "< 1 sec",
                      endedAt: sendTime,
                      stepDetails: {
                        output: [{ name: "counter", value: String(idx) }],
                      },
                    },
                  ];
                });
              })(),
            },
            {
              id: "assign-output",
              name: "Assign — Output total",
              type: "assign",
              status: "completed",
              duration: "< 1 sec",
              endedAt: "2026-03-10 09:31:56",
              stepDetails: {
                input: [{ name: "expression", value: "counter" }],
                output: [{ name: "totalNotifications", value: "12" }],
              },
            },
          ],
        },
      ],
    },
    {
      id: "end-event",
      name: "End event",
      type: "end-event",
      status: "completed",
      duration: "< 1 sec",
      endedAt: "2026-03-10 09:32:06",
    },
  ],
};

/* ── Global variables ───────────────────────────────────────────── */

export const instanceGlobalVars_5788894: GlobalVariable[] = [
  {
    name: "content",
    type: "string",
    source: "Agent Scout",
    value: '{"name":"Apple iPhone 16","price":"$829.00","color":"Ultramarine","storage":"256GB","retailer":"apple.com"}',
  },
  {
    name: "approvalId",
    type: "string",
    source: "Agent Scout",
    value: "APR-2026-0310-7291",
  },
  {
    name: "invoiceId",
    type: "string",
    source: "Approve Invoice",
    value: "INV-2026-0310-001",
  },
  {
    name: "poNumber",
    type: "string",
    source: "Approve Invoice",
    value: "PO-2026-03-10-8412",
  },
  {
    name: "notificationCount",
    type: "number",
    source: "Internal Notification",
    value: "12",
  },
  {
    name: "Error",
    type: "string",
    source: "Internal Notification",
    value: null,
  },
];

/* ── ExecutionTrail (step detail / agent canvas view) ───────────── */

export const executionTrail_5788894: ExecutionTrailNode = {
  id: "instance-root",
  label: "Instance: 7a2f1e3d-9b84-4c6a-a1d7-8e5f3c2b9a04",
  status: "completed",
  duration: "17 min, 4 sec",
  endedAt: "2026-03-10 09:32:06",
  children: [
    {
      id: "start-event",
      label: "New iPhone Request (Start event)",
      status: "completed",
      duration: "< 1 sec",
      endedAt: "2026-03-10 09:15:02",
    },
    {
      id: "manager-approval",
      label: "Manager Approval",
      status: "completed",
      duration: "12 sec",
      endedAt: "2026-03-10 09:15:14",
    },
    {
      id: "gateway-resolution",
      label: "Is resolution required (Gateway)",
      status: "completed",
      duration: "< 1 sec",
      endedAt: "2026-03-10 09:15:15",
    },
    {
      id: "agent-scout",
      label: "Agent Scout",
      status: "completed",
      duration: "14 min, 22 sec",
      endedAt: "2026-03-10 09:29:37",
      input: { query: "Find cheapest Apple iPhone 16 with 256GB storage" },
      output: { result: "Success", bestMatch: "Apple iPhone 16 — 256GB — Ultramarine — $829.00" },
      children: [
        {
          id: "agent-run",
          label: "Agent run - Agent Scout",
          status: "completed",
          duration: "5 min, 26 sec",
          endedAt: "2026-03-10 09:29:37",
          children: [
            {
              id: "llm-call-1",
              label: "LLM call",
              status: "completed",
              duration: "2.27 sec",
              endedAt: "2026-03-10 09:18:29",
            },
            {
              id: "tool-call-phone",
              label: "Tool call - Phone_Lowest_Price",
              status: "completed",
              duration: "4 min, 32 sec",
              endedAt: "2026-03-10 09:22:58",
              input: { query: "cheapest Apple iPhone 16 256GB" },
              output: { output_UI: "Completed", bestPrice: "$829.00", retailer: "apple.com" },
              children: [
                {
                  id: "phone-lowest-price",
                  label: "Phone Lowest Price",
                  status: "completed",
                  duration: "4 min, 30 sec",
                  endedAt: "2026-03-10 09:22:58",
                  input: { query: "cheapest Apple iPhone 16 256GB", maxResults: "5" },
                  output: { bestPrice: "$829.00", retailer: "apple.com", model: "iPhone 16", color: "Ultramarine", storage: "256GB" },
                  children: [
                    { id: "manual-trigger", label: "Manual Trigger", status: "completed", duration: "< 1 sec", endedAt: "2026-03-10 09:18:30",
                      input: { triggerType: "ToolCall", callerAgent: "Price Scout Phone" },
                      output: { initialized: "true" },
                    },
                    { id: "use-browser", label: "Use Browser Chrome: Buy iPhone - Apple", status: "completed", duration: "3 min, 45 sec", endedAt: "2026-03-10 09:22:15",
                      input: { browserType: "Chrome", url: "https://www.apple.com/shop/buy-iphone", headless: "false" },
                      output: { pageTitle: "Buy iPhone - Apple", loadTime: "1.2s" },
                      children: [
                        { id: "screenplay", label: "ScreenPlay", status: "completed", duration: "2 min, 10 sec", endedAt: "2026-03-10 09:20:40",
                          input: { action: "Navigate and extract pricing", selector: "#buystrip-iphone-16" },
                          output: { extractedText: "iPhone 16 From $829", screenshotTaken: "true" },
                        },
                        { id: "log-message", label: "Log Message", status: "completed", duration: "< 1 sec", endedAt: "2026-03-10 09:20:41",
                          input: { level: "Info", message: "Found price: $829.00 for iPhone 16 256GB Ultramarine" },
                          output: { logged: "true" },
                        },
                        { id: "assign-variable", label: "Assign Variable Value", status: "completed", duration: "< 1 sec", endedAt: "2026-03-10 09:20:42",
                          input: { variableName: "out_BestPrice", value: "$829.00" },
                          output: { assigned: "true", variableType: "String" },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: "tool-call-acquisition",
              label: "Tool call - Acquisition_Policy_Item",
              status: "completed",
              duration: "3.98 sec",
              endedAt: "2026-03-10 09:22:62",
              input: { itemName: "Apple iPhone 16 256GB", price: "$829.00" },
              output: { requiresApproval: "true", approvalLevel: "manager" },
            },
            {
              id: "llm-call-2",
              label: "LLM call",
              status: "completed",
              duration: "2.68 sec",
              endedAt: "2026-03-10 09:23:02",
            },
            {
              id: "tool-call-approve",
              label: "Tool call - escalate_approve_module",
              status: "completed",
              duration: "27 sec",
              endedAt: "2026-03-10 09:23:28",
              input: { item: "Apple iPhone 16 256GB", amount: "$829.00" },
              output: { approved: "true", approvedBy: "John.Manager@uipath.com" },
            },
            {
              id: "llm-call-3",
              label: "LLM call",
              status: "completed",
              duration: "3.03 sec",
              endedAt: "2026-03-10 09:23:31",
            },
            {
              id: "tool-call-email",
              label: "Tool call - Send_Email",
              status: "completed",
              duration: "3.53 sec",
              endedAt: "2026-03-10 09:29:34",
              input: { to: "Mihai.Bozgan@uipath.com", subject: "iPhone 16 Purchase Approved" },
              output: { status: "sent" },
            },
            {
              id: "llm-call-4",
              label: "LLM call",
              status: "completed",
              duration: "2.35 sec",
              endedAt: "2026-03-10 09:29:37",
            },
          ],
        },
      ],
    },
    {
      id: "notification",
      label: "Internal Notification",
      status: "completed",
      duration: "12 sec",
      endedAt: "2026-03-10 09:32:06",
      input: { channel: "robot-job", jobId: "cba86258-b2e1-4fa0-8f2a-acacd550b0f9" },
      output: { status: "delivered" },
      children: [
        {
          id: "robot-job",
          label: "Robot Job cba86258-b2e1-4fa0-8f2a-acacd550b0f9",
          status: "completed",
          duration: "2 min, 18 sec",
          endedAt: "2026-03-10 09:32:06",
          children: [
            {
              id: "manual-trigger",
              label: "Manual Trigger",
              status: "completed",
              duration: "< 1 sec",
              endedAt: "2026-03-10 09:30:00",
              input: { triggerType: "RobotJob", jobId: "cba86258-b2e1-4fa0-8f2a-acacd550b0f9" },
              output: { initialized: "true" },
            },
            {
              id: "read-range",
              label: "Read range",
              status: "completed",
              duration: "3 sec",
              endedAt: "2026-03-10 09:30:03",
              input: { workbook: "Notifications_Template.xlsx", sheet: "Recipients", range: "A1:D50" },
              output: { rowCount: "12", dataTable: "DataTable (12 rows × 4 columns)" },
            },
            {
              id: "for-each-row",
              label: "For each row in data table",
              status: "completed",
              duration: "1 min, 52 sec",
              endedAt: "2026-03-10 09:31:55",
              children: (() => {
                const recipients = [
                  { name: "John Smith", email: "john.smith@company.com", department: "Security" },
                  { name: "Sarah Connor", email: "sarah.connor@company.com", department: "Finance" },
                  { name: "Mike Johnson", email: "mike.johnson@company.com", department: "Procurement" },
                  { name: "Emily Davis", email: "emily.davis@company.com", department: "IT" },
                  { name: "Robert Wilson", email: "robert.wilson@company.com", department: "HR" },
                  { name: "Lisa Anderson", email: "lisa.anderson@company.com", department: "Compliance" },
                  { name: "David Martinez", email: "david.martinez@company.com", department: "Operations" },
                  { name: "Jennifer Taylor", email: "jennifer.taylor@company.com", department: "Legal" },
                  { name: "Chris Brown", email: "chris.brown@company.com", department: "Engineering" },
                  { name: "Amanda White", email: "amanda.white@company.com", department: "Marketing" },
                  { name: "James Garcia", email: "james.garcia@company.com", department: "Sales" },
                  { name: "Patricia Lee", email: "patricia.lee@company.com", department: "Executive" },
                ];
                return recipients.map<ExecutionTrailNode>((r, i) => {
                  const idx = i + 1;
                  const baseSec = 6 + i * 9;
                  const m = Math.floor(baseSec / 60);
                  const s = baseSec % 60;
                  const sendDuration = 5 + (i % 5);
                  const sendSec = baseSec + sendDuration;
                  const sm = Math.floor(sendSec / 60);
                  const ss = sendSec % 60;
                  const ts = (min: number, sec: number) =>
                    `2026-03-10 09:${String(30 + min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
                  const assignTime = ts(m, s);
                  const sendTime = ts(sm, ss);
                  const subject = `[PO-2026-03-10-8412] iPhone 16 Purchase — ${r.department} notification`;
                  const body = `Hello ${r.name},\n\nPurchase order PO-2026-03-10-8412 for Apple iPhone 16 256GB ($829.00) has been approved.\n\nRegards,\nMaestro RPA`;

                  return {
                    id: `iteration-${idx}`,
                    label: `Iteration ${idx} — ${r.name}`,
                    status: "completed" as const,
                    duration: `${sendDuration + 4} sec`,
                    endedAt: sendTime,
                    children: [
                      {
                        id: `iter${idx}-extract-fields`,
                        label: "Assign — Extract row fields",
                        status: "completed" as const,
                        duration: "< 1 sec",
                        endedAt: assignTime,
                        input: {
                          recipientName: 'CurrentRow("Name").ToString',
                          recipientEmail: 'CurrentRow("Email").ToString',
                          department: 'CurrentRow("Department").ToString',
                        },
                        output: {
                          recipientName: r.name,
                          recipientEmail: r.email,
                          department: r.department,
                        },
                      },
                      {
                        id: `iter${idx}-compose-subject`,
                        label: "Assign — Compose subject",
                        status: "completed" as const,
                        duration: "< 1 sec",
                        endedAt: assignTime,
                        output: { emailSubject: subject },
                      },
                      {
                        id: `iter${idx}-compose-body`,
                        label: "Assign — Compose body",
                        status: "completed" as const,
                        duration: "< 1 sec",
                        endedAt: assignTime,
                        output: { emailBody: body },
                      },
                      {
                        id: `iter${idx}-send-email`,
                        label: "Send email",
                        status: "completed" as const,
                        duration: `${sendDuration} sec`,
                        endedAt: sendTime,
                        input: { to: r.email, subject, body },
                        output: { status: "sent" },
                      },
                      {
                        id: `iter${idx}-increment`,
                        label: "Assign — Increment counter",
                        status: "completed" as const,
                        duration: "< 1 sec",
                        endedAt: sendTime,
                        output: { counter: String(idx) },
                      },
                    ] as ExecutionTrailNode[],
                  };
                });
              })(),
            },
            {
              id: "assign-output",
              label: "Assign — Output total",
              status: "completed",
              duration: "< 1 sec",
              endedAt: "2026-03-10 09:31:56",
              input: { expression: "counter" },
              output: { totalNotifications: "12" },
            },
            {
              id: "log-message",
              label: "Log Message (Info)",
              status: "completed",
              duration: "< 1 sec",
              endedAt: "2026-03-10 09:32:00",
              input: { message: "All 12 notifications delivered successfully for PO-2026-03-10-8412." },
              output: { logged: "true" },
            },
          ],
        },
      ],
    },
    {
      id: "end-event",
      label: "End event",
      status: "completed",
      duration: "< 1 sec",
      endedAt: "2026-03-10 09:32:06",
    },
  ],
};

/* ── Robot Job canvas steps for Internal Notification ────────────── */

import type { RobotJobStep } from "../components/robot-job-canvas-diagram";

export const notificationCanvasSteps_5788894: RobotJobStep[] = [
  { id: "manual-trigger", label: "Manual Trigger", type: "trigger" },
  { id: "read-range", label: "Read range", type: "read-range" },
  { id: "for-each-row", label: "For each row in data table", type: "for-each", loopHeader: true },
  { id: "iter-extract-fields", label: "Assign — Extract row fields", type: "assign", loopChild: true },
  { id: "iter-compose-subject", label: "Assign — Compose subject", type: "assign", loopChild: true },
  { id: "iter-compose-body", label: "Assign — Compose body", type: "assign", loopChild: true },
  { id: "iter-send-email", label: "Send email", type: "send-email", loopChild: true },
  { id: "iter-increment", label: "Assign — Increment counter", type: "assign", loopChild: true, loopLast: true },
  { id: "assign-output", label: "Assign — Output total", type: "assign" },
  { id: "log-message", label: "Log Message (Info)", type: "log-message" },
  { id: "end", label: "", type: "end" },
];

/* ── Sequential workflow steps for Cheapest Apple iPhone (phone-lowest-price) ── */

export const phoneLowestPriceCanvasSteps_5788894: RobotJobStep[] = [
  { id: "manual-trigger", label: "Manual Trigger", type: "trigger" },
  { id: "use-browser", label: "Use Browser Chrome: Buy iPhone - Apple", type: "assign", loopHeader: true },
  { id: "screenplay", label: "ScreenPlay", type: "assign", loopChild: true },
  { id: "log-message", label: "Log Message", type: "log-message", loopChild: true },
  { id: "assign-variable", label: "Assign Variable Value", type: "assign", loopChild: true, loopLast: true },
  { id: "end", label: "", type: "end" },
];

/* ── Agent canvas nodes for Agent Scout (completed) ─────────────── */

export const agentCanvasNodes_5788894: AgentCanvasNode[] = [
  { id: "approve-module", label: "Approve Module", status: "completed", x: 80, y: 60, category: "escalations", icon: "user" },
  { id: "acquisition-policy", label: "Acquisition policy item", status: "completed", x: 320, y: 60, category: "context", icon: "document" },
  { id: "cheapest-iphone", label: "Cheapest Apple iPhone", status: "completed", x: 80, y: 180, category: "tools", icon: "workflow" },
  { id: "send-email", label: "Send Email", status: "completed", x: 320, y: 180, category: "tools", icon: "email" },
];

/* ── Log entries for the completed instance ─────────────────────── */

export const logEntries_5788894 = [
  { time: "09:15:02", level: "info" as const, message: "Process instance started" },
  { time: "09:15:02", level: "info" as const, message: "New iPhone Request received — awaiting Manager Approval" },
  { time: "09:15:14", level: "audit" as const, message: "Audit: Manager Approval granted by John.Manager@uipath.com" },
  { time: "09:15:15", level: "info" as const, message: "Gateway: Resolution required — routing to Agent Scout" },
  { time: "09:18:29", level: "info" as const, message: "Agent Scout: LLM call completed (gpt-4o, 387 tokens)" },
  { time: "09:18:29", level: "info" as const, message: "Phone Lowest Price execution started" },
  { time: "09:20:45", level: "audit" as const, message: "Audit: Using Web App. Browser: Chrome URL: https://www.apple.com/shop/buy-iphone" },
  { time: "09:22:58", level: "info" as const, message: '{"name": "Apple iPhone 16", "price": "$829.00", "color": "Ultramarine", "storage": "256GB"}' },
  { time: "09:22:58", level: "info" as const, message: "Phone Lowest Price execution ended" },
  { time: "09:22:62", level: "info" as const, message: "Acquisition_Policy_Item: requires manager approval (ACQ-POLICY-2026-MOBILE-001)" },
  { time: "09:23:02", level: "info" as const, message: "Agent Scout: LLM reasoning — escalating to approve module" },
  { time: "09:23:28", level: "audit" as const, message: "Audit: Escalation approved by John.Manager@uipath.com (APR-2026-0310-7291)" },
  { time: "09:23:31", level: "info" as const, message: "Agent Scout: LLM call — preparing confirmation email" },
  { time: "09:29:34", level: "info" as const, message: "Send_Email: confirmation sent to Mihai.Bozgan@uipath.com" },
  { time: "09:29:37", level: "info" as const, message: "Agent Scout: Final LLM call — summarizing results (421 tokens)" },
  { time: "09:29:37", level: "info" as const, message: "Agent Scout completed successfully" },
  { time: "09:29:38", level: "info" as const, message: "Gateway: Resolved — proceeding to Approve Invoice" },
  { time: "09:29:45", level: "audit" as const, message: "Audit: Invoice INV-2026-0310-001 approved. PO-2026-03-10-8412 issued." },
  { time: "09:30:00", level: "info" as const, message: "Robot Job started: cba86258-b2e1-4fa0-8f2a-acacd550b0f9" },
  { time: "09:30:03", level: "info" as const, message: "Read range: 12 rows loaded from Notifications_Template.xlsx" },
  { time: "09:31:55", level: "info" as const, message: "For each row: 12 of 12 notifications sent" },
  { time: "09:31:56", level: "info" as const, message: "Assign: totalNotifications = 12" },
  { time: "09:32:00", level: "info" as const, message: "Log: All 12 notifications delivered successfully for PO-2026-03-10-8412." },
  { time: "09:32:06", level: "info" as const, message: "Process instance completed successfully" },
];
