"use client";

import { AppHeader } from "@/components/custom/app-header";
import { SidebarNav } from "@/components/custom/sidebar-nav";
import { SidePanel, type SidePanelItem } from "@/components/custom/side-panel";

export interface SidebarSlot {
  /** Render function receiving collapsed state and side */
  content: (props: { collapsed: boolean; side: "left" | "right" }) => React.ReactNode;
  /** Whether the sidebar starts collapsed */
  defaultCollapsed?: boolean;
  /** Whether the sidebar can be collapsed (implies resizable) */
  collapsible?: boolean;
  /** Whether the sidebar can be resized */
  resizable?: boolean;
}

export interface PanelSlot {
  /** Rail items with their panel content */
  items: SidePanelItem[];
  /** The id of the initially open panel */
  defaultActiveId?: string;
  /** Default panel width in pixels */
  defaultWidth?: number;
  /** Whether the panel is resizable */
  resizable?: boolean;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  productName?: string;
  /** Left sidebar configuration (collapsible sidebar style) */
  leftSidebar?: SidebarSlot;
  /** Right sidebar configuration (collapsible sidebar style) */
  rightSidebar?: SidebarSlot;
  /** Left side panel configuration (icon rail + expandable panel) */
  leftPanel?: PanelSlot;
  /** Right side panel configuration (icon rail + expandable panel) */
  rightPanel?: PanelSlot;
}

export function DashboardLayout({
  children,
  productName = "Dashboard",
  leftSidebar,
  rightSidebar,
  leftPanel,
  rightPanel,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <AppHeader productName={productName} />
      <div className="flex flex-1 overflow-hidden">
        {leftPanel && (
          <SidePanel side="left" {...leftPanel} />
        )}
        {leftSidebar && (
          <SidebarNav
            side="left"
            resizable={leftSidebar.resizable}
            collapsible={leftSidebar.collapsible}
            defaultCollapsed={leftSidebar.defaultCollapsed}
          >
            {leftSidebar.content}
          </SidebarNav>
        )}
        <main className="flex-1 overflow-auto p-6">{children}</main>
        {rightSidebar && (
          <SidebarNav
            side="right"
            resizable={rightSidebar.resizable}
            collapsible={rightSidebar.collapsible}
            defaultCollapsed={rightSidebar.defaultCollapsed}
          >
            {rightSidebar.content}
          </SidebarNav>
        )}
        {rightPanel && (
          <SidePanel side="right" {...rightPanel} />
        )}
      </div>
    </div>
  );
}
