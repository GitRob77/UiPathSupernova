"use client";

import { cn } from "@uipath/apollo-wind";
import { ScrollArea } from "@uipath/apollo-wind/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@uipath/apollo-wind/components/ui/tooltip";
import type { LucideIcon } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface SidePanelItem {
  /** Unique key for the panel */
  id: string;
  /** Icon shown in the rail */
  icon: LucideIcon;
  /** Tooltip label for the rail icon */
  label: string;
  /** Content rendered inside the panel when this item is active */
  panel: React.ReactNode;
  /** Override header title (defaults to label) */
  panelTitle?: string;
  /** Header action buttons */
  panelActions?: { icon: LucideIcon; label: string; onClick?: () => void }[];
  /** Custom header content rendered after panelActions (e.g. popovers, toggles) */
  panelHeaderExtra?: React.ReactNode;
  /** When set, replaces the entire header content (title + actions) */
  panelHeaderOverride?: React.ReactNode;
  /** Optional footer content below the scrollable body */
  panelFooter?: React.ReactNode;
}

export interface SidePanelProps {
  /** Rail items with their panel content */
  items: SidePanelItem[];
  /** Which side the panel appears on */
  side?: "left" | "right";
  /** The id of the initially open panel (undefined = all closed) */
  defaultActiveId?: string;
  /** Controlled active panel id (undefined = closed) */
  activeId?: string;
  /** Callback when the active panel changes */
  onActiveIdChange?: (id: string | undefined) => void;
  /** Default panel width in pixels */
  defaultWidth?: number;
  /** Minimum panel width */
  minWidth?: number;
  /** Maximum panel width */
  maxWidth?: number;
  /** Whether the panel is resizable */
  resizable?: boolean;
  /** Additional className on the root container */
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const RAIL_WIDTH = 40;
const DEFAULT_PANEL_WIDTH = 396;
const MIN_PANEL_WIDTH = 280;
const MAX_PANEL_WIDTH = 480;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SidePanel({
  items,
  side = "left",
  defaultActiveId,
  activeId: controlledActiveId,
  onActiveIdChange,
  defaultWidth = DEFAULT_PANEL_WIDTH,
  minWidth = MIN_PANEL_WIDTH,
  maxWidth = MAX_PANEL_WIDTH,
  resizable = true,
  className,
}: SidePanelProps) {
  const isControlled = controlledActiveId !== undefined || onActiveIdChange !== undefined;
  const [uncontrolledActiveId, setUncontrolledActiveId] = useState<string | undefined>(defaultActiveId);
  const activeId = isControlled ? controlledActiveId : uncontrolledActiveId;
  const controlledActiveIdRef = useRef(controlledActiveId);
  useEffect(() => { controlledActiveIdRef.current = controlledActiveId; }, [controlledActiveId]);
  const setActiveId = isControlled
    ? (val: string | undefined | ((prev: string | undefined) => string | undefined)) => {
        const next = typeof val === "function" ? val(controlledActiveIdRef.current) : val;
        onActiveIdChange?.(next);
      }
    : setUncontrolledActiveId;
  const [panelWidth, setPanelWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const isResizingRef = useRef(false);

  const isRight = side === "right";
  const isOpen = activeId !== undefined;
  const activeItem = isOpen ? items.find((i) => i.id === activeId) : undefined;

  // Total width: rail + gap (2px inside container) + panel + resize handle area
  const totalWidth = isOpen ? RAIL_WIDTH + panelWidth : RAIL_WIDTH;

  /* --- Rail icon click handler --- */
  const handleItemClick = useCallback(
    (id: string) => {
      setActiveId((prev) => (prev === id ? undefined : id));
    },
    []
  );

  /* --- Resize logic (adapted from sidebar-nav.tsx) --- */
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      if (!isOpen || !resizable) return;
      e.preventDefault();
      isResizingRef.current = true;
      setIsResizing(true);
      const startX = e.clientX;
      const startWidth = panelWidth;

      const onMouseMove = (ev: MouseEvent) => {
        const delta = isRight
          ? startX - ev.clientX
          : ev.clientX - startX;
        const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidth + delta));
        setPanelWidth(newWidth);
      };

      const onMouseUp = () => {
        isResizingRef.current = false;
        setIsResizing(false);
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
    [isOpen, resizable, panelWidth, isRight, maxWidth, minWidth]
  );

