"use client";

import { ListingLayout } from "@/components/layouts/listing-layout";
import { ListingContent } from "@/components/layouts/_listing-content";
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
  Info,
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

export default function ListingDemoPage() {
  return (
    <ListingLayout
      leftSidebar={{
        content: ({ side }) => (
          <SidebarNavItems
            items={navItems}
            tooltipSide={side === "left" ? "right" : "left"}
          />
        ),
      }}
      rightSidebar={{
        defaultCollapsed: true,
        content: () => (
          <div className="flex flex-col gap-6 p-5">
            <section>
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">
                  Details
                </h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Select a row from the table to view its details, configuration,
                and history.
              </p>
            </section>
            <section>
              <h2 className="text-sm font-semibold text-foreground">
                Quick Actions
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Use the action menu on each row to edit, duplicate, or delete
                items. Bulk actions are available when rows are selected.
              </p>
            </section>
          </div>
        ),
      }}
    >
      <ListingContent />
    </ListingLayout>
  );
}
