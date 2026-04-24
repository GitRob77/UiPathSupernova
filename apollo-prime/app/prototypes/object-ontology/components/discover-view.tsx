"use client";

import {
  Card,
  CardContent,
} from "@uipath/apollo-wind/components/ui/card";
import { StatusChip } from "@/components/custom/status-chip";
import { OntologyIcon } from "./ontology-icon";
import { objectTypes, linkTypes, actionTypes, sharedProperties } from "../data/mock-data";
import type { OntologyView, ObjectTypeStatus } from "../data/types";
import { Box, Link2, Zap, Share2 } from "lucide-react";

const statusVariant: Record<ObjectTypeStatus, "success" | "info" | "warning"> = {
  active: "success",
  draft: "info",
  deprecated: "warning",
};

interface DiscoverViewProps {
  onNavigate: (view: OntologyView) => void;
  onSelectObjectType: (id: string) => void;
}

export function DiscoverView({ onNavigate, onSelectObjectType }: DiscoverViewProps) {
  const stats = [
    { label: "Object Types", count: objectTypes.length, icon: Box, color: "text-blue-500", view: "object-types" as OntologyView },
    { label: "Link Types", count: linkTypes.length, icon: Link2, color: "text-green-500", view: "link-types" as OntologyView },
    { label: "Action Types", count: actionTypes.length, icon: Zap, color: "text-orange-500", view: "action-types" as OntologyView },
    { label: "Shared Properties", count: sharedProperties.length, icon: Share2, color: "text-purple-500", view: "shared-properties" as OntologyView },
  ];

  const recentObjectTypes = objectTypes.slice(0, 4);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Ontology Manager</h1>
        <p className="text-sm text-muted-foreground">
          Explore and manage your organization&apos;s data ontology
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card
              key={s.label}
              className="cursor-pointer transition-colors hover:bg-accent/50"
              onClick={() => onNavigate(s.view)}
            >
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="text-3xl font-semibold mt-1">{s.count}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${s.color} opacity-60`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recently viewed */}
      <div>
        <h2 className="text-base font-semibold mb-3">Recently Viewed</h2>
        <div className="grid grid-cols-2 gap-3">
          {recentObjectTypes.map((ot) => (
            <Card
              key={ot.id}
              className="cursor-pointer transition-colors hover:bg-accent/50"
              onClick={() => onSelectObjectType(ot.id)}
            >
              <CardContent className="flex items-center gap-3 py-3">
                <OntologyIcon icon={ot.icon} colorClass={ot.iconColor} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">
                      {ot.displayName}
                    </span>
                    <StatusChip variant={statusVariant[ot.status]} size="sm">
                      {ot.status}
                    </StatusChip>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {ot.properties.length} properties &middot; {ot.linkTypeIds.length} links &middot; {ot.rowCount.toLocaleString()} rows
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick access */}
      <div>
        <h2 className="text-base font-semibold mb-3">Quick Access</h2>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Browse Object Types", view: "object-types" as OntologyView },
            { label: "View Graph", view: "graph" as OntologyView },
            { label: "Manage Link Types", view: "link-types" as OntologyView },
            { label: "Shared Properties", view: "shared-properties" as OntologyView },
          ].map((item) => (
            <Card
              key={item.label}
              className="cursor-pointer transition-colors hover:bg-accent/50"
              onClick={() => onNavigate(item.view)}
            >
              <CardContent className="py-4 text-center">
                <p className="text-sm font-medium">{item.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
