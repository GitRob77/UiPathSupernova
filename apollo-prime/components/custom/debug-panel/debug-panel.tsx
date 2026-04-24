"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@uipath/apollo-wind";
import { Button } from "@uipath/apollo-wind/components/ui/button";
import { TabsNav, TabsContent } from "@/components/custom/tabs-nav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@uipath/apollo-wind/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@uipath/apollo-wind/components/ui/tooltip";
import {
  Copy,
  MoreVertical,
  ChevronsDownUp,
  ChevronsUpDown,
} from "lucide-react";

import type {
  RunHistoryItem,
  Breakpoint,
  LogEntry,
  WatchItem,
  LocalsSection,
} from "./types";
import { RunHistoryPanel } from "./run-history";
import { BreakpointsPanel } from "./breakpoints";
import { LogsPanel } from "./logs";
import { WatchesPanel } from "./watches";
import { LocalsPanel } from "./locals";

export interface DebugPanelProps {
  open: boolean;
  runs: RunHistoryItem[];
  logsByRun: Record<string, LogEntry[]>;
  localsByRun: Record<string, LocalsSection[]>;
  initialBreakpoints?: Breakpoint[];
  initialWatches?: WatchItem[];
  defaultSelectedRunId?: string;
  className?: string;
}

const MIN_HEIGHT = 120;
const MAX_HEIGHT = 500;
const DEFAULT_HEIGHT = 240;

