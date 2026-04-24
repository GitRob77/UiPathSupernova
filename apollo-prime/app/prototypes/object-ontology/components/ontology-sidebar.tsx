import { SidebarNavItems } from "@/components/custom/sidebar-nav-items";
import type { SidebarNavItem } from "@/components/custom/sidebar-nav";
import type { OntologyView } from "../data/types";
import {
  Compass,
  Box,
  GitFork,
  Link2,
  Zap,
  Share2,
  FolderOpen,
} from "lucide-react";
import { Separator } from "@uipath/apollo-wind/components/ui/separator";

interface OntologySidebarProps {
  activeView: OntologyView;
  collapsed: boolean;
  side: "left" | "right";
  onViewChange: (view: OntologyView) => void;
}

export function OntologySidebar({
  activeView,
  collapsed,
  side,
  onViewChange,
}: OntologySidebarProps) {
  const navItems: SidebarNavItem[] = [
    { label: "Discover", icon: Compass, active: activeView === "discover", onClick: () => onViewChange("discover") },
    { label: "Object Types", icon: Box, active: activeView === "object-types", onClick: () => onViewChange("object-types") },
    { label: "Graph", icon: GitFork, active: activeView === "graph", onClick: () => onViewChange("graph") },
    { label: "Link Types", icon: Link2, active: activeView === "link-types", onClick: () => onViewChange("link-types") },
    { label: "Action Types", icon: Zap, active: activeView === "action-types", onClick: () => onViewChange("action-types") },
    { label: "Shared Properties", icon: Share2, active: activeView === "shared-properties", onClick: () => onViewChange("shared-properties") },
  ];

  const groupItems: SidebarNavItem[] = [
    { label: "HR Ontology", icon: FolderOpen },
    { label: "IT Assets", icon: FolderOpen },
    { label: "Operations", icon: FolderOpen },
  ];

  return (
    <div className="flex h-full flex-col gap-1">
      <SidebarNavItems
        items={navItems}
        tooltipSide={side === "left" ? "right" : "left"}
      />
      <Separator className="my-2" />
      {!collapsed && (
        <span className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Groups
        </span>
      )}
      <SidebarNavItems
        items={groupItems}
        tooltipSide={side === "left" ? "right" : "left"}
      />
    </div>
  );
}
