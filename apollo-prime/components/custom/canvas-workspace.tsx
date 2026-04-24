"use client";

import { cn } from "@uipath/apollo-wind";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@uipath/apollo-wind/components/ui/context-menu";
import {
  Bot,
  Workflow,
  AppWindow,
  Cog,
  X,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CanvasGrid, type CanvasType } from "./canvas-grid";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface CanvasTab {
  /** Unique id (e.g. tree node id) */
  id: string;
  /** Display name */
  label: string;
  /** Determines which canvas grid to render */
  type: CanvasType;
  /** Optional unsaved-changes indicator */
  dirty?: boolean;
}

export interface CanvasWorkspaceProps {
  tabs: CanvasTab[];
  activeTabId?: string;
  onTabSelect: (id: string) => void;
  onTabClose: (id: string) => void;
  onCloseAll: () => void;
  onCloseOthers: (id: string) => void;
  /** Shown when no tabs are open */
  emptyState?: React.ReactNode;
  /** Custom canvas renderer per tab. Return `undefined` to fall back to the default CanvasGrid. */
  renderCanvas?: (tab: CanvasTab) => React.ReactNode | undefined;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Icon helper                                                        */
/* ------------------------------------------------------------------ */

const TRACK_INSET = 16; // 8px gap on each side

const TYPE_ICONS: Record<CanvasType, LucideIcon> = {
  agent: Bot,
  "api-workflow": Workflow,
  app: AppWindow,
  "rpa-workflow": Cog,
  "agentic-process": Bot,
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CanvasWorkspace({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onCloseAll,
  onCloseOthers,
  emptyState,
  renderCanvas,
  className,
}: CanvasWorkspaceProps) {
  /* Track which tab was right-clicked for context menu actions */
  const [contextTabId, setContextTabId] = useState<string | null>(null);

  /* Scroll state for custom overlay scrollbar */
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState({ left: 0, clientWidth: 0, scrollWidth: 0 });

  const syncScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setScroll({ left: el.scrollLeft, clientWidth: el.clientWidth, scrollWidth: el.scrollWidth });
  }, []);

  useEffect(() => {
    syncScroll();
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(syncScroll);
    ro.observe(el);
    return () => ro.disconnect();
  }, [syncScroll, tabs]);

