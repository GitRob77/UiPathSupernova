import type {
  Breakpoint,
  LogEntry,
  LocalsSection,
  RunHistoryItem,
  WatchItem,
} from "./types";

export const DEMO_RUN_HISTORY: RunHistoryItem[] = [
  {
    id: "run-1",
    label: "Email Received",
    timestamp: "09/26/2025 · 10:42",
    icon: "mail",
    status: "in-progress",
    steps: [
      { id: "r1-s1", label: "Post-execution governance", icon: "shield", status: "success", duration: "5.9 s" },
      {
        id: "r1-s2", label: "Tool call - escalate_approve_module", icon: "tool", status: "success", duration: "3.2 s", children: [
          { id: "r1-s2-1", label: "Request Validation Centre", icon: "sparkles" },
        ],
      },
      {
        id: "r1-s3", label: "LLM call", icon: "llm", status: "success", duration: "1.8 s", children: [
          { id: "r1-s3-1", label: "Model run", icon: "sparkles", badge: "gpt-4o-2024-11-20" },
        ],
      },
      {
        id: "r1-s4", label: "Tool call - Send_Email", icon: "tool", status: "success", duration: "2.1 s", children: [
          { id: "r1-s4-1", label: "Send_Email", icon: "send" },
        ],
      },
      {
        id: "r1-s5", label: "LLM call", icon: "llm", status: "success", duration: "1.4 s", children: [
          { id: "r1-s5-1", label: "Model run", icon: "sparkles", badge: "gpt-4o-2024-11-20" },
        ],
      },
      { id: "r1-s6", label: "Agent output", icon: "output", status: "success", duration: "0.3 s" },
      { id: "r1-s7", label: "Send Notification", icon: "send", status: "in-progress", isCurrent: true },
    ],
  },
  {
    id: "run-2",
    label: "Invoice Processing",
    timestamp: "09/26/2025 · 10:38",
    icon: "document",
    status: "success",
    duration: "2m 14s",
    steps: [
      {
        id: "r2-s1", label: "Tool call - extract_invoice_data", icon: "tool", status: "success", duration: "12.3 s", children: [
          { id: "r2-s1-1", label: "Extract Invoice Data", icon: "sparkles" },
        ],
      },
      {
        id: "r2-s2", label: "LLM call", icon: "llm", status: "success", duration: "3.1 s", children: [
          { id: "r2-s2-1", label: "Model run", icon: "sparkles", badge: "gpt-4o-2024-11-20" },
        ],
      },
      {
        id: "r2-s3", label: "Tool call - validate_vendor", icon: "tool", status: "success", duration: "5.2 s", children: [
          { id: "r2-s3-1", label: "Validate Vendor", icon: "sparkles" },
        ],
      },
      {
        id: "r2-s4", label: "Tool call - route_to_approval", icon: "tool", status: "success", duration: "2.4 s", children: [
          { id: "r2-s4-1", label: "Route to Approval Queue", icon: "send" },
        ],
      },
      { id: "r2-s5", label: "Agent output", icon: "output", status: "success", duration: "0.2 s" },
    ],
  },
  {
    id: "run-3",
    label: "Data Validation",
    timestamp: "09/26/2025 · 10:31",
    icon: "document",
    status: "canceled",
    duration: "0m 47s",
    steps: [
      { id: "r3-s1", label: "Tool call - validate_schema", icon: "tool", status: "success", duration: "4.1 s" },
      { id: "r3-s2", label: "LLM call", icon: "llm", status: "success", duration: "2.3 s" },
      { id: "r3-s3", label: "Tool call - check_duplicates", icon: "tool", status: "canceled" },
    ],
  },
];

export const DEMO_BREAKPOINTS: Breakpoint[] = [
  { id: "bp-1", label: "Log Message (Info)" },
  { id: "bp-2", label: "Assign — Output total" },
  { id: "bp-3", label: "Assign — Compose body" },
  { id: "bp-4", label: "Assign — Compose subject" },
  { id: "bp-5", label: "Assign — Extract row fields" },
];