export function DebugPanel({
  open,
  runs,
  logsByRun,
  localsByRun,
  initialBreakpoints = [],
  initialWatches = [],
  defaultSelectedRunId,
  className,
}: DebugPanelProps) {
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [isResizing, setIsResizing] = useState(false);
  const isResizingRef = useRef(false);

  const [leftTab, setLeftTab] = useState("run-history");
  const [rightTab, setRightTab] = useState("logs");
  const [selectedRunId, setSelectedRunId] = useState<string | null>(
    defaultSelectedRunId ?? runs[0]?.id ?? null
  );
  const [expandedRunIds, setExpandedRunIds] = useState<Set<string>>(() => {
    const seed = defaultSelectedRunId ?? runs[0]?.id;
    return seed ? new Set([seed]) : new Set();
  });
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [breakpoints, setBreakpoints] = useState(initialBreakpoints);
  const [watches, setWatches] = useState(initialWatches);

  const handleToggleRun = useCallback((id: string) => {
    setExpandedRunIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

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

  /* --- Horizontal split resize --- */
  const [splitRatio, setSplitRatio] = useState(0.5);
  const [isSplitResizing, setIsSplitResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSplitResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startRatio = splitRatio;
      const containerWidth = containerRef.current?.offsetWidth ?? 1;
      setIsSplitResizing(true);

      const onMouseMove = (ev: MouseEvent) => {
        const delta = ev.clientX - startX;
        const newRatio = Math.min(0.8, Math.max(0.2, startRatio + delta / containerWidth));
        setSplitRatio(newRatio);
      };

      const onMouseUp = () => {
        setIsSplitResizing(false);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [splitRatio]
  );

  const logs = selectedRunId ? logsByRun[selectedRunId] ?? [] : [];
  const localsSections = selectedRunId ? localsByRun[selectedRunId] ?? [] : [];

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

      {/* Panels container */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden bg-white">
        {/* Left panel — Run history / Breakpoints */}
        <div className="relative flex flex-col overflow-hidden bg-(--surface-level-0)" style={{ width: `${splitRatio * 100}%` }}>
          <div className="absolute right-2 top-1 z-10 flex h-6 items-center gap-0.5">
            <TooltipProvider delayDuration={400}>
              {leftTab === "run-history" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground"
                      onClick={() => {
                        if (expandedRunIds.size > 0) {
                          setExpandedRunIds(new Set());
                        } else {
                          setExpandedRunIds(new Set(runs.map((r) => r.id)));
                        }
                      }}
                    >
                      {expandedRunIds.size > 0 ? (
                        <ChevronsDownUp className="size-3" />
                      ) : (
                        <ChevronsUpDown className="size-3" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{expandedRunIds.size > 0 ? "Collapse all" : "Expand all"}</TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground"
                >
                  <MoreVertical className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Clear run history</DropdownMenuItem>
                <DropdownMenuItem>Remove all breakpoints</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <TabsNav
            variant="tiny"
            tabs={[
              { value: "run-history", label: "Run history" },
              { value: "breakpoints", label: "Breakpoints" },
            ]}
            value={leftTab}
            onValueChange={setLeftTab}
            bordered
            tabListClassName="pl-1 pt-1"
            className="flex h-full flex-col overflow-hidden"
          >
            <TabsContent value="run-history" className="flex-1 overflow-hidden">
              <RunHistoryPanel
                items={runs}
                selectedRunId={selectedRunId}
                selectedStepId={selectedStepId}
                expandedRunIds={expandedRunIds}
                onSelectRun={(id) => { setSelectedRunId(id); setSelectedStepId(null); }}
                onToggleRun={handleToggleRun}
                onSelectStep={(runId, stepId) => { setSelectedRunId(runId); setSelectedStepId(stepId); }}
              />
            </TabsContent>
            <TabsContent value="breakpoints" className="flex-1 overflow-hidden">
              <BreakpointsPanel
                breakpoints={breakpoints}
                onRemove={(id) => setBreakpoints((prev) => prev.filter((b) => b.id !== id))}
              />
            </TabsContent>
          </TabsNav>
        </div>

        {/* Vertical split resize handle */}
        <div className="group/split relative w-px shrink-0">
          <div
            className={cn(
              "pointer-events-none absolute inset-0 transition-colors",
              isSplitResizing
                ? "bg-(--primary)"
                : "bg-(--border-subtle) group-hover/split:bg-(--primary)"
            )}
          />
          <div
            onMouseDown={handleSplitResizeStart}
            className="absolute inset-y-0 -left-1 -right-1 cursor-ew-resize"
          />
        </div>

        {/* Right panel — Locals / Watches / Logs */}
        <div className="relative flex flex-1 flex-col overflow-hidden bg-(--surface-level-0)">
          <div className="absolute right-2 top-1 z-10 flex h-6 items-center gap-0.5">
            <TooltipProvider delayDuration={400}>
              {rightTab === "logs" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground"
                      onClick={() => {
                        const text = logs.map((e) => `[${e.time}] ${e.message}${e.duration ? ` (${e.duration})` : ""}`).join("\n");
                        navigator.clipboard?.writeText(text).catch((err) => {
                          console.warn("Copy to clipboard failed", err);
                        });
                      }}
                    >
                      <Copy className="size-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy logs</TooltipContent>
                </Tooltip>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground"
                  >
                    <MoreVertical className="size-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Clear logs</DropdownMenuItem>
                  <DropdownMenuItem>Copy all</DropdownMenuItem>
                  <DropdownMenuItem>Filter by level</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipProvider>
          </div>
          <TabsNav
            variant="tiny"
            tabs={[
              { value: "locals", label: "Locals" },
              { value: "watches", label: "Watches" },
              { value: "logs", label: "Logs" },
            ]}
            value={rightTab}
            onValueChange={setRightTab}
            bordered
            tabListClassName="pl-1 pt-1"
            className="flex h-full flex-col overflow-hidden"
          >
            <TabsContent value="locals" className="flex-1 overflow-hidden">
              <LocalsPanel sections={localsSections} />
            </TabsContent>
            <TabsContent value="watches" className="flex-1 overflow-hidden">
              <WatchesPanel
                watches={watches}
                onAdd={(expression) =>
                  setWatches((prev) => [...prev, { id: `w-${Date.now()}`, expression, value: "undefined", type: "error" }])
                }
                onRemove={(id) => setWatches((prev) => prev.filter((w) => w.id !== id))}
                onEdit={(id, expression) => {
                  setWatches((prev) => {
                    const existing = prev.find((w) => w.id === id);
                    if (existing) {
                      return prev.map((w) => (w.id === id ? { ...w, expression } : w));
                    }
                    return [...prev, { id, expression, value: "undefined", type: "error" }];
                  });
                }}
              />
            </TabsContent>
            <TabsContent value="logs" className="flex-1 overflow-hidden">
              <LogsPanel entries={logs} />
            </TabsContent>
          </TabsNav>
        </div>
      </div>
    </div>
  );
}
