"use client";

import { useState } from "react";
import { DataGrid, DataTableColumnHeader } from "@/components/custom/data-grid";
import { OntologyIcon } from "./ontology-icon";
import { linkTypes, objectTypes } from "../data/mock-data";
import type { LinkType } from "../data/types";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@uipath/apollo-wind/components/ui/badge";
import { Plus } from "lucide-react";

function resolveObjectType(id: string) {
  return objectTypes.find((ot) => ot.id === id);
}

const columns: ColumnDef<LinkType, unknown>[] = [
  {
    accessorKey: "displayName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    size: 180,
    cell: ({ row }) => <span className="font-medium">{row.original.displayName}</span>,
  },
  {
    id: "source",
    header: "Source",
    size: 180,
    cell: ({ row }) => {
      const ot = resolveObjectType(row.original.sourceObjectTypeId);
      if (!ot) return null;
      return (
        <div className="flex items-center gap-2">
          <OntologyIcon icon={ot.icon} colorClass={ot.iconColor} />
          <span>{ot.displayName}</span>
        </div>
      );
    },
  },
  {
    id: "target",
    header: "Target",
    size: 180,
    cell: ({ row }) => {
      const ot = resolveObjectType(row.original.targetObjectTypeId);
      if (!ot) return null;
      return (
        <div className="flex items-center gap-2">
          <OntologyIcon icon={ot.icon} colorClass={ot.iconColor} />
          <span>{ot.displayName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "cardinality",
    header: "Cardinality",
    size: 120,
    cell: ({ row }) => {
      const c = row.original.cardinality;
      const label = c === "one-to-one" ? "1:1" : c === "one-to-many" ? "1:N" : "N:N";
      return <Badge variant="outline">{label}</Badge>;
    },
  },
  {
    accessorKey: "reverseDisplayName",
    header: "Reverse Name",
    size: 160,
  },
  {
    accessorKey: "description",
    header: "Description",
    size: 280,
    cell: ({ row }) => (
      <span className="line-clamp-1 text-muted-foreground">
        {row.original.description}
      </span>
    ),
  },
];

export function LinkTypesListing() {
  const [search, setSearch] = useState("");

  const filtered = search
    ? linkTypes.filter(
        (lt) =>
          lt.displayName.toLowerCase().includes(search.toLowerCase()) ||
          lt.apiName.toLowerCase().includes(search.toLowerCase()),
      )
    : linkTypes;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Link Types</h1>
        <p className="text-sm text-muted-foreground">
          {linkTypes.length} link types defining relationships between object types
        </p>
      </div>
      <DataGrid
        columns={columns}
        data={filtered}
        pageSize={25}
        filterBar={{
          search: {
            value: search,
            onChange: setSearch,
            placeholder: "Search link types...",
          },
          actions: [
            { label: "New Link Type", variant: "default", icon: Plus },
          ],
        }}
      />
    </div>
  );
}