export const DEMO_LOG_ENTRIES: Record<string, LogEntry[]> = {
  "run-1": [
    { id: "log-1", time: "17:35:49", message: "Building project", level: "info", duration: "3s" },
    { id: "log-2", time: "17:35:51", message: "Project built", level: "info", duration: "3s" },
    { id: "log-3", time: "17:35:53", message: "Debug session is initializing", level: "trace", duration: "3s" },
    { id: "log-4", time: "17:35:53", message: "Transferring project", level: "trace", duration: "3s" },
    { id: "log-5", time: "17:35:55", message: "Download completed", level: "trace", duration: "3s" },
    { id: "log-6", time: "17:35:57", message: "Restoring NuGet packages", level: "trace", duration: "3s" },
    { id: "log-7", time: "17:36:01", message: "Packages restored", level: "trace", duration: "3s" },
    { id: "log-8", time: "17:36:02", message: 'Trigger "Email Received" execution started', level: "info", duration: "3s" },
    { id: "log-9", time: "17:36:15", message: "Trying to get an email received that matches the filter criteria", level: "info", duration: "3s" },
    { id: "log-10", time: "17:36:22", message: "1 received email matching the filters", level: "success", duration: "3s" },
    { id: "log-11", time: "17:36:25", message: "Failed to send notification: SMTP connection timeout", level: "error", duration: "5s" },
  ],
  "run-2": [
    { id: "log-1", time: "10:38:01", message: "Building project", level: "info", duration: "2s" },
    { id: "log-2", time: "10:38:03", message: "Project built", level: "info", duration: "2s" },
    { id: "log-3", time: "10:38:05", message: "Debug session is initializing", level: "trace", duration: "1s" },
    { id: "log-4", time: "10:38:06", message: "Transferring project", level: "trace", duration: "2s" },
    { id: "log-5", time: "10:38:08", message: "Download completed", level: "trace", duration: "2s" },
    { id: "log-6", time: "10:38:10", message: 'Trigger "Invoice Processing" execution started', level: "info", duration: "4s" },
    { id: "log-7", time: "10:38:14", message: "Reading invoice data from attachment", level: "info", duration: "12s" },
    { id: "log-8", time: "10:38:26", message: "Invoice extracted: INV-2025-0042", level: "info", duration: "3s" },
    { id: "log-9", time: "10:38:29", message: "Validating vendor against approved list", level: "trace", duration: "5s" },
    { id: "log-10", time: "10:38:34", message: "Vendor validated — Acme Corp", level: "success", duration: "1s" },
    { id: "log-11", time: "10:40:12", message: "Invoice routed to approval queue", level: "success", duration: "2s" },
  ],
  "run-3": [
    { id: "log-1", time: "10:31:01", message: "Building project", level: "info", duration: "2s" },
    { id: "log-2", time: "10:31:03", message: "Project built", level: "info", duration: "2s" },
    { id: "log-3", time: "10:31:05", message: "Validating data schema", level: "info", duration: "4s" },
    { id: "log-4", time: "10:31:09", message: "Schema validation passed", level: "success", duration: "1s" },
    { id: "log-5", time: "10:31:10", message: "Checking for duplicates", level: "info", duration: "3s" },
    { id: "log-6", time: "10:31:13", message: "Execution canceled by user", level: "error", duration: "0s" },
  ],
};

export const DEMO_WATCHES: WatchItem[] = [
  { id: "w-1", expression: "notification.Recipient", value: "mihai@company.com", type: "string" },
  { id: "w-2", expression: "notification.Priority", value: "High", type: "string" },
  { id: "w-3", expression: "context.InvoiceNumber", value: "INV-2025-0042", type: "string" },
  { id: "w-4", expression: "context.VendorName", value: "Acme Corp", type: "string" },
  {
    id: "w-5", expression: "notification", type: "object",
    children: [
      { name: "Recipient", value: "mihai@company.com", type: "string" },
      { name: "Channel", value: "Email", type: "string" },
      { name: "Subject", value: "Escalation: Invoice approval required", type: "string" },
      { name: "Priority", value: "High", type: "string" },
    ],
  },
  { id: "w-6", expression: "deliveryStatus", type: "error", value: "undefined" },
  { id: "w-7", expression: "retryCount", value: "0", type: "number" },
];

