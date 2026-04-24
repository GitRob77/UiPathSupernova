"use client";

import { useState } from "react";
import {
  DataGrid,
  DataTableColumnHeader,
} from "@/components/custom/data-grid";
import type { FilterBarFilter } from "@/components/custom/filter-bar";
import { StatusChip } from "@/components/custom/status-chip";
import { OntologyIcon } from "./ontology-icon";
import { objectTypes } from "../data/mock-data";
import type { ObjectType, ObjectTypeStatus } from "../data/types";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@uipath/apollo-wind/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@uipath/apollo-wind/components/ui/dropdown-menu";

const statusVariant: Record<ObjectTypeStatus, "success" | "info" | "warning"> = {
  active: "success",
  draft: "info",
  deprecated: "warning",
};

const columns: ColumnDef<ObjectType, unknown>[] = [
  {
    id: "icon",
    size: 50,
    cell: ({ row }) => (
      <OntologyIcon icon={row.original.icon} colorClass={row.original.iconColor} />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "displayName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    size: 200,
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.displayName}</div>
        <div className="font-code text-xs text-muted-foreground">
          {row.original.apiName}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 110,
    cell: ({ row }) => (
      <StatusChip variant={statusVariant[row.original.status]} size="sm">
        {row.original.status}
      </StatusChip>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    size: 300,
    cell: ({ row }) => (
      <span className="line-clamp-1 text-muted-foreground">
        {row.original.description}
      </span>
    ),
  },
  {
    id: "properties",
    header: "Properties",
    size: 100,
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.properties.length}
      </span>
    ),
  },
  {
    id: "links",
    header: "Links",
    size: 80,
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.linkTypeIds.length}
      </span>
    ),
  },
  {
    accessorKey: "datasource",
    header: "Datasource",
    size: 180,
    cell: ({ row }) => (
      <span className="font-code text-xs text-muted-foreground">
        {row.original.datasource}
      </span>
    ),
  },
  {
    id: "actions",
    size: 50,
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Duplicate</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
    enableHiding: false,
  },
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "deprecated", label: "Deprecated" },
];

interface ObjectTypesListingProps {
  onSelectObjectType: (id: string) => void;
}

export function ObjectTypesListing({ onSelectObjectType }: ObjectTypesListingProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = objectTypes.filter((ot) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !ot.displayName.toLowerCase().includes(q) &&
        !ot.apiName.toLowerCase().includes(q)
      )
        return false;
    }
    if (statusFilter && ot.status !== statusFilter) return false;
    return true;
  });

  const filters: FilterBarFilter[] = [
    {
      key: "status",
      label: "Status",
      options: statusOptions,
      value: statusFilter,
      onChange: (v) => setStatusFilter(v as string),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Object Types</h1>
        <p className="text-sm text-muted-foreground">
          {objectTypes.length} object types defined in your ontology
        </p>
      </div>
      <DataGrid
        columns={columns}
        data={filtered}
        pageSize={25}
        onRowClick={(row) => onSelectObjectType(row.id)}
        filterBar={{
          search: {
            value: search,
            onChange: setSearch,
            placeholder: "Search object types...",
          },
          filters,
          actions: [
            { label: "New Object Type", variant: "default", icon: Plus },
          ],
        }}
      />
    </div>
  );
}
