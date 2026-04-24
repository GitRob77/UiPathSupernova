"use client";

import { useState } from "react";
import { DataGrid, DataTableColumnHeader } from "@/components/custom/data-grid";
import type { FilterBarFilter } from "@/components/custom/filter-bar";
import { StatusChip } from "@/components/custom/status-chip";
import { OntologyIcon } from "./ontology-icon";
import { actionTypes, objectTypes } from "../data/mock-data";
import type { ActionType, ActionCategory } from "../data/types";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";

const categoryVariant: Record<ActionCategory, "success" | "info" | "error" | "default"> = {
  create: "success",
  modify: "info",
  delete: "error",
  workflow: "default",
};

const columns: ColumnDef<ActionType, unknown>[] = [
  {
    accessorKey: "displayName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    size: 180,
    cell: ({ row }) => <span className="font-medium">{row.original.displayName}</span>,
  },
  {
    accessorKey: "category",
    header: "Category",
    size: 120,
    cell: ({ row }) => (
      <StatusChip variant={categoryVariant[row.original.category]} size="sm">
        {row.original.category}
      </StatusChip>
    ),
  },
  {
    id: "appliesTo",
    header: "Applies To",
    size: 250,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 flex-wrap">
        {row.original.objectTypeIds.map((otId) => {
          const ot = objectTypes.find((o) => o.id === otId);
          if (!ot) return null;
          return (
            <div key={otId} className="flex items-center gap-1">
              <OntologyIcon icon={ot.icon} colorClass={ot.iconColor} />
              <span className="text-sm">{ot.displayName}</span>
            </div>
          );
        })}
      </div>
    ),
  },
  {
    id: "parameters",
    header: "Parameters",
    size: 100,
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.parameters.length}</span>
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
];

const categoryOptions = [
  { value: "create", label: "Create" },
  { value: "modify", label: "Modify" },
  { value: "delete", label: "Delete" },
  { value: "workflow", label: "Workflow" },
];

export function ActionTypesListing() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const filtered = actionTypes.filter((at) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !at.displayName.toLowerCase().includes(q) &&
        !at.apiName.toLowerCase().includes(q)
      )
        return false;
    }
    if (categoryFilter && at.category !== categoryFilter) return false;
    return true;
  });

  const filters: FilterBarFilter[] = [
    {
      key: "category",
      label: "Category",
      options: categoryOptions,
      value: categoryFilter,
      onChange: (v) => setCategoryFilter(v as string),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Action Types</h1>
        <p className="text-sm text-muted-foreground">
          {actionTypes.length} action types defining operations on your ontology
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
            placeholder: "Search action types...",
          },
          filters,
          actions: [
            { label: "New Action Type", variant: "default", icon: Plus },
          ],
        }}
      />
    </div>
  );
}
