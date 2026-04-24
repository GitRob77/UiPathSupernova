"use client";

import { cn } from "@uipath/apollo-wind";
import { type LucideIcon, ChevronRight, ChevronLeft } from "lucide-react";
import { useState, useRef, useCallback } from "react";

export interface SidebarNavItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  active?: boolean;
  onClick?: () => void;
}

export interface SidebarNavFolder {
  label: string;
  value: string;
  icon?: LucideIcon;
  description?: string;
}

export interface SidebarNavFolderGroup {
  label: string;
  folders: SidebarNavFolder[];
}

const MIN_WIDTH = 280;
const MAX_WIDTH = 480;
const DEFAULT_WIDTH = 320;

export interface SidebarNavProps {
  /** Render prop providing collapsed state and side */
  children: (props: { collapsed: boolean; side: "left" | "right" }) => React.ReactNode;
  /** Whether the sidebar starts collapsed */
  defaultCollapsed?: boolean;
  /** Which side the sidebar is on */
  side?: "left" | "right";
  /** Whether the sidebar can be resized by dragging */
  resizable?: boolean;
  /** Whether the sidebar can be collapsed (implies resizable) */
  collapsible?: boolean;
  /** Additional className for the root container */
  className?: string;
}

export function SidebarNav({
  children,
  defaultCollapsed = false,
  side = "left",
  resizable: resizableProp,
  collapsible: collapsibleProp,
  className,
}: SidebarNavProps) {
  // collapsible implies resizable; both default to true
  const collapsible = collapsibleProp ?? true;
  const resizable = resizableProp ?? (collapsible || true);

  const [collapsed, setCollapsed] = useState(collapsible ? defaultCollapsed : false);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [resizing, setResizing] = useState(false);
  const isResizing = useRef(false);

  const isRight = side === "right";

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      if (collapsed || !resizable) return;
      e.preventDefault();
      isResizing.current = true;
      setResizing(true);
      const startX = e.clientX;
      const startWidth = width;

      const onMouseMove = (ev: MouseEvent) => {
        const delta = isRight
          ? startX - ev.clientX
          : ev.clientX - startX;
        const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + delta));
        setWidth(newWidth);
      };

      const onMouseUp = () => {
        isResizing.current = false;
        setResizing(false);
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
    [collapsed, resizable, width, isRight]
  );

  return (
    <div
      className={cn(
        "relative h-full shrink-0",
        !resizing && "sidebar-transition",
        className
      )}
      style={{ width: collapsed ? 40 : width }}
    >
      {/* Sliding panel */}
      <nav
        className={cn(
          "absolute inset-y-0 flex flex-col bg-background",
          isRight ? "right-0 border-l border-border-subtle" : "left-0 border-r border-border-subtle",
          !resizing && "sidebar-transition",
          collapsed && (isRight ? "translate-x-[calc(100%-2.5rem)]" : "-translate-x-[calc(100%-2.5rem)]")
        )}
        style={{ width: width }}
      >
        {/* Expand toggle button — shown when collapsed (always visible) */}
        {collapsible && collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className={cn(
            "group/toggle absolute top-[1.5rem] z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-border bg-background shadow-sm sidebar-transition hover:bg-[var(--primary)] hover:border-[var(--primary)] hover:shadow-[var(--shadow-dp-4)]",
            isRight ? "-left-3.5" : "-right-3.5",
          )}
        >
          {isRight
            ? <ChevronLeft className="h-3 w-3 text-muted-foreground group-hover/toggle:text-white" strokeWidth={3} />
            : <ChevronRight className="h-3 w-3 text-muted-foreground group-hover/toggle:text-white" strokeWidth={3} />
          }
        </button>
        )}

        {/* Sidebar content — hidden when collapsed */}
        <div className={cn("flex h-full flex-col overflow-hidden", collapsed && "invisible", resizing && "pointer-events-none")} style={{ minWidth: MIN_WIDTH }}>
          {children({ collapsed, side })}
        </div>

        {/* Resize handle + collapse button — both appear on hitzone hover */}
        {!collapsed && resizable && (
          <div
            onMouseDown={handleResizeStart}
            className={cn(
              "absolute top-0 bottom-0 w-4 cursor-ew-resize z-20 group/edge",
              isRight ? "-left-2" : "-right-2"
            )}
          >
            {/* Resize line — full height */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 -translate-x-1/2 bg-transparent group-hover/edge:bg-[var(--primary)] transition-colors pointer-events-none" />

            {/* Collapse button — appears on hitzone hover */}
            {collapsible && (
              <button
                onClick={(e) => { e.stopPropagation(); setCollapsed(true); }}
                onMouseDown={(e) => e.stopPropagation()}
                className="group/toggle absolute top-[1.5rem] left-1/2 -translate-x-1/2 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-border bg-background shadow-sm opacity-0 group-hover/edge:opacity-100 sidebar-transition hover:bg-[var(--primary)] hover:border-[var(--primary)] hover:shadow-[var(--shadow-dp-4)]"
              >
                {isRight
                  ? <ChevronRight className="h-3 w-3 text-muted-foreground group-hover/toggle:text-white" strokeWidth={3} />
                  : <ChevronLeft className="h-3 w-3 text-muted-foreground group-hover/toggle:text-white" strokeWidth={3} />
                }
              </button>
            )}
          </div>
        )}
      </nav>
    </div>
  );
}
