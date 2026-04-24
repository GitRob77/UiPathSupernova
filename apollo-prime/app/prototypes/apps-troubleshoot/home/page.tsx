"use client";

import { useState } from "react";
import { AppHeader } from "@/components/custom/app-header";
import { SidebarNav } from "@/components/custom/sidebar-nav";
import {
  DataGrid,
  DataTableColumnHeader,
} from "@/components/custom/data-grid";

import { StatusChip } from "@/components/custom/status-chip";
import { TabsNav, TabsContent } from "@/components/custom/tabs-nav";
import type { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Download,
  Play,
  Search,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Globe,
  X,
  Maximize2,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  CircleAlert,
  CircleCheck,
  Circle,
  RefreshCw,
  LayoutGrid,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@uipath/apollo-wind/components/ui/button";
import { Input } from "@uipath/apollo-wind/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@uipath/apollo-wind/components/ui/dropdown-menu";
import { ScrollArea } from "@uipath/apollo-wind/components/ui/scroll-area";
import { Separator } from "@uipath/apollo-wind/components/ui/separator";
import { Checkbox } from "@uipath/apollo-wind/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@uipath/apollo-wind/components/ui/popover";
import { Search as SearchInput } from "@uipath/apollo-wind/components/ui/search";

// ---------------------------------------------------------------------------
// Folder tree sidebar
// ---------------------------------------------------------------------------

interface FolderNode {
  name: string;
  children?: FolderNode[];
  active?: boolean;
}

const folderTree: FolderNode[] = [
  {
    name: "My Workspace",
    children: [
      {
        name: "Irina",
        active: true,
        children: [
          { name: "expense-report-app", active: true },
          { name: "inventory-tracker" },
        ],
      },
    ],
  },
  {
    name: "Shared",
    children: [
      { name: "onboarding-portal" },
      { name: "ticket-management" },
    ],
  },
];

function FolderTreeItem({
  node,
  depth = 0,
}: {
  node: FolderNode;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(!!node.children);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <button
        className={`flex w-full items-center gap-1 rounded px-2 py-1.5 text-sm hover:bg-accent ${
          node.active
            ? "bg-accent font-medium text-foreground"
            : "text-muted-foreground"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          )
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        {hasChildren && expanded ? (
          <FolderOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <span className="truncate">{node.name}</span>
      </button>
      {expanded &&
        hasChildren &&
        node.children!.map((child) => (
          <FolderTreeItem key={child.name} node={child} depth={depth + 1} />
        ))}
    </div>
  );
}

function FolderSidebar({ collapsed }: { collapsed: boolean }) {
  if (collapsed) return null;
  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pt-4 pb-2 text-sm font-semibold text-foreground">
        My Folders
      </div>
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search" className="h-8 pl-8 text-sm" />
        </div>
      </div>
      <ScrollArea className="flex-1 px-2">
        {folderTree.map((node) => (
          <FolderTreeItem key={node.name} node={node} />
        ))}
      </ScrollArea>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Apps data (for the Apps tab — mirrors the existing OR Apps grid)
// ---------------------------------------------------------------------------

interface DeployedApp {
  id: string;
  name: string;
  type: "JS App" | "Coded App";
  version: string;
  status: "Published" | "Draft";
  url: string;
}

const deployedApps: DeployedApp[] = [
  {
    id: "1",
    name: "expense-report-app",
    type: "JS App",
    version: "1.2.0",
    status: "Published",
    url: "https://cloud.uipath.com/apps/expense-report-app",
  },
  {
    id: "2",
    name: "inventory-tracker",
    type: "Coded App",
    version: "2.0.1",
    status: "Published",
    url: "https://cloud.uipath.com/apps/inventory-tracker",
  },
  {
    id: "3",
    name: "onboarding-portal",
    type: "Coded App",
    version: "1.0.0",
    status: "Published",
    url: "https://cloud.uipath.com/apps/onboarding-portal",
  },
  {
    id: "4",
    name: "ticket-management",
    type: "JS App",
    version: "3.1.0",
    status: "Published",
    url: "https://cloud.uipath.com/apps/ticket-management",
  },
];

// ---------------------------------------------------------------------------
// App session data — mirrors the Jobs grid structure
// ---------------------------------------------------------------------------

interface AppRun {
  id: string;
  sessionId: string;
  app: string;
  type: "JS App" | "Coded App";
  status: "Completed" | "Faulted" | "Running" | "Pending" | "Stopped";
  started: string;
  ended: string;
  duration: string;
  user: string;
  creationTime: string;
  package: string;
}

const appRunData: AppRun[] = [
  {
    id: "1",
    sessionId: "ida43548b6c33d4f12b5c9080a6b75d746",
    app: "expense-report-app",
    type: "JS App",
    status: "Faulted",
    started: "10 minutes ago",
    ended: "10 minutes ago",
    duration: "2.723s",
    creationTime: "10 minutes ago",
    user: "irina.capatina@uipath.com",
    package: "expense-report-app.jsApp.expense-report-app@1.2.0",
  },
  {
    id: "2",
    sessionId: "id7b2e91a0f845c3d9e1f6a8b2c4d7e0f1",
    app: "expense-report-app",
    type: "JS App",
    status: "Faulted",
    started: "12 minutes ago",
    ended: "12 minutes ago",
    duration: "13.707s",
    creationTime: "12 minutes ago",
    user: "alex.szoke@uipath.com",
    package: "expense-report-app.jsApp.expense-report-app@1.2.0",
  },
  {
    id: "3",
    sessionId: "id9c4f2d8e1a3b5c7d9e2f4a6b8c0d2e4f",
    app: "expense-report-app",
    type: "JS App",
    status: "Faulted",
    started: "8 hours ago",
    ended: "8 hours ago",
    duration: "12.447s",
    creationTime: "8 hours ago",
    user: "irina.capatina@uipath.com",
    package: "expense-report-app.jsApp.expense-report-app@1.2.0",
  },
  {
    id: "4",
    sessionId: "id2a6e8c0d4f2a4b6c8d0e2f4a6b8c0d2e",
    app: "inventory-tracker",
    type: "Coded App",
    status: "Completed",
    started: "1 hour ago",
    ended: "1 hour ago",
    duration: "4.102s",
    creationTime: "1 hour ago",
    user: "alex.roman@uipath.com",
    package: "inventory-tracker.codedApp.inventory-tracker@2.0.1",
  },
  {
    id: "5",
    sessionId: "id5d9f1a3b7c5e9d1f3a5b7c9d1e3f5a7b",
    app: "expense-report-app",
    type: "JS App",
    status: "Running",
    started: "2 minutes ago",
    ended: "",
    duration: "",
    creationTime: "2 minutes ago",
    user: "irina.capatina@uipath.com",
    package: "expense-report-app.jsApp.expense-report-app@1.2.0",
  },
  {
    id: "6",
    sessionId: "id8e2f4a6b0c8d2e4f6a8b0c2d4e6f8a0b",
    app: "onboarding-portal",
    type: "Coded App",
    status: "Completed",
    started: "2 days ago",
    ended: "2 days ago",
    duration: "6.102s",
    creationTime: "2 days ago",
    user: "alex.szoke@uipath.com",
    package: "onboarding-portal.codedApp.onboarding-portal@1.0.0",
  },
  {
    id: "7",
    sessionId: "id1b3d5f7a9c1e3b5d7f9a1c3e5b7d9f1a",
    app: "ticket-management",
    type: "JS App",
    status: "Completed",
    started: "3 days ago",
    ended: "3 days ago",
    duration: "2.510s",
    creationTime: "3 days ago",
    user: "alex.roman@uipath.com",
    package: "ticket-management.jsApp.ticket-management@3.1.0",
  },
  {
    id: "8",
    sessionId: "id4c6e8a0b2d4f6c8e0a2b4d6f8a0c2e4b",
    app: "inventory-tracker",
    type: "Coded App",
    status: "Faulted",
    started: "3 days ago",
    ended: "3 days ago",
    duration: "18.332s",
    creationTime: "3 days ago",
    user: "irina.capatina@uipath.com",
    package: "inventory-tracker.codedApp.inventory-tracker@2.0.1",
  },
];

// ---------------------------------------------------------------------------
// Trace data for the detail panel
// ---------------------------------------------------------------------------

interface TraceEntry {
  id: string;
  label: string;
  status: "success" | "error" | "running";
  duration: string;
  children?: TraceEntry[];
}

const sampleTrace: TraceEntry[] = [
  {
    id: "t1",
    label: "App Session a3f7c1d2-8e4b-4a12-b6d9-1e5f0a2c3b4d",
    status: "error",
    duration: "2.72s",
    children: [
      {
        id: "t1-1",
        label: "Initialize App",
        status: "success",
        duration: "120ms",
        children: [
          { id: "t1-1-1", label: "Load configuration", status: "success", duration: "<1ms" },
          { id: "t1-1-2", label: "Resolve bindings", status: "success", duration: "45ms" },
        ],
      },
      {
        id: "t1-2",
        label: "Execute onSubmit handler",
        status: "error",
        duration: "2.1s",
        children: [
          { id: "t1-2-1", label: "Validate form data", status: "success", duration: "12ms" },
          { id: "t1-2-2", label: "Start Job: process_expense_report", status: "error", duration: "1.8s" },
          { id: "t1-2-3", label: "Update UI state", status: "success", duration: "<1ms" },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Right detail panel — mirrors Job detail panel from OR
// ---------------------------------------------------------------------------

function TraceNode({ entry, depth = 0 }: { entry: TraceEntry; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = entry.children && entry.children.length > 0;
  const StatusIcon =
    entry.status === "error"
      ? CircleAlert
      : entry.status === "success"
        ? CircleCheck
        : Circle;
  const statusColor =
    entry.status === "error"
      ? "text-destructive"
      : entry.status === "success"
        ? "text-(--color-success)"
        : "text-muted-foreground";

  return (
    <div>
      <button
        className="flex w-full items-center gap-1.5 rounded px-1 py-1 text-sm hover:bg-accent"
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
          )
        ) : (
          <span className="w-3 shrink-0" />
        )}
        <StatusIcon className={`h-3.5 w-3.5 shrink-0 ${statusColor}`} />
        <span className="flex-1 truncate text-left">{entry.label}</span>
        <span className="shrink-0 tabular-nums text-xs text-muted-foreground">
          {entry.duration}
        </span>
      </button>
      {expanded &&
        hasChildren &&
        entry.children!.map((child) => (
          <TraceNode key={child.id} entry={child} depth={depth + 1} />
        ))}
    </div>
  );
}

function AppRunDetailPanel({
  run,
  onClose,
}: {
  run: AppRun;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"details" | "trace" | "logs">(
    "trace"
  );

  const statusColor =
    run.status === "Faulted"
      ? "text-destructive"
      : run.status === "Running"
        ? "text-(--color-info)"
        : run.status === "Completed"
          ? "text-(--color-success)"
          : "text-muted-foreground";

  return (
    <div className="flex h-full flex-col border-l border-(--border-subtle) bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-(--border-subtle) px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate font-semibold text-sm">{run.app}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>View logs of this app session</DropdownMenuItem>
              <DropdownMenuItem>View logs of all runs for this app</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Show associated jobs</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Status line */}
      <div className="flex items-center gap-3 px-4 py-2">
        <span className={`flex items-center gap-1.5 text-sm font-medium ${statusColor}`}>
          <CircleAlert className="h-3.5 w-3.5" />
          {run.status}
        </span>
        {run.status === "Faulted" && (
          <button className="flex items-center gap-1 text-sm font-medium text-(--brand) hover:underline">
            Diagnose
            <Sparkles className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-(--border-subtle)">
        {(["details", "trace", "logs"] as const).map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm font-semibold capitalize ${
              activeTab === tab
                ? "border-b-2 border-(--brand) text-(--brand)"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "trace" ? "Trace" : tab === "details" ? "Details" : "Logs"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <ScrollArea className="flex-1">
        {activeTab === "trace" && (
          <div className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold">Execution Trace</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="rounded border border-(--border-subtle) p-2">
              {sampleTrace.map((entry) => (
                <TraceNode key={entry.id} entry={entry} />
              ))}
            </div>

            <Separator className="my-4" />

            {/* Session info with thumbs */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Circle className="h-3 w-3" />
                <span className="font-mono">
                  App Session a3f7c1d2-8e4b-4a12-b6d9-1e5f0a2c3b4d
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <ThumbsUp className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <ThumbsDown className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Metadata / Feedback tabs */}
            <div className="flex gap-4 border-b border-(--border-subtle) mb-3">
              <button className="border-b-2 border-(--brand) pb-2 text-sm font-semibold text-(--brand)">
                Metadata
              </button>
              <button className="pb-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
                Feedback
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span>{run.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="flex items-center gap-1">
                  <span className={`inline-block h-2 w-2 rounded-full ${
                    run.status === "Faulted" ? "bg-destructive" :
                    run.status === "Completed" ? "bg-(--color-success)" :
                    "bg-(--color-info)"
                  }`} />
                  {run.status === "Faulted" ? "Error" : run.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">User</span>
                <span>{run.user}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Folder</span>
                <span>{run.app}</span>
              </div>
              <button className="mt-2 flex w-full items-center justify-between text-muted-foreground hover:text-foreground">
                <span>Other attributes</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {activeTab === "details" && (
          <div className="p-4 text-sm">
            {/* Input section */}
            <button className="flex w-full items-center justify-between py-2">
              <span className="font-semibold">Input</span>
              <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <div className="mb-4 ml-1 flex items-start gap-2 text-xs">
              <span className="mt-0.5 shrink-0 rounded bg-muted px-1 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
                T:
              </span>
              <span className="text-muted-foreground">
                sessionId:{" "}
                <span className="text-foreground font-mono">
                  {run.sessionId}
                </span>
              </span>
            </div>

            <Separator className="mb-3" />

            {/* Output section */}
            <button className="flex w-full items-center justify-between py-2">
              <span className="font-semibold">Output</span>
            </button>
            <p className="mb-4 text-xs text-muted-foreground italic">No data</p>

            <Separator className="mb-3" />

            {/* Raw message (only for faulted) */}
            {run.status === "Faulted" && (
              <>
                <button className="flex w-full items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Raw message</span>
                    <span className="truncate text-xs text-muted-foreground max-w-[250px]">
                      Object reference not set to an instance of an object. in a...
                    </span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </button>
                <Separator className="mb-3" />
              </>
            )}

            {/* Runtime details */}
            <button className="flex w-full items-center justify-between py-2 mb-2">
              <span className="font-semibold">Runtime details</span>
            </button>
            <div className="space-y-2.5 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Start Time</span>
                <span>{run.started}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">End Time</span>
                <span>{run.ended || "—"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Duration</span>
                <span className="tabular-nums">{run.duration || "—"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Creation Time</span>
                <span>{run.creationTime}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Consumption</span>
                <span>N/A</span>
              </div>
            </div>

            <Separator className="mb-3" />

            {/* App environment */}
            <button className="flex w-full items-center justify-between py-2 mb-2">
              <span className="font-semibold">App environment</span>
            </button>
            <div className="space-y-2.5 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Package</span>
                <span className="text-right max-w-[220px] truncate font-mono">
                  {run.package}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">App Type</span>
                <span>{run.type}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">User</span>
                <span className="truncate max-w-[220px]">{run.user}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Folder</span>
                <span>{run.app}</span>
              </div>
            </div>

            <Separator className="mb-3" />

            {/* Session state history */}
            <button className="flex w-full items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Session state history</span>
                <span className="text-xs text-muted-foreground">
                  Last state: {run.status}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </button>
          </div>
        )}

        {activeTab === "logs" && (
          <div className="p-4 text-sm">
            <div className="space-y-1 font-mono text-xs">
              <div className="flex gap-3 rounded px-2 py-1 hover:bg-accent">
                <span className="shrink-0 text-muted-foreground">09:14:22.001</span>
                <span className="shrink-0 text-(--color-info)">INFO</span>
                <span>App session started</span>
              </div>
              <div className="flex gap-3 rounded px-2 py-1 hover:bg-accent">
                <span className="shrink-0 text-muted-foreground">09:14:22.120</span>
                <span className="shrink-0 text-(--color-info)">INFO</span>
                <span>Configuration loaded, bindings resolved</span>
              </div>
              <div className="flex gap-3 rounded px-2 py-1 hover:bg-accent">
                <span className="shrink-0 text-muted-foreground">09:14:22.450</span>
                <span className="shrink-0 text-(--color-info)">INFO</span>
                <span>onSubmit handler triggered</span>
              </div>
              <div className="flex gap-3 rounded px-2 py-1 hover:bg-accent">
                <span className="shrink-0 text-muted-foreground">09:14:22.462</span>
                <span className="shrink-0 text-(--color-info)">INFO</span>
                <span>Form data validated successfully</span>
              </div>
              <div className="flex gap-3 rounded px-2 py-1 hover:bg-accent">
                <span className="shrink-0 text-muted-foreground">09:14:23.100</span>
                <span className="shrink-0 text-(--color-warning)">WARN</span>
                <span>Start Job request timeout approaching (1.5s)</span>
              </div>
              <div className="flex gap-3 rounded px-2 py-1 bg-destructive/5 hover:bg-destructive/10">
                <span className="shrink-0 text-muted-foreground">09:14:24.301</span>
                <span className="shrink-0 text-destructive">ERROR</span>
                <span className="text-destructive">
                  Start Job failed: process_expense_report — RuntimeError: No available
                  robot to execute the job. Ensure machine is allocated to folder.
                </span>
              </div>
              <div className="flex gap-3 rounded px-2 py-1 hover:bg-accent">
                <span className="shrink-0 text-muted-foreground">09:14:24.723</span>
                <span className="shrink-0 text-(--color-info)">INFO</span>
                <span>App session ended with status: Faulted</span>
              </div>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// ---------------------------------------------------------------------------
// App detail panel — mirrors the Process detail panel from OR
// (click on app row → right side panel with Package Requirements / App Sessions / Logs)
// ---------------------------------------------------------------------------

function AppDetailPanel({
  app,
  onClose,
  onViewAllAppRuns,
}: {
  app: DeployedApp;
  onClose: () => void;
  onViewAllAppRuns: () => void;
}) {
  const [activeTab, setActiveTab] = useState<
    "package-requirements" | "app-sessions" | "logs"
  >("package-requirements");

  // Sample mini-grid app sessions for this specific app
  const appRuns = appRunData.filter((r) => r.app === app.name);

  return (
    <div className="flex h-full flex-col border-l border-(--border-subtle) bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-(--border-subtle) px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate font-semibold text-sm">{app.name}</span>
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onClose}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Package info */}
      <div className="px-4 py-2 text-xs text-muted-foreground truncate">
        Package: {app.name}.{app.type === "JS App" ? "jsApp" : "codedApp"}.
        {app.name}...
      </div>

      {/* Tabs */}
      <div className="flex border-b border-(--border-subtle)">
        {(
          [
            { key: "package-requirements", label: "Package Requirements" },
            { key: "app-sessions", label: "App Sessions" },
            { key: "logs", label: "Logs" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 text-sm font-semibold whitespace-nowrap ${
              activeTab === tab.key
                ? "border-b-2 border-(--brand) text-(--brand)"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <ScrollArea className="flex-1">
        {activeTab === "package-requirements" && (
          <div className="p-2">
            {/* Type filter */}
            <div className="flex items-center gap-2 px-2 py-1.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-2 text-sm font-normal text-muted-foreground"
                  >
                    Type:{" "}
                    <span className="font-medium text-foreground">All</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>All</DropdownMenuItem>
                  <DropdownMenuItem>Connection</DropdownMenuItem>
                  <DropdownMenuItem>Event</DropdownMenuItem>
                  <DropdownMenuItem>Queue</DropdownMenuItem>
                  <DropdownMenuItem>Asset</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Requirements grid */}
            <div className="overflow-auto rounded border border-(--border-subtle)">
              <table className="w-full text-sm">
                <thead className="bg-(--color-background-secondary)">
                  <tr className="border-b border-(--border-subtle)">
                    <th className="h-8 px-3 text-left text-xs font-medium text-muted-foreground">
                      Type
                    </th>
                    <th className="h-8 px-3 text-left text-xs font-medium text-muted-foreground">
                      Name
                    </th>
                    <th className="h-8 px-3 text-left text-xs font-medium text-muted-foreground">
                      Folder
                    </th>
                    <th className="h-8 px-3 text-left text-xs font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="h-8 w-8 px-1">
                      <RefreshCw className="h-3 w-3 text-muted-foreground" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-(--border-subtle) hover:bg-accent">
                    <td className="h-10 px-3 text-xs text-muted-foreground">
                      Connection
                    </td>
                    <td className="h-10 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">jira_connector</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                    <td className="h-10 px-3 text-xs text-muted-foreground">
                      N/A
                    </td>
                    <td className="h-10 px-3">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-(--color-success)" />
                    </td>
                    <td className="h-10 px-1" />
                  </tr>
                  <tr className="border-b border-(--border-subtle) hover:bg-accent">
                    <td className="h-10 px-3 text-xs text-muted-foreground">
                      Event
                    </td>
                    <td className="h-10 px-3 text-xs">
                      {app.name}
                    </td>
                    <td className="h-10 px-3 text-xs text-muted-foreground truncate">
                      /{app.name.substring(0, 12)}...
                    </td>
                    <td className="h-10 px-3">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-(--color-success)" />
                    </td>
                    <td className="h-10 px-1" />
                  </tr>
                  <tr className="hover:bg-accent">
                    <td className="h-10 px-3 text-xs text-muted-foreground">
                      Asset
                    </td>
                    <td className="h-10 px-3 text-xs">
                      api_key_config
                    </td>
                    <td className="h-10 px-3 text-xs text-muted-foreground">
                      N/A
                    </td>
                    <td className="h-10 px-3">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-(--color-warning)" />
                    </td>
                    <td className="h-10 px-1" />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "app-sessions" && (
          <div className="p-2">
            {/* Mini filter bar */}
            <div className="flex items-center gap-2 px-2 py-1.5">
              <SearchInput
                value=""
                onChange={() => {}}
                placeholder="Search"
                className="h-7 w-40 text-xs"
              />
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </Button>
              <div className="flex-1" />
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Mini grid */}
            <div className="overflow-auto rounded border border-(--border-subtle)">
              <table className="w-full text-sm">
                <thead className="bg-(--color-background-secondary)">
                  <tr className="border-b border-(--border-subtle)">
                    <th className="h-8 px-3 text-left text-xs font-medium text-muted-foreground">
                      <div className="flex items-center gap-1">
                        Status <ChevronDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="h-8 px-3 text-left text-xs font-medium text-muted-foreground">
                      <div className="flex items-center gap-1">
                        Started <ChevronDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="h-8 px-3 text-left text-xs font-medium text-muted-foreground">
                      <div className="flex items-center gap-1">
                        Ended <ChevronDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="h-8 px-3 text-left text-xs font-medium text-muted-foreground">
                      Duration
                    </th>
                    <th className="h-8 w-8 px-1" />
                  </tr>
                </thead>
                <tbody>
                  {appRuns.length > 0 ? (
                    appRuns.map((run) => (
                      <tr
                        key={run.id}
                        className="border-b border-(--border-subtle) last:border-0 hover:bg-accent"
                      >
                        <td className="h-10 px-3">
                          <StatusChip
                            variant={statusVariant[run.status]}
                            size="sm"
                          >
                            {run.status.substring(0, 4)}...
                          </StatusChip>
                        </td>
                        <td className="h-10 px-3 text-xs truncate max-w-[100px]">
                          {run.started}
                        </td>
                        <td className="h-10 px-3 text-xs truncate max-w-[100px]">
                          {run.ended || "—"}
                        </td>
                        <td className="h-10 px-3 text-xs tabular-nums">
                          {run.duration || "—"}
                        </td>
                        <td className="h-10 px-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View logs</DropdownMenuItem>
                              <DropdownMenuItem>
                                Show associated jobs
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="h-16 text-center text-xs text-muted-foreground"
                      >
                        No app sessions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mini pagination */}
            <div className="flex items-center justify-between px-2 py-1.5 text-xs text-muted-foreground">
              <span>
                1 - {appRuns.length} / {appRuns.length}
              </span>
              <span>Page 1 / 1</span>
              <span>Items 25</span>
            </div>
          </div>
        )}

        {activeTab === "logs" && (
          <div className="p-4 text-sm text-muted-foreground">
            <p>
              Aggregated logs for all runs of{" "}
              <span className="font-medium text-foreground">{app.name}</span>{" "}
              will appear here.
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Apps tab columns (defined as a function to receive callbacks)
// ---------------------------------------------------------------------------

function getAppsColumns(
  onViewAppRuns: () => void
): ColumnDef<DeployedApp, unknown>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      size: 220,
    },
    {
      accessorKey: "type",
      header: "Type",
      size: 120,
      cell: ({ row }) => {
        const type = row.getValue<string>("type");
        return (
          <StatusChip
            variant={type === "JS App" ? "info" : "default"}
            size="sm"
          >
            {type}
          </StatusChip>
        );
      },
    },
    {
      accessorKey: "version",
      header: "Version",
      size: 100,
      cell: ({ row }) => {
        const v = row.getValue<string>("version");
        return (
          <span className="flex items-center gap-1.5">
            <CircleCheck className="h-3.5 w-3.5 text-(--color-success)" />
            {v}
          </span>
        );
      },
    },
    {
      accessorKey: "url",
      header: "URL",
      size: 300,
      cell: ({ row }) => (
        <span className="truncate text-muted-foreground text-xs">
          {row.getValue("url")}
        </span>
      ),
    },
    {
      id: "app-actions",
      size: 70,
      cell: () => (
        <div className="flex items-center justify-end gap-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => e.stopPropagation()}
          >
            <Play className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit app</DropdownMenuItem>
              <DropdownMenuItem>View app requirements</DropdownMenuItem>
              <DropdownMenuItem>Custom user configurations</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View app logs</DropdownMenuItem>
              <DropdownMenuItem onClick={onViewAppRuns}>
                View app sessions
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                Upgrade to latest version
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" disabled>
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}

// ---------------------------------------------------------------------------
// App session columns — mirrors Jobs tab exactly
// ---------------------------------------------------------------------------

const statusVariant: Record<
  AppRun["status"],
  "success" | "error" | "info" | "warning" | "default"
> = {
  Completed: "success",
  Faulted: "error",
  Running: "info",
  Pending: "warning",
  Stopped: "default",
};

const appRunColumns: ColumnDef<AppRun, unknown>[] = [
  {
    accessorKey: "app",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="App" />
    ),
    size: 220,
  },
  {
    accessorKey: "type",
    header: "Type",
    size: 140,
    cell: ({ row }) => {
      const type = row.getValue<string>("type");
      return (
        <StatusChip
          variant={type === "JS App" ? "info" : "default"}
          size="sm"
        >
          {type}
        </StatusChip>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    size: 120,
    cell: ({ row }) => {
      const status = row.getValue<AppRun["status"]>("status");
      return (
        <StatusChip variant={statusVariant[status]} size="sm">
          {status}
        </StatusChip>
      );
    },
  },
  {
    accessorKey: "started",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Started" />
    ),
    size: 150,
  },
  {
    accessorKey: "ended",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ended" />
    ),
    size: 150,
    cell: ({ row }) => {
      const val = row.getValue<string>("ended");
      return val || <span className="text-muted-foreground">—</span>;
    },
  },
  {
    accessorKey: "duration",
    header: "Duration",
    size: 100,
    cell: ({ row }) => {
      const val = row.getValue<string>("duration");
      return val ? (
        <span className="tabular-nums">{val}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: "user",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User" />
    ),
    size: 200,
    cell: ({ row }) => (
      <span className="truncate">{row.getValue("user")}</span>
    ),
  },
  {
    id: "actions",
    size: 50,
    cell: ({ row }) => {
      const run = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled={run.status !== "Running"}>
              Disconnect session
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Show associated jobs</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View logs of this app session</DropdownMenuItem>
            <DropdownMenuItem>View logs of all runs for this app</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];

// ---------------------------------------------------------------------------
// OR-style visible columns config
// ---------------------------------------------------------------------------

interface VisibleColumn {
  key: string;
  label: string;
  visible: boolean;
  locked?: boolean; // locked columns can't be hidden (e.g. first column)
}

const defaultVisibleColumns: VisibleColumn[] = [
  { key: "app", label: "App", visible: true, locked: true },
  { key: "type", label: "Type", visible: true },
  { key: "status", label: "Status", visible: true },
  { key: "started", label: "Started", visible: true },
  { key: "ended", label: "Ended", visible: true },
  { key: "startedAbsolute", label: "Started (absolute)", visible: false },
  { key: "endedAbsolute", label: "Ended (absolute)", visible: false },
  { key: "duration", label: "Duration", visible: true },
  { key: "user", label: "User", visible: true },
];

// ---------------------------------------------------------------------------
// OR-style filter definitions
// ---------------------------------------------------------------------------

interface ORFilter {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  value: string;
}

const defaultFilters: ORFilter[] = [
  {
    key: "app",
    label: "App",
    options: [
      { value: "", label: "All" },
      { value: "expense-report-app", label: "expense-report-app" },
      { value: "inventory-tracker", label: "inventory-tracker" },
      { value: "onboarding-portal", label: "onboarding-portal" },
      { value: "ticket-management", label: "ticket-management" },
    ],
    value: "",
  },
  {
    key: "type",
    label: "Type",
    options: [
      { value: "", label: "All" },
      { value: "js-app", label: "JS App" },
      { value: "coded-app", label: "Coded App" },
    ],
    value: "",
  },
  {
    key: "status",
    label: "Status",
    options: [
      { value: "", label: "All" },
      { value: "completed", label: "Completed" },
      { value: "faulted", label: "Faulted" },
      { value: "running", label: "Running" },
      { value: "pending", label: "Pending" },
      { value: "stopped", label: "Stopped" },
    ],
    value: "",
  },
  {
    key: "user",
    label: "User",
    options: [
      { value: "", label: "All" },
      { value: "irina", label: "irina.capatina@uipath.com" },
      { value: "alex", label: "alex.szoke@uipath.com" },
      { value: "alex.roman", label: "alex.roman@uipath.com" },
    ],
    value: "",
  },
  {
    key: "creationTime",
    label: "Creation Time",
    options: [
      { value: "", label: "All" },
      { value: "1h", label: "Last hour" },
      { value: "24h", label: "Last 24 hours" },
      { value: "7d", label: "Last 7 days" },
      { value: "30d", label: "Last 30 days" },
    ],
    value: "",
  },
];

// ---------------------------------------------------------------------------
// OR-style Column Visibility Popover
// ---------------------------------------------------------------------------

function ColumnVisibilityPopover({
  columns,
  onChange,
}: {
  columns: VisibleColumn[];
  onChange: (columns: VisibleColumn[]) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2">
          <LayoutGrid className="h-4 w-4" />
          <ChevronDown className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <div className="flex items-center justify-between border-b border-(--border-subtle) px-3 py-2">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Visible Columns</span>
          </div>
          <button
            className="text-sm font-medium text-(--brand) hover:underline"
            onClick={() =>
              onChange(defaultVisibleColumns.map((c) => ({ ...c })))
            }
          >
            Reset
          </button>
        </div>
        <div className="py-1">
          {columns.map((col) => (
            <label
              key={col.key}
              className={`flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent cursor-pointer ${
                col.locked
                  ? "bg-(--color-background-secondary) text-muted-foreground"
                  : ""
              }`}
            >
              <Checkbox
                checked={col.visible}
                disabled={col.locked}
                onCheckedChange={(checked) => {
                  if (col.locked) return;
                  onChange(
                    columns.map((c) =>
                      c.key === col.key ? { ...c, visible: !!checked } : c
                    )
                  );
                }}
              />
              {col.label}
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ---------------------------------------------------------------------------
// OR-style Filter Bar
// ---------------------------------------------------------------------------

function ORFilterBar({
  search,
  onSearchChange,
  filtersExpanded,
  onToggleFilters,
  filters,
  onFilterChange,
  onResetFilters,
  columns,
  onColumnsChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  filtersExpanded: boolean;
  onToggleFilters: () => void;
  filters: ORFilter[];
  onFilterChange: (key: string, value: string) => void;
  onResetFilters: () => void;
  columns: VisibleColumn[];
  onColumnsChange: (columns: VisibleColumn[]) => void;
}) {
  const hasActiveFilters = filters.some((f) => f.value !== "");

  return (
    <div className="flex flex-col gap-0">
      {/* Top row: search, column toggle, filter toggle, reset, actions */}
      <div className="flex h-10 items-center gap-2">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Search"
          className="h-8 w-56"
        />

        <ColumnVisibilityPopover
          columns={columns}
          onChange={onColumnsChange}
        />

        <Separator orientation="vertical" className="mx-0.5 h-5" />

        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2"
          onClick={onToggleFilters}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {filtersExpanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </Button>

        {hasActiveFilters && (
          <>
            <Separator orientation="vertical" className="mx-0.5 h-5" />
            <button
              className="flex items-center gap-1.5 text-sm font-medium text-(--brand) hover:underline"
              onClick={onResetFilters}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset to defaults
            </button>
          </>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right actions */}
        <Button variant="outline" size="sm" className="h-8 gap-1.5">
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
        <Button size="sm" className="h-8 gap-1.5">
          <Play className="h-3.5 w-3.5" />
          Start
        </Button>
      </div>

      {/* Expanded filter row */}
      {filtersExpanded && (
        <div className="flex flex-wrap items-center gap-1 pb-2 pt-1">
          {filters.map((filter) => (
            <DropdownMenu key={filter.key}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 px-2 text-sm font-normal text-muted-foreground"
                >
                  <span>
                    {filter.label}:{" "}
                    <span className="font-medium text-foreground">
                      {filter.value
                        ? filter.options.find((o) => o.value === filter.value)
                            ?.label
                        : "All"}
                    </span>
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {filter.options.map((opt) => (
                  <DropdownMenuItem
                    key={opt.value}
                    onClick={() => onFilterChange(filter.key, opt.value)}
                    className={
                      filter.value === opt.value ? "font-medium" : ""
                    }
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// OR top-level navigation bar
// ---------------------------------------------------------------------------

const orNavItems = [
  { value: "home", label: "Home" },
  { value: "automations", label: "Automations", active: true },
  { value: "monitoring", label: "Monitoring" },
  { value: "queues", label: "Queues" },
  { value: "assets", label: "Assets" },
  { value: "connections", label: "Connections" },
  { value: "business-rules", label: "Business Rules", badge: "Preview" },
  { value: "storage-buckets", label: "Storage Buckets" },
  { value: "indexes", label: "Indexes" },
  { value: "mcp-servers", label: "MCP Servers" },
];

function ORNavBar() {
  return (
    <div className="flex h-10 items-center border-b border-(--border-subtle) px-2 gap-0">
      {/* Left: back arrow + Tenant */}
      <div className="flex items-center gap-1 shrink-0 pr-3 border-r border-(--border-subtle) mr-1">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Tenant</span>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Search className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Navigation items with back arrow */}
      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-0 overflow-x-auto">
        {orNavItems.map((item) => (
          <button
            key={item.value}
            className={`shrink-0 px-3 py-2 text-sm font-medium whitespace-nowrap ${
              item.active
                ? "text-(--brand) border-b-[3px] border-(--brand)"
                : "text-foreground hover:bg-(--surface-hover) rounded-t-[3px]"
            }`}
          >
            {item.label}
            {item.badge && (
              <span className="ml-1.5 inline-flex items-center rounded-sm border border-(--border-subtle) px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Right scroll indicator */}
      <div className="shrink-0 ml-auto pl-1">
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tabs config
// ---------------------------------------------------------------------------

const automationTabs = [
  { value: "processes", label: "Processes" },
  { value: "jobs", label: "Jobs" },
  { value: "apps", label: "Apps" },
  { value: "app-sessions", label: "App Sessions" },
  { value: "triggers", label: "Triggers" },
  { value: "logs", label: "Logs" },
];

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function AppsTroubleshootHomePage() {
  const [search, setSearch] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(
    defaultVisibleColumns.map((c) => ({ ...c }))
  );
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [filters, setFilters] = useState(
    defaultFilters.map((f) => ({ ...f }))
  );
  const [selectedRun, setSelectedRun] = useState<AppRun | null>(null);
  const [selectedApp, setSelectedApp] = useState<DeployedApp | null>(null);
  const [activeMainTab, setActiveMainTab] = useState("app-sessions");

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) =>
      prev.map((f) => (f.key === key ? { ...f, value } : f))
    );
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters.map((f) => ({ ...f })));
  };

  // Filter app session data based on active filters
  const filteredAppRunData = appRunData.filter((run) => {
    const appFilter = filters.find((f) => f.key === "app");
    if (appFilter?.value && run.app !== appFilter.value) return false;

    const typeFilter = filters.find((f) => f.key === "type");
    if (typeFilter?.value) {
      const match =
        typeFilter.value === "js-app"
          ? run.type === "JS App"
          : run.type === "Coded App";
      if (!match) return false;
    }

    const statusFilter = filters.find((f) => f.key === "status");
    if (statusFilter?.value && run.status.toLowerCase() !== statusFilter.value)
      return false;

    const userFilter = filters.find((f) => f.key === "user");
    if (userFilter?.value && !run.user.startsWith(userFilter.value))
      return false;

    if (search) {
      const q = search.toLowerCase();
      if (
        !run.app.toLowerCase().includes(q) &&
        !run.user.toLowerCase().includes(q) &&
        !run.type.toLowerCase().includes(q)
      )
        return false;
    }

    return true;
  });

  // Navigate from Apps tab → App Sessions tab (mirrors Process → View Jobs)
  const handleViewAppRuns = () => {
    setActiveMainTab("app-sessions");
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Row 1: AppHeader (logo, product name, search, autopilot, notifications, help, tenant, avatar) */}
      <AppHeader
        productName="Orchestrator"
        userInitials="IC"
        tenantName="Tenant"
        notificationDot
        multiTenant={false}
      />

      {/* Row 2: OR top-level navigation (Home | Automations | Monitoring | ...) */}
      <ORNavBar />

      {/* Row 3: Content area with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left folder sidebar */}
        <SidebarNav side="left" resizable collapsible>
          {(props) => <FolderSidebar collapsed={props.collapsed} />}
        </SidebarNav>

        {/* Main content + right panel */}
        <main className="flex-1 overflow-auto p-6">
          <div className="flex h-full">
        {/* Main content area */}
        <div className={`flex-1 overflow-auto ${selectedRun ? "min-w-0" : ""}`}>
          <TabsNav
            variant="primary"
            tabs={automationTabs}
            value={activeMainTab}
            onValueChange={(v) => {
              setActiveMainTab(v);
              setSelectedRun(null);
              setSelectedApp(null);
            }}
          >
            <TabsContent value="processes" className="mt-0 pt-4">
              <p className="text-muted-foreground">
                Processes content goes here. JS Apps and Coded Apps do not have
                associated processes.
              </p>
            </TabsContent>
            <TabsContent value="jobs" className="mt-0 pt-4">
              <p className="text-muted-foreground">
                Jobs content goes here. This tab shows jobs triggered by RPA
                processes.
              </p>
            </TabsContent>
            <TabsContent value="apps" className="mt-0 pt-4">
              <DataGrid
                columns={getAppsColumns(handleViewAppRuns)}
                data={deployedApps}
                selectable
                resizableColumns
                pageSize={25}
                onRowClick={(app) => setSelectedApp(app)}
                activeRowIndex={selectedApp ? deployedApps.indexOf(selectedApp) : undefined}
                filterBarSlot={
                  <div className="flex h-10 items-center gap-2">
                    <SearchInput
                      value=""
                      onChange={() => {}}
                      placeholder="Search"
                      className="h-8 w-56"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 px-2"
                    >
                      <LayoutGrid className="h-4 w-4" />
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                    <Separator
                      orientation="vertical"
                      className="mx-0.5 h-5"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 px-2"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                    <div className="flex-1" />
                    <Button size="sm" className="h-9 gap-1.5 px-4 text-sm font-semibold">
                      + Deploy app
                    </Button>
                  </div>
                }
              />
            </TabsContent>
            <TabsContent value="app-sessions" className="mt-0 pt-4">
              <DataGrid
                columns={appRunColumns}
                data={filteredAppRunData}
                selectable
                resizableColumns
                pageSize={25}
                onRowClick={(run) => setSelectedRun(run)}
                activeRowIndex={selectedRun ? filteredAppRunData.indexOf(selectedRun) : undefined}
                filterBarSlot={
                  <ORFilterBar
                    search={search}
                    onSearchChange={setSearch}
                    filtersExpanded={filtersExpanded}
                    onToggleFilters={() => setFiltersExpanded(!filtersExpanded)}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onResetFilters={handleResetFilters}
                    columns={visibleColumns}
                    onColumnsChange={setVisibleColumns}
                  />
                }
              />
            </TabsContent>
            <TabsContent value="triggers" className="mt-0 pt-4">
              <p className="text-muted-foreground">
                Triggers content goes here.
              </p>
            </TabsContent>
            <TabsContent value="logs" className="mt-0 pt-4">
              <p className="text-muted-foreground">Logs content goes here.</p>
            </TabsContent>
          </TabsNav>
        </div>

        {/* Right detail panel — appears when clicking a row */}
        {selectedRun && (
          <div className="w-[480px] shrink-0">
            <AppRunDetailPanel
              run={selectedRun}
              onClose={() => setSelectedRun(null)}
            />
          </div>
        )}
        {selectedApp && !selectedRun && (
          <div className="w-[480px] shrink-0">
            <AppDetailPanel
              app={selectedApp}
              onClose={() => setSelectedApp(null)}
              onViewAllAppRuns={handleViewAppRuns}
            />
          </div>
        )}
          </div>
        </main>
      </div>
    </div>
  );
}
