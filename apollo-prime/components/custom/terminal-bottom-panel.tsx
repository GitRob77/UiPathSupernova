"use client";

import { useState, useRef, useCallback, useEffect, type KeyboardEvent } from "react";
import { cn } from "@uipath/apollo-wind";
import { ScrollArea } from "@uipath/apollo-wind/components/ui/scroll-area";
import { Button } from "@uipath/apollo-wind/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@uipath/apollo-wind/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@uipath/apollo-wind/components/ui/tooltip";
import {
  Terminal,
  Plus,
  X,
  Trash2,
  Columns2,
  Ellipsis,
  ChevronDown,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type LineType = "command" | "output" | "error" | "info" | "system" | "diff-remove" | "diff-add" | "diff-header";

interface TerminalLine {
  id: string;
  type: LineType;
  content: string;
}

interface TerminalSession {
  id: string;
  label: string;
  lines: TerminalLine[];
  /** ID of the session this is split with (same group) */
  splitGroupId: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

let lineIdCounter = 100;
function nextId() {
  return `line-${++lineIdCounter}`;
}

function simulateCommand(cmd: string): TerminalLine[] {
  const trimmed = cmd.trim().toLowerCase();
  if (!trimmed) return [];

  if (trimmed === "help") {
    return [{ id: nextId(), type: "info", content: "Available commands: help, clear, version, build, test, deploy, ls, date, echo <text>" }];
  }
  if (trimmed === "version") {
    return [
      { id: nextId(), type: "output", content: "UiPath Studio Web v2026.4.1-preview" },
      { id: nextId(), type: "output", content: "Runtime: .NET 8.0.12  |  Node: 22.4.0" },
    ];
  }
  if (trimmed === "build") {
    return [
      { id: nextId(), type: "system", content: "Starting build..." },
      { id: nextId(), type: "output", content: "  Restoring packages..." },
      { id: nextId(), type: "output", content: "  Compiling Solution5.Agent (1.0.0) -> bin/Release/net8.0/Agent.dll" },
      { id: nextId(), type: "output", content: "  Compiling Solution5.APIWorkflow (1.0.0) -> bin/Release/net8.0/APIWorkflow.dll" },
      { id: nextId(), type: "info", content: "Build succeeded. 0 errors, 0 warnings. (2.4s)" },
    ];
  }
  if (trimmed === "test") {
    return [
      { id: nextId(), type: "system", content: "Running test suite..." },
      { id: nextId(), type: "output", content: "  PASS  Agent.Tests.ActivityTests (12 tests, 0.8s)" },
      { id: nextId(), type: "output", content: "  PASS  APIWorkflow.Tests.EndpointTests (8 tests, 1.2s)" },
      { id: nextId(), type: "error", content: "  FAIL  App.Tests.FormValidationTest - Expected: true, Actual: false" },
      { id: nextId(), type: "info", content: "Tests: 2 passed, 1 failed. Total: 21 tests. (3.1s)" },
    ];
  }
  if (trimmed === "deploy") {
    return [
      { id: nextId(), type: "system", content: "Deploying to Orchestrator..." },
      { id: nextId(), type: "output", content: "  Packaging Solution5 v1.0.3..." },
      { id: nextId(), type: "output", content: "  Uploading to https://cloud.uipath.com/org/tenant/..." },
      { id: nextId(), type: "info", content: "Deployment complete. Package published to feed: Production." },
    ];
  }
  if (trimmed === "ls") {
    return [
      { id: nextId(), type: "output", content: "  Agent/          APIWorkflow/      App/              RPA-Workflow/" },
      { id: nextId(), type: "output", content: "  solution.json   README.md         .gitignore        package.json" },
    ];
  }
  if (trimmed === "date") {
    return [{ id: nextId(), type: "output", content: new Date().toLocaleString() }];
  }
  if (trimmed.startsWith("echo ")) {
    return [{ id: nextId(), type: "output", content: cmd.trim().slice(5) }];
  }
  return [{ id: nextId(), type: "error", content: `'${cmd.trim()}' is not recognized as a command. Type 'help' for available commands.` }];
}

const INITIAL_LINES: Omit<TerminalLine, "id">[] = [
  // System — muted italic (#999)
  { type: "system", content: "Last login: Mon Apr 21 09:14:32 on ttys001" },
  { type: "system", content: "Node v22.4.0  |  npm 10.8.1  |  ~/Projects/Solution5" },
  { type: "system", content: "Welcome to UiPath Studio Web Terminal. Type 'help' for available commands." },
  { type: "output", content: "" },

  // Command — dark blue (#00489D) with light grey chevron
  { type: "command", content: "echo \"This is a command line (user input) — dark blue with ❯ prompt\"" },
  // Regular output — default foreground
  { type: "output", content: "This is a command line (user input) — dark blue with ❯ prompt" },
  { type: "output", content: "" },

  // Info/Success — green (#1A7F37)
  { type: "command", content: "echo-status success" },
  { type: "info", content: "✓ Operation completed successfully" },
  { type: "info", content: "✓ All 12 packages restored in 2.1s" },
  { type: "info", content: "✓ Build succeeded — 0 errors, 0 warnings" },
  { type: "output", content: "" },

  // Error — red (#D1242F)
  { type: "command", content: "echo-status error" },
  { type: "error", content: "✕ Error: Cannot find module 'smtp-client'" },
  { type: "error", content: "  at Module._resolveFilename (node:internal/modules/cjs/loader:1075:15)" },
  { type: "error", content: "  at Object.<anonymous> (src/agent/email-handler.ts:1:24)" },
  { type: "error", content: "✕ Process exited with code 1" },
  { type: "output", content: "" },

  // Command — dark blue prompt + text
  { type: "command", content: "git status" },
  // Regular output — default foreground
  { type: "output", content: "On branch feature/agent-notifications" },
  { type: "output", content: "Changes not staged for commit:" },
  { type: "output", content: '  modified:   Agent/Skills/ExtractInvoice.xaml' },
  { type: "output", content: '  modified:   Agent/EmailHandler.xaml' },
  { type: "output", content: "" },
  // Success/info — green
  { type: "info", content: 'hint: use "git add" to update what will be committed' },
  { type: "output", content: "" },

  // Command
  { type: "command", content: "npm run build" },
  { type: "output", content: "" },
  { type: "system", content: "> solution5@1.0.3 build" },
  { type: "system", content: "> tsc && vite build" },
  { type: "output", content: "" },
  { type: "output", content: "vite v5.4.2 building for production..." },
  { type: "output", content: "transforming (142) src/modules/agent/index.ts" },
  { type: "info", content: "✓ 238 modules transformed." },
  { type: "output", content: "dist/agent.js          45.2 kB │ gzip: 12.8 kB" },
  { type: "output", content: "dist/api-workflow.js   32.1 kB │ gzip:  9.4 kB" },
  { type: "output", content: "dist/vendor.js        128.6 kB │ gzip: 41.3 kB" },
  { type: "info", content: "✓ built in 3.42s" },
  { type: "output", content: "" },

  // Command
  { type: "command", content: "npm test" },
  { type: "output", content: "" },
  // Success — green
  { type: "info", content: " PASS  src/agent/__tests__/extract-invoice.test.ts (1.2s)" },
  { type: "output", content: "  ExtractInvoice" },
  { type: "info", content: "    ✓ should extract vendor name (45ms)" },
  { type: "info", content: "    ✓ should extract line items (112ms)" },
  { type: "info", content: "    ✓ should handle missing fields gracefully (23ms)" },
  { type: "output", content: "" },
  { type: "info", content: " PASS  src/api-workflow/__tests__/process-order.test.ts (0.8s)" },
  { type: "output", content: "  ProcessOrder" },
  { type: "info", content: "    ✓ should validate input schema (18ms)" },
  { type: "info", content: "    ✓ should route to approval queue (67ms)" },
  { type: "output", content: "" },
  // Errors — red
  { type: "error", content: " FAIL  src/agent/__tests__/email-handler.test.ts (2.1s)" },
  { type: "error", content: "  EmailHandler" },
  { type: "error", content: "    ✕ should retry on SMTP timeout (340ms)" },
  { type: "error", content: "" },
  { type: "error", content: "    Expected: 3 retries" },
  { type: "error", content: "    Received: 0 retries" },
  { type: "error", content: "" },
  { type: "error", content: "      at Object.<anonymous> (src/agent/__tests__/email-handler.test.ts:42:18)" },
  { type: "output", content: "" },
  { type: "output", content: "Test Suites: 1 failed, 2 passed, 3 total" },
  { type: "output", content: "Tests:       1 failed, 5 passed, 6 total" },
  { type: "output", content: "Time:        4.12s" },
  { type: "output", content: "" },

  // Command — code output
  { type: "command", content: "cat src/agent/email-handler.ts" },
  { type: "output", content: 'import { SmtpClient } from "../lib/smtp";' },
  { type: "output", content: 'import { Logger } from "../lib/logger";' },
  { type: "output", content: "" },
  { type: "output", content: "export class EmailHandler {" },
  { type: "output", content: "  private smtp: SmtpClient;" },
  { type: "output", content: "  private logger: Logger;" },
  { type: "output", content: "  private maxRetries = 3;" },
  { type: "output", content: "" },
  { type: "output", content: "  constructor(smtp: SmtpClient, logger: Logger) {" },
  { type: "output", content: "    this.smtp = smtp;" },
  { type: "output", content: "    this.logger = logger;" },
  { type: "output", content: "  }" },
  { type: "output", content: "" },
  { type: "output", content: "  async send(to: string, subject: string, body: string) {" },
  { type: "output", content: "    // TODO: implement retry logic" },
  { type: "output", content: "    return this.smtp.sendMail({ to, subject, body });" },
  { type: "output", content: "  }" },
  { type: "output", content: "}" },
  { type: "output", content: "" },

  // Command — patch / diff output
  { type: "command", content: "uipath package update UiPath.System.Activities" },
  { type: "output", content: "" },
  { type: "diff-header", content: "● Update(project.json)" },
  { type: "output", content: '  └ Added 1 line, removed 1 line' },
  { type: "output", content: '    6   "dependencies": {' },
  { type: "output", content: '    7     "UiPath.Excel.Activities": "3.4.1",' },
  { type: "output", content: '    8     "UiPath.IntegrationService.Activities": "1.25.0-alpha.20260417.7",' },
  { type: "diff-remove", content: '    9 -   "UiPath.System.Activities": "[26.2.4]",' },
  { type: "diff-add", content: '    9 +   "UiPath.System.Activities": "[25.10.2]",' },
  { type: "output", content: '   10     "UiPath.Testing.Activities": "[25.10.2]",' },
  { type: "output", content: "" },
  { type: "info", content: "✓ Package updated successfully." },
  { type: "output", content: "" },

  // Info summary
  { type: "info", content: "Build succeeded. Deploy ready. 1 test failure needs attention." },
];

function createSession(id: string, label: string, splitGroupId?: string): TerminalSession {
  return {
    id,
    label,
    splitGroupId: splitGroupId ?? id,
    lines: INITIAL_LINES.map((l, i) => ({ ...l, id: `${id}-init-${i}` })),
  };
}

/* ------------------------------------------------------------------ */
/*  TerminalPane — single terminal pane (used in split view)           */
/* ------------------------------------------------------------------ */

function TerminalPane({
  session,
  isActive,
  onFocus,
  onExecute,
  onClose,
  showClose,
}: {
  session: TerminalSession;
  isActive: boolean;
  onFocus: () => void;
  onExecute: (sessionId: string, cmd: string) => void;
  onClose?: () => void;
  showClose: boolean;
}) {
  const [inputValue, setInputValue] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = scrollRef.current?.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement | null;
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [session.lines]);

  useEffect(() => {
    if (isActive) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isActive]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const cmd = inputValue;
        if (!cmd.trim()) return;
        setCommandHistory((prev) => [...prev, cmd]);
        setHistoryIndex(-1);
        setInputValue("");
        onExecute(session.id, cmd);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (commandHistory.length === 0) return;
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[newIndex]);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIndex === -1) return;
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInputValue("");
        } else {
          setHistoryIndex(newIndex);
          setInputValue(commandHistory[newIndex]);
        }
      }
    },
    [inputValue, commandHistory, historyIndex, onExecute, session.id]
  );

  return (
    <div
      className={cn(
        "flex flex-1 flex-col overflow-hidden",
        isActive && "ring-1 ring-(--brand) ring-inset rounded-sm"
      )}
      onClick={() => {
        onFocus();
        inputRef.current?.focus();
      }}
    >
      {/* Pane header with label + close */}
      {showClose && (
        <div className="flex h-6 shrink-0 items-center justify-between bg-[var(--color-background-secondary)] px-2">
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Terminal className="size-3" />
            {session.label}
          </span>
          {onClose && (
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="flex size-4 items-center justify-center rounded-[3px] text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground [div:hover>&]:opacity-100"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      )}
      <div
        className="flex flex-1 flex-col overflow-hidden bg-[var(--color-background-secondary)] font-code text-[14px]"
      >
        <ScrollArea ref={scrollRef} className="flex-1">
          <div className="px-3 pt-2 pb-1">
            {session.lines.map((line) => (
              <div key={line.id} className="leading-5">
                {line.type === "command" ? (
                  <div>
                    <span style={{ color: "#888", marginRight: 6 }}>{"❯"}</span>
                    <span style={{ color: "#00489D" }}>{line.content}</span>
                  </div>
                ) : line.type === "diff-remove" ? (
                  <div className="-mx-3 px-3 py-[4px]" style={{ backgroundColor: "#FFECEC", color: "#B31D28" }}>
                    {line.content}
                  </div>
                ) : line.type === "diff-add" ? (
                  <div className="-mx-3 px-3 py-[4px]" style={{ backgroundColor: "#E6FFEC", color: "#22863A" }}>
                    {line.content}
                  </div>
                ) : line.type === "diff-header" ? (
                  <div style={{ color: "#6F42C1", fontWeight: 600 }}>
                    {line.content}
                  </div>
                ) : line.type === "error" ? (
                  <div style={{ color: "#D1242F" }}>
                    {line.content}
                  </div>
                ) : line.type === "info" ? (
                  <div style={{ color: "#1A7F37" }}>
                    {line.content}
                  </div>
                ) : line.type === "system" ? (
                  <div style={{ color: "#999", fontStyle: "italic" }}>
                    {line.content}
                  </div>
                ) : (
                  <div>
                    {line.content}
                  </div>
                )}
              </div>
            ))}
            <div className="flex items-center leading-5">
              <span style={{ color: "#888", marginRight: 6 }}>{"❯"}</span>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ color: "#00489D", caretColor: "#00489D" }}
                className="flex-1 bg-transparent font-code outline-none"
                spellCheck={false}
                autoComplete="off"
              />
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export interface TerminalBottomPanelProps {
  open: boolean;
  className?: string;
}

const MIN_HEIGHT = 120;
const MAX_HEIGHT = 500;
const DEFAULT_HEIGHT = 240;

export function TerminalBottomPanel({ open, className }: TerminalBottomPanelProps) {
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [isResizing, setIsResizing] = useState(false);
  const isResizingRef = useRef(false);

  /* --- Terminal sessions --- */
  const sessionCounter = useRef(1);
  const [sessions, setSessions] = useState<TerminalSession[]>([
    createSession("term-1", "bash"),
  ]);
  const [activeSessionId, setActiveSessionId] = useState("term-1");

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  /* Get sessions in the same split group as the active session */
  const activeSplitGroup = activeSession
    ? sessions.filter((s) => s.splitGroupId === activeSession.splitGroupId)
    : [];
  const isSplit = activeSplitGroup.length > 1;

  /* --- Vertical resize --- */
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isResizingRef.current = true;
      setIsResizing(true);
      const startY = e.clientY;
      const startHeight = height;

      const onMouseMove = (ev: MouseEvent) => {
        const delta = startY - ev.clientY;
        setHeight(Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startHeight + delta)));
      };

      const onMouseUp = () => {
        isResizingRef.current = false;
        setIsResizing(false);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor = "ns-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [height]
  );

  /* --- Command execution --- */
  const executeCommand = useCallback(
    (sessionId: string, cmd: string) => {
      if (cmd.trim().toLowerCase() === "clear") {
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? { ...s, lines: [] } : s))
        );
        return;
      }

      const commandLine: TerminalLine = { id: nextId(), type: "command", content: cmd };
      const outputLines = simulateCommand(cmd);

      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, lines: [...s.lines, commandLine, ...outputLines] }
            : s
        )
      );
    },
    []
  );

  /* --- Session management --- */
  const addSession = useCallback(() => {
    sessionCounter.current += 1;
    const id = `term-${sessionCounter.current}`;
    const label = `bash ${sessionCounter.current}`;
    setSessions((prev) => [...prev, createSession(id, label)]);
    setActiveSessionId(id);
  }, []);

  const splitSession = useCallback(() => {
    if (!activeSession) return;
    sessionCounter.current += 1;
    const id = `term-${sessionCounter.current}`;
    const label = `bash ${sessionCounter.current}`;
    const groupId = activeSession.splitGroupId;
    setSessions((prev) => [...prev, createSession(id, label, groupId)]);
    setActiveSessionId(id);
  }, [activeSession]);

  const closeSession = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const target = prev.find((s) => s.id === id);
        if (!target) return prev;
        const next = prev.filter((s) => s.id !== id);
        if (next.length === 0) return prev; // keep at least one
        if (activeSessionId === id) {
          // Prefer staying in the same split group
          const sameGroup = next.filter((s) => s.splitGroupId === target.splitGroupId);
          const newActive = sameGroup[0]?.id ?? next[next.length - 1]?.id;
          setActiveSessionId(newActive);
        }
        return next;
      });
    },
    [activeSessionId]
  );

  /* Unique split groups for the session list sidebar */
  const splitGroups = sessions.reduce<Record<string, TerminalSession[]>>((acc, s) => {
    if (!acc[s.splitGroupId]) acc[s.splitGroupId] = [];
    acc[s.splitGroupId].push(s);
    return acc;
  }, {});
  const groupIds = Object.keys(splitGroups);

  return (
    <div
      className={cn(
        "relative flex shrink-0 flex-col transition-[height] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        className
      )}
      style={{ height: open ? height : 0 }}
    >
      {/* Top resize handle — absolute so 8px hit zone isn't clipped by overflow */}
      {open && (
        <div className="group/edge pointer-events-none absolute inset-x-0 top-0 z-10 h-px">
          <div
            className={cn(
              "bottom-panel-top-edge absolute inset-0 transition-colors",
              isResizing
                ? "bg-(--primary)"
                : "bg-(--border-subtle) group-hover/edge:bg-(--primary)"
            )}
          />
          <div
            onMouseDown={handleResizeStart}
            className="pointer-events-auto absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 cursor-ns-resize"
          />
        </div>
      )}

      {/* Panel container */}
      <div className="flex flex-1 overflow-hidden bg-white">
        <div className="relative flex flex-1 flex-col overflow-hidden bg-white">
          {/* Header bar — styled like debug panel tab header */}
          <div className="flex h-[30px] shrink-0 items-center border-b border-(--border-subtle) pt-1 pl-1 pr-2">
            <div className="flex h-full items-center border-b-2 border-transparent px-2 py-0.5 text-[13px] font-semibold text-(--foreground)">
              Terminal
            </div>
            <div className="flex-1" />
            <TooltipProvider delayDuration={400}>
              <div className="flex items-center gap-0.5">
                {/* Session selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex h-6 cursor-pointer items-center gap-1 rounded-[3px] px-1.5 text-[12px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                      <Terminal className="size-3.5" />
                      <span>{activeSession?.label ?? "bash"}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    {sessions.map((s) => (
                      <DropdownMenuItem key={s.id} onClick={() => setActiveSessionId(s.id)}>
                        <Terminal className="mr-2 size-3.5" />
                        {s.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* New terminal */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-[3px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      onClick={addSession}
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>New Terminal</TooltipContent>
                </Tooltip>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex h-6 w-3.5 cursor-pointer items-center justify-center rounded-[3px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                      <ChevronDown className="size-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={addSession}>New Terminal</DropdownMenuItem>
                    <DropdownMenuItem onClick={splitSession}>Split Terminal</DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1 h-px bg-(--border-subtle)" />
                    <DropdownMenuItem>GitHub Copilot CLI</DropdownMenuItem>
                    <DropdownMenuItem onClick={addSession}>bash</DropdownMenuItem>
                    <DropdownMenuItem onClick={addSession}>zsh</DropdownMenuItem>
                    <DropdownMenuItem>JavaScript Debug Terminal</DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1 h-px bg-(--border-subtle)" />
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Split Terminal with Profile</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="w-52">
                        <DropdownMenuItem>GitHub Copilot CLI</DropdownMenuItem>
                        <DropdownMenuItem onClick={splitSession}>bash</DropdownMenuItem>
                        <DropdownMenuItem onClick={splitSession}>zsh</DropdownMenuItem>
                        <DropdownMenuItem>JavaScript Debug Terminal</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator className="my-1 h-px bg-(--border-subtle)" />
                    <DropdownMenuItem>Configure Terminal Settings</DropdownMenuItem>
                    <DropdownMenuItem>Select Default Profile</DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1 h-px bg-(--border-subtle)" />
                    <DropdownMenuItem>Run Task...</DropdownMenuItem>
                    <DropdownMenuItem>Configure Tasks...</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Split terminal */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-[3px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      onClick={splitSession}
                    >
                      <Columns2 className="size-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Split Terminal</TooltipContent>
                </Tooltip>

                {/* Kill terminal */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-[3px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      onClick={() => closeSession(activeSessionId)}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Kill Terminal</TooltipContent>
                </Tooltip>

                {/* More options */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-[3px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                      <Ellipsis className="size-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => executeCommand(activeSessionId, "clear")}>Clear</DropdownMenuItem>
                    <DropdownMenuItem>Copy all</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TooltipProvider>
          </div>

          {/* Terminal body */}
          <div className="flex flex-1 overflow-hidden mt-1 px-1 pb-1">
            {/* Session list sidebar (only when >1 group or any group has splits) */}
            {(groupIds.length > 1 || sessions.length > 1) && (
              <div className="flex w-36 shrink-0 flex-col bg-(--surface-level-0) mr-1">
                {groupIds.map((groupId) => {
                  const group = splitGroups[groupId];
                  const isActiveGroup = activeSession?.splitGroupId === groupId;
                  return (
                    <div key={groupId}>
                      {group.map((session, idx) => (
                        <div
                          key={session.id}
                          onClick={() => setActiveSessionId(session.id)}
                          className={cn(
                            "group/session flex h-7 cursor-pointer items-center gap-2 transition-colors",
                            idx > 0 ? "pl-6 pr-2" : "px-2",
                            session.id === activeSessionId
                              ? "bg-[var(--color-background-selected)] text-foreground"
                              : isActiveGroup && idx > 0
                                ? "text-muted-foreground hover:bg-(--surface-hover)"
                                : "text-muted-foreground hover:bg-(--surface-hover)"
                          )}
                        >
                          {idx === 0 ? (
                            <Terminal className="size-3 shrink-0" />
                          ) : (
                            <Columns2 className="size-3 shrink-0" />
                          )}
                          <span className="flex-1 truncate">{session.label}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              closeSession(session.id);
                            }}
                            className="flex size-4 items-center justify-center rounded-[3px] opacity-0 transition-opacity hover:bg-accent group-hover/session:opacity-100"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Terminal pane(s) */}
            {isSplit ? (
              <div className="flex flex-1 gap-1 overflow-hidden">
                {activeSplitGroup.map((session) => (
                  <TerminalPane
                    key={session.id}
                    session={session}
                    isActive={session.id === activeSessionId}
                    onFocus={() => setActiveSessionId(session.id)}
                    onExecute={executeCommand}
                    onClose={() => closeSession(session.id)}
                    showClose
                  />
                ))}
              </div>
            ) : activeSession ? (
              <TerminalPane
                key={activeSession.id}
                session={activeSession}
                isActive
                onFocus={() => {}}
                onExecute={executeCommand}
                showClose={false}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
