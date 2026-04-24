"use client";

import { AppHeader } from "@/components/custom/app-header";
import { SidebarNav } from "@/components/custom/sidebar-nav";
import { SidePanel } from "@/components/custom/side-panel";
import type { SidebarSlot, PanelSlot } from "@/components/layouts/dashboard-layout";

export type { SidebarSlot, PanelSlot };

interface ListingLayoutProps {
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

export function ListingLayout({
  children,
  productName = "Listing",
  leftSidebar,
  rightSidebar,
  leftPanel,
  rightPanel,
}: ListingLayoutProps) {
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