  /* Scroll wheel — map vertical delta to horizontal scroll */
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!scrollRef.current) return;
    if (e.deltaX !== 0) return; // let native horizontal scroll through
    e.preventDefault();
    scrollRef.current.scrollLeft += e.deltaY;
  }, []);

  /* Drag-to-scroll on the thumb */
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startScrollLeft: number } | null>(null);

  const handleThumbMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const el = scrollRef.current;
    if (!el) return;
    dragRef.current = { startX: e.clientX, startScrollLeft: el.scrollLeft };
    setIsDragging(true);

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current || !scrollRef.current) return;
      const { clientWidth, scrollWidth } = scrollRef.current;
      const tw = clientWidth - TRACK_INSET;
      const thumb = Math.max(32, (clientWidth / scrollWidth) * tw);
      const trackRange = tw - thumb;
      const scrollRange = scrollWidth - clientWidth;
      const dx = ev.clientX - dragRef.current.startX;
      scrollRef.current.scrollLeft =
        dragRef.current.startScrollLeft + (dx / trackRange) * scrollRange;
    };

    const onUp = () => {
      dragRef.current = null;
      setIsDragging(false);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, []);

  /* Thumb geometry — track is inset 8px on each side */
  const canScroll = scroll.scrollWidth > scroll.clientWidth;
  const trackWidth = scroll.clientWidth - TRACK_INSET;
  const thumbWidth = canScroll
    ? Math.max(32, (scroll.clientWidth / scroll.scrollWidth) * trackWidth)
    : 0;
  const thumbLeft = canScroll
    ? (scroll.left / (scroll.scrollWidth - scroll.clientWidth)) *
      (trackWidth - thumbWidth)
    : 0;

  /* Middle-click to close */
  const handleAuxClick = useCallback(
    (e: React.MouseEvent, id: string) => {
      if (e.button === 1) {
        e.preventDefault();
        onTabClose(id);
      }
    },
    [onTabClose]
  );

  /* Empty state */
  if (tabs.length === 0) {
    return (
      <div
        className={cn(
          "flex h-full items-center justify-center rounded bg-background",
          className
        )}
      >
        {emptyState ?? (
          <p className="text-sm text-muted-foreground">
            Open a file from the explorer to get started
          </p>
        )}
      </div>
    );
  }

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];

  const contextTab = contextTabId
    ? tabs.find((t) => t.id === contextTabId)
    : null;

  /* Render a single tab button */
  const renderTab = (tab: CanvasTab) => {
    const isActive = tab.id === activeTab.id;
    const Icon = TYPE_ICONS[tab.type];
    return (
      <button
        key={tab.id}
        data-tab-id={tab.id}
        onClick={() => onTabSelect(tab.id)}
        onAuxClick={(e) => handleAuxClick(e, tab.id)}
        className={cn(
          "group/tab relative flex h-full shrink-0 cursor-pointer items-center gap-1.5 border-r border-(--border-subtle) px-3 text-xs transition-colors select-none",
          isActive
            ? "bg-(--color-tab-active-bg) text-foreground pb-0.5"
            : "bg-(--color-tab-bar-bg) text-muted-foreground hover:bg-(--color-tab-inactive-hover-bg)"
        )}
      >
        {/* Bottom accent for active tab */}
        {isActive && (
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-(--brand)" />
        )}
        <Icon className="size-3.5 shrink-0" />
        <span className="max-w-[140px] truncate whitespace-nowrap">
          {tab.label}
        </span>
        {tab.dirty && (
          <span className="size-1.5 shrink-0 rounded-full bg-foreground" />
        )}
        {/* Close button — absolutely positioned so it overlays the label without reserving flow space */}
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onTabClose(tab.id);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation();
              onTabClose(tab.id);
            }
          }}
          className="absolute right-0 inset-y-0 flex w-6 items-center justify-center opacity-0 transition-opacity group-hover/tab:opacity-100"
        >
          <span className="flex size-4 items-center justify-center rounded-[3px] bg-(--color-tab-close-bg) transition-colors hover:bg-(--color-tab-close-bg-hover)">
            <X className="size-3" />
          </span>
        </span>
      </button>
    );
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded bg-background overflow-hidden",
        className
      )}
    >
      {/* ---- Tab bar with context menu on entire container ---- */}
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            className="canvas-tab-bar group/tabbar relative flex h-8 shrink-0 border-b border-(--border-subtle) bg-(--color-tab-bar-bg)"
            onContextMenu={(e) => {
              const tabBtn = (e.target as HTMLElement).closest("[data-tab-id]");
              setContextTabId(
                tabBtn ? tabBtn.getAttribute("data-tab-id") : null
              );
            }}
          >
            {/* Tab strip — native scrollbar hidden, layout unaffected */}
            <div
              ref={scrollRef}
              onScroll={syncScroll}
              onWheel={handleWheel}
              className="flex h-full items-stretch overflow-x-auto [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none" }}
            >
              {tabs.map((tab) => renderTab(tab))}
            </div>

            {/* Custom overlay scrollbar — floats on top, visible on hover */}
            {canScroll && (
              <div className={cn("pointer-events-none absolute inset-x-2 bottom-0 h-[4px] rounded-full transition-opacity group-hover/tabbar:opacity-100", isDragging ? "opacity-100" : "opacity-0")}>
                <div
                  className="pointer-events-auto absolute h-full cursor-grab rounded-full bg-(--scrollbar-thumb) active:cursor-grabbing"
                  style={{ left: thumbLeft, width: thumbWidth }}
                  onMouseDown={handleThumbMouseDown}
                />
              </div>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-52">
          {contextTab && (
            <>
              <ContextMenuItem onClick={() => onTabClose(contextTab.id)}>
                Close
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => onCloseOthers(contextTab.id)}
                disabled={tabs.length <= 1}
              >
                Close other tabs
              </ContextMenuItem>
              <ContextMenuSeparator />
            </>
          )}
          <ContextMenuItem onClick={onCloseAll}>
            Close all tabs
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* ---- Canvas area ---- */}
      <div className="flex-1 overflow-hidden">
        {renderCanvas?.(activeTab) ?? <CanvasGrid type={activeTab.type} />}
      </div>

      {/* Capture layer — prevents hover/resize on other elements while dragging */}
      {isDragging && <div className="fixed inset-0 z-[9999] cursor-grabbing" />}
    </div>
  );
}