  /* --- Sub-renders --- */

  const rail = (
    <div className={cn(
      "side-panel-rail flex w-10 shrink-0 flex-col items-center gap-2 bg-background px-1 py-2",
      isRight ? "border-l border-border-subtle" : "border-r border-border-subtle"
    )}>
      <TooltipProvider delayDuration={700}>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeId;
          return (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleItemClick(item.id)}
                  className={cn(
                    "flex h-7 w-7 cursor-pointer items-center justify-center rounded-[3px] transition-colors",
                    isActive
                      ? "bg-[var(--color-background-selected)]"
                      : "hover:bg-accent"
                  )}
                >
                  <Icon className="size-4 text-[var(--color-icon-default)]" />
                </button>
              </TooltipTrigger>
              <TooltipContent side={isRight ? "left" : "right"}>
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );

  const panelArea = (
    <div
      className={cn(
        "side-panel-content group/panel flex h-full shrink-0 flex-col overflow-hidden bg-background",
        isRight ? "border-l border-border-subtle" : "border-r border-border-subtle"
      )}
      style={{ width: panelWidth }}
    >
        {/* Header */}
        <div className="flex h-8 shrink-0 items-center border-b border-border-subtle px-3">
          {activeItem?.panelHeaderOverride ? (
            activeItem.panelHeaderOverride
          ) : (
            <>
              <span className="text-[13px] font-semibold text-foreground whitespace-nowrap">
                {activeItem?.panelTitle ?? activeItem?.label}
              </span>
              <div className="flex-1" />
              <TooltipProvider>
                <div className="flex items-center gap-1">
                {activeItem?.panelHeaderExtra}
                {activeItem?.panelActions?.map((action) => {
                  const ActionIcon = action.icon;
                  return (
                    <Tooltip key={action.label}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={action.onClick}
                          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-[3px] px-1 transition-colors hover:bg-accent"
                        >
                          <ActionIcon className="h-4 w-4 text-[var(--color-icon-default)]" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>{action.label}</TooltipContent>
                    </Tooltip>
                  );
                })}
                </div>
              </TooltipProvider>
            </>
          )}
        </div>

        {/* Scrollable body */}
        <ScrollArea className="flex-1 [&>div[data-radix-scroll-area-viewport]]:!overflow-x-hidden [&>div[data-radix-scroll-area-viewport]>div]:h-full [&>div[data-radix-scroll-area-viewport]>div]:!block [&>div[data-radix-scroll-area-viewport]>div]:!min-w-0 [&>div[data-radix-scroll-area-viewport]>div]:w-full [&>div[data-radix-scroll-area-viewport]>div]:overflow-hidden">
          {activeItem?.panel}
        </ScrollArea>

        {/* Optional footer */}
        {activeItem?.panelFooter && (
          <div className="shrink-0">{activeItem.panelFooter}</div>
        )}
    </div>
  );

  const fullWidth = RAIL_WIDTH + panelWidth;

  return (
    <div
      data-open={isOpen}
      className={cn(
        "canvas-panel-outer relative h-full shrink-0 overflow-hidden",
        !isResizing && "sidebar-transition",
        className
      )}
      style={{ width: totalWidth }}
    >
      <div
        className={cn("canvas-panel-inner flex h-full rounded bg-[var(--color-background-secondary)] p-0", isRight ? "side-panel-right" : "side-panel-left")}
        style={{
          width: fullWidth,
          marginLeft: isRight ? totalWidth - fullWidth : undefined,
        }}
      >
        {isRight ? (
          <>
            {panelArea}
            {rail}
          </>
        ) : (
          <>
            {rail}
            {panelArea}
          </>
        )}
      </div>

      {/* Resize handle — positioned on the canvas-facing edge */}
      {isOpen && resizable && (
        <div
          onMouseDown={handleResizeStart}
          className={cn(
            "absolute top-0 bottom-0 z-20 w-4 cursor-ew-resize group/edge",
            isRight ? "-left-2" : "-right-2"
          )}
        >
          <div
            className={cn(
              "pointer-events-none absolute top-0 bottom-0 left-1/2 w-0.5 -translate-x-1/2 transition-colors",
              isResizing
                ? "bg-[var(--primary)]"
                : "bg-transparent group-hover/edge:bg-[var(--primary)]"
            )}
          />
        </div>
      )}
    </div>
  );
}
