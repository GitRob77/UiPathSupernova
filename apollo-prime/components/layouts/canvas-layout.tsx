"use client";

import { useState } from "react";
import {
  AppHeader,
  type ViewSwitchItem,
} from "@/components/custom/app-header";
import { SidePanel, type SidePanelItem } from "@/components/custom/side-panel";
import { StatusBar, type StatusBarProps } from "@/components/custom/status-bar";

const defaultViewSwitchItems: ViewSwitchItem[] = [
  { value: "build", label: "Build" },
  { value: "evaluate", label: "Evaluate" },
  { value: "monitor", label: "Manage", separated: true },
];

export interface CanvasPanelSlot {
  /** Rail items with their panel content */
  items: SidePanelItem[];
  /** The id of the initially open panel */
  defaultActiveId?: string;
  /** Controlled active panel id */
  activeId?: string;
  /** Callback when active panel changes */
  onActiveIdChange?: (id: string | undefined) => void;
  /** Default panel width in pixels */
  defaultWidth?: number;
  /** Whether the panel is resizable */
  resizable?: boolean;
}

interface CanvasLayoutProps {
  children: React.ReactNode;
  productName?: string;
  /** Left side panel configuration */
  leftPanel?: CanvasPanelSlot;
  /** Right side panel configuration */
  rightPanel?: CanvasPanelSlot;
  /** Bottom panel slot — rendered below the main workspace, between the side panels. */
  bottomPanel?: React.ReactNode;
  /** View switch items for the center toggle in the header. Pass `true` for defaults, or an array for custom items. */
  viewSwitch?: boolean | ViewSwitchItem[];
  /** Default active view switch value */
  defaultView?: string;
  /** Callback when view switch changes */
  onViewChange?: (value: string) => void;
  /** Status bar props. Pass `true` for defaults, a props object for custom config, or omit/`false` to hide. */
  statusBar?: boolean | Omit<StatusBarProps, "className">;
  /** Show Studio-style action buttons (Run, Save, etc.) in the title bar. Default false. */
  titleBarActions?: boolean;
}

export function CanvasLayout({
  children,
  leftPanel,
  rightPanel,
  bottomPanel,
  viewSwitch = true,
  defaultView = "build",
  onViewChange,
  statusBar = true,
  titleBarActions = false,
}: CanvasLayoutProps) {
  const viewSwitchItems = viewSwitch === true
    ? defaultViewSwitchItems
    : viewSwitch || undefined;

  const [activeView, setActiveView] = useState(defaultView);

  const handleViewChange = (value: string) => {
    setActiveView(value);
    onViewChange?.(value);
  };

  return (
    <div className="canvas-layout-root flex h-screen flex-col overflow-hidden">
      <AppHeader
        showWaffle={false}
        showProductName={false}
        canvasMenu
        autopilot={false}
        viewSwitch={viewSwitchItems}
        viewSwitchValue={activeView}
        onViewSwitchChange={handleViewChange}
        titleBarActions={titleBarActions}
        userInitials="IC"
      />
      <div className="canvas-layout-row flex flex-1 overflow-hidden px-1">
        {leftPanel && (
          <SidePanel side="left" {...leftPanel} />
        )}
        <div className="canvas-layout-center flex flex-1 flex-col overflow-hidden">
          <main className="canvas-layout-main flex-1 overflow-hidden">{children}</main>
          {bottomPanel && (
            <div className="canvas-layout-bottom">{bottomPanel}</div>
          )}
        </div>
        {rightPanel && (
          <SidePanel side="right" {...rightPanel} />
        )}
      </div>
      {statusBar && (
        <div className="canvas-layout-footer">
          <StatusBar
            {...(statusBar === true ? {} : statusBar)}
          />
        </div>
      )}
    </div>
  );
}
