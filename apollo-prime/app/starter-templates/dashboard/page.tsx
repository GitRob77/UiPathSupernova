"use client";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { DashboardContent } from "@/components/layouts/_dashboard-content";
import { SidebarNavItems } from "@/components/custom/sidebar-nav-items";
import type { SidebarNavItem } from "@/components/custom/sidebar-nav";
import {
  LayoutGrid,
  Activity,
  Rocket,
  Box,
  Package,
  Server,
  Settings,
} from "lucide-react";

const navItems: SidebarNavItem[] = [
  { label: "Overview", icon: LayoutGrid, active: true },
  { label: "Monitoring", icon: Activity },
  { label: "Deployments", icon: Rocket },
  { label: "Components", icon: Box },
  { label: "Packages", icon: Package },
  { label: "Infrastructure", icon: Server },
  { label: "Settings", icon: Settings },
];

export default function DashboardDemoPage() {
  return (
    <DashboardLayout
      leftSidebar={{
        content: ({ side }) => (
          <SidebarNavItems
            items={navItems}
            tooltipSide={side === "left" ? "right" : "left"}
          />
        ),
      }}
      rightSidebar={{
        content: () => (
          <div className="flex flex-col gap-6 p-5">
            <section>
              <h2 className="text-sm font-semibold text-foreground">
                Details Panel
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                This right sidebar can display contextual details, help content,
                or activity feeds relevant to the selected dashboard view.
              </p>
            </section>
          </div>
        ),
        defaultCollapsed: true,
      }}
    >
      <DashboardContent />
    </DashboardLayout>
  );
}
