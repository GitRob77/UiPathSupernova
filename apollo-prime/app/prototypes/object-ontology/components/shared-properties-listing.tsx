"use client";

import { useState } from "react";
import { DataGrid, DataTableColumnHeader } from "@/components/custom/data-grid";
import { OntologyIcon } from "./ontology-icon";
import { sharedProperties, objectTypes } from "../data/mock-data";
import type { SharedProperty } from "../data/types";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@uipath/apollo-wind/components/ui/badge";
import { Plus } from "lucide-react";

const columns: ColumnDef<SharedProperty, unknown>[] = [
  {
    accessorKey: "displayName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    size: 180,
    cell: ({ row }) => <span className="font-medium">{row.original.displayName}</span>,
  },
  {
    accessorKey: "apiName",
    header: "API Name",
    size: 180,
    cell: ({ row }) => (
      <span className="font-code text-xs">{row.original.apiName}</span>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    size: 120,
    cell: ({ row }) => (
      <Badge variant="outline" className="font-code text-xs font-normal">
        {row.original.type}
      </Badge>
    ),
  },
  {
    id: "usedBy",
    header: "Used By",
    size: 280,
    cell: ({ row }) => {
      const ots = row.original.usedByObjectTypeIds
        .map((id) => objectTypes.find((ot) => ot.id === id))
        .filter(Boolean);
      return (
        <div className="flex items-center gap-2 flex-wrap">
          {ots.map((ot) =>
            ot ? (
              <div key={ot.id} className="flex items-center gap-1">
                <OntologyIcon icon={ot.icon} colorClass={ot.iconColor} />
                <span className="text-sm">{ot.displayName}</span>
              </div>
            ) : null,
          )}
        </div>
      );
    },
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

export function SharedPropertiesListing() {
  const [search, setSearch] = useState("");

  const filtered = search
    ? sharedProperties.filter(
        (sp) =>
          sp.displayName.toLowerCase().includes(search.toLowerCase()) ||
          sp.apiName.toLowerCase().includes(search.toLowerCase()),
      )
    : sharedProperties;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Shared Properties</h1>
        <p className="text-sm text-muted-foreground">
          {sharedProperties.length} shared properties reused across object types
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
            placeholder: "Search shared properties...",
          },
          actions: [
            { label: "New Shared Property", variant: "default", icon: Plus },
          ],
        }}
      />
    </div>
  );
}
