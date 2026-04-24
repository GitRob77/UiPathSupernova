"use client";

import { useRef, useCallback } from "react";
import { Button } from "@uipath/apollo-wind/components/ui/button";
import { ScrollArea } from "@uipath/apollo-wind/components/ui/scroll-area";
import { Server, FileJson, FileText, Settings, X, ChevronUp } from "lucide-react";
import { JsonView } from "./json-view";
import { SYSTEM_PROMPT, USER_PROMPT, CONFIG_DATA } from "../data/mock-data";
import type { Step, DrawerTabId } from "../data/types";

const DRAWER_TABS: {
  id: DrawerTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "server", label: "Server params", icon: Server },
  { id: "action", label: "Action JSON", icon: FileJson },
  { id: "prompt", label: "Prompt data", icon: FileText },
  { id: "config", label: "Config", icon: Settings },
];

export function BottomDrawer({
  step,
  activeDrawer,
  onToggleDrawer,
  drawerHeight,
  onDrawerHeightChange,
}: {
  step: Step;
  activeDrawer: DrawerTabId | null;
  onToggleDrawer: (id: DrawerTabId) => void;
  drawerHeight: number;
  onDrawerHeightChange: (height: number) => void;
}) {
  const dragging = useRef(false);
  const startY = useRef(0);
  const startH = useRef(0);

  const hasError = step.status === "error";

  const onDragStart = useCallback(
    (e: React.MouseEvent) => {
      dragging.current = true;
      startY.current = e.clientY;
      startH.current = drawerHeight;

      const move = (ev: MouseEvent) => {
        if (dragging.current) {
          onDrawerHeightChange(
            Math.max(200, Math.min(600, startH.current + (startY.current - ev.clientY)))
          );
        }
      };
      const up = () => {
        dragging.current = false;
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      };
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    },
    [drawerHeight, onDrawerHeightChange]
  );

  /* Open drawer */
  if (activeDrawer) {
    return (
      <div
        className="absolute inset-x-0 bottom-0 z-20 flex flex-col border-t border-(--border-subtle) bg-background shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
        style={{ height: drawerHeight }}
      >
        {/* Drag handle + tabs */}
        <div
          className="flex cursor-row-resize items-center border-b border-(--border-subtle) px-2 py-2"
          onMouseDown={onDragStart}
        >
          {DRAWER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={(e) => {
                e.stopPropagation();
                onToggleDrawer(tab.id);
              }}
              className={`relative flex cursor-pointer items-center gap-1.5 rounded-md border-none bg-transparent px-2.5 py-1 text-xs ${
                activeDrawer === tab.id
                  ? "font-semibold text-primary"
                  : "font-normal text-foreground"
              }`}
            >
              <tab.icon className="h-3 w-3" /> {tab.label}
              {tab.id === "action" && hasError && (
                <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-destructive" />
              )}
            </button>
          ))}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-7 w-7 text-muted-foreground"
            onClick={() => onToggleDrawer(activeDrawer)}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-4">
          {activeDrawer === "server" && (
            <div className="space-y-3.5">
              {(
                [
                  ["Observation", step.observation],
                  ["Reasoning", step.reasoning],
                  ["Summary", step.summary || "\u2014"],
                ] as const
              ).map(([label, value]) => (
                <div key={label}>
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {label}
                  </div>
                  <p className="m-0 text-xs leading-relaxed text-foreground">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeDrawer === "action" && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Action: {step.action}
                </span>
                {hasError && (
                  <span className="rounded bg-red-100 px-2 py-px text-[11px] font-semibold text-destructive">
                    Failed
                  </span>
                )}
              </div>
              {step.actionJson ? (
                <JsonView data={step.actionJson} />
              ) : (
                <p className="text-xs text-foreground">No action data.</p>
              )}
            </div>
          )}

          {activeDrawer === "prompt" && (
            <div className="space-y-4">
              {(
                [
                  ["System prompt", SYSTEM_PROMPT],
                  ["Augmented user prompt", USER_PROMPT],
                ] as const
              ).map(([label, value]) => (
                <div key={label}>
                  <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {label}
                  </div>
                  <pre className="m-0 whitespace-pre-wrap rounded-md border border-(--border-subtle) bg-muted/30 p-3 font-code text-[13px] leading-relaxed text-foreground">
                    {value}
                  </pre>
                </div>
              ))}
            </div>
          )}

          {activeDrawer === "config" && <JsonView data={CONFIG_DATA} />}
        </ScrollArea>
      </div>
    );
  }

  /* Closed — show tab buttons at bottom */
  return (
    <div className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-0.5 border-t border-(--border-subtle) bg-background px-2 py-2">
      {DRAWER_TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onToggleDrawer(tab.id)}
          className="relative flex cursor-pointer items-center gap-1.5 rounded-md border-none bg-transparent px-2.5 py-1 text-xs text-foreground"
        >
          <tab.icon className="h-3 w-3" /> {tab.label}
          <ChevronUp className="h-2.5 w-2.5 opacity-40" />
          {tab.id === "action" && hasError && (
            <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-destructive" />
          )}
        </button>
      ))}
    </div>
  );
}