export const DEMO_LOCALS_SECTIONS: Record<string, LocalsSection[]> = {
  "run-1": [
    {
      id: "input",
      label: "Input",
      defaultOpen: true,
      direction: "IN",
      items: [
        {
          name: "notification", type: "object", children: [
            { name: "Recipient", type: "string", value: "mihai@company.com" },
            { name: "Channel", type: "string", value: "Email" },
            { name: "Subject", type: "string", value: "Escalation: Invoice approval required" },
            { name: "Body", type: "string", value: "Invoice INV-2025-0042 from Acme Corp requires manual approval." },
            { name: "Priority", type: "string", value: "High" },
            { name: "TemplateId", type: "string", value: "escalation-notify-v2" },
          ]
        },
        {
          name: "context", type: "object", children: [
            { name: "TriggerId", type: "string", value: "r1-email-received" },
            { name: "InvoiceNumber", type: "string", value: "INV-2025-0042" },
            { name: "VendorName", type: "string", value: "Acme Corp" },
            { name: "EscalationReason", type: "string", value: "Amount exceeds auto-approval threshold" },
          ]
        },
      ],
    },
    {
      id: "output",
      label: "Output",
      defaultOpen: true,
      direction: "OUT",
      items: [
        { name: "notificationId", type: "string" },
        { name: "deliveryStatus", type: "string" },
        { name: "sentAt", type: "string" },
      ],
    },
    {
      id: "variables",
      label: "Variables",
      defaultOpen: true,
      items: [
        { name: "notificationId", type: "string" },
        { name: "deliveryStatus", type: "string" },
        { name: "retryCount", type: "number" },
        { name: "isDelivered", type: "boolean" },
      ],
    },
  ],
  "run-2": [
    {
      id: "input",
      label: "Input",
      defaultOpen: true,
      direction: "IN",
      items: [
        {
          name: "invoice", type: "object", children: [
            { name: "InvoiceNumber", type: "string", value: "INV-2025-0042" },
            { name: "InvoiceDate", type: "string", value: "2025-09-26T00:00:00Z" },
            { name: "DueDate", type: "string", value: "2025-10-26T00:00:00Z" },
            { name: "Status", type: "string", value: "Approved" },
            { name: "Currency", type: "string", value: "USD" },
            {
              name: "Vendor", type: "object", children: [
                { name: "Name", type: "string", value: "Acme Corp" },
                { name: "TaxId", type: "string", value: "US-823491" },
                { name: "ContactEmail", type: "string", value: "billing@acme.com" },
              ]
            },
            {
              name: "LineItems", type: "array", children: [
                { name: "Description", type: "string", value: "Consulting Services Q3" },
                { name: "Quantity", type: "number", value: "40" },
                { name: "UnitPrice", type: "number", value: "150.00" },
                { name: "LineTotal", type: "number", value: "6000.00" },
              ]
            },
            { name: "TotalAmount", type: "number", value: "6000.00" },
            { name: "PaymentTerms", type: "string", value: "Net 30" },
          ]
        },
      ],
    },
    {
      id: "output",
      label: "Output",
      defaultOpen: true,
      direction: "OUT",
      items: [
        { name: "approvalStatus", type: "string", value: "Approved" },
        { name: "approvedBy", type: "string", value: "john.doe@company.com" },
        { name: "routedTo", type: "string", value: "AP Queue" },
        { name: "processedAt", type: "string", value: "2025-09-26T10:40:12Z" },
      ],
    },
    {
      id: "variables",
      label: "Variables",
      defaultOpen: true,
      items: [
        { name: "vendorName", type: "string", value: "Acme Corp" },
        { name: "totalAmount", type: "number", value: "6000.00" },
        { name: "isApproved", type: "boolean", value: "true" },
      ],
    },
  ],
  "run-3": [
    {
      id: "input",
      label: "Input",
      defaultOpen: true,
      direction: "IN",
      items: [
        { name: "datasetId", type: "string", value: "DS-2025-0891" },
        { name: "schemaVersion", type: "string", value: "v2.1" },
      ],
    },
    {
      id: "output",
      label: "Output",
      defaultOpen: true,
      direction: "OUT",
      items: [
        { name: "validationResult", type: "string" },
        { name: "errorMessage", type: "string", value: "Execution canceled by user" },
      ],
    },
    {
      id: "variables",
      label: "Variables",
      defaultOpen: true,
      items: [
        { name: "schemaValid", type: "boolean", value: "true" },
        { name: "duplicateCount", type: "number" },
        { name: "isCanceled", type: "boolean", value: "true" },
      ],
    },
  ],
};
