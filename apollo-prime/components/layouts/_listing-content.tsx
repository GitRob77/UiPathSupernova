"use client";

import { useState } from "react";
import {
  DataGrid,
  DataTableColumnHeader,
} from "@/components/custom/data-grid";
import type {
  FilterBarColumn,
  FilterBarFilter,
} from "@/components/custom/filter-bar";
import { StatusChip } from "@/components/custom/status-chip";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@uipath/apollo-wind/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@uipath/apollo-wind/components/ui/dropdown-menu";
import { TabsNav, TabsContent } from "@/components/custom/tabs-nav";

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

interface Machine {
  id: string;
  name: string;
  description: string;
  type: string;
  installedVersion: string;
  versionStatus: string;
  labels: string;
  properties: string;
  edrProtection: string;
}

const sampleData: Machine[] = Array.from({ length: 133 }, (_, i) => ({
  id: String(i + 1),
  name:
    i < 5
      ? [
          "086997dd-786e-461e-9075-d4153...",
          "27b1b74a-a469-444a-8c4a-b0f10...",
          "624e355d-e02a-4a73-8fd6-6bc66...",
          "ACR VM",
          "AlexMachine",
        ][i]
      : `machine-${String(i + 1).padStart(3, "0")}@uipath.com`,
  description: "",
  type: i === 3 ? "Cloud Robot - VM" : i === 4 ? "Standard" : "Template",
  installedVersion: i === 3 ? "25.0.176-cloud.21..." : "No Robots",
  versionStatus: "No policy",
  labels: "",
  properties: "No policy",
  edrProtection: "N/A",
}));

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

const columns: ColumnDef<Machine, unknown>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    size: 250,
  },
  {
    accessorKey: "description",
    header: "Description",
    size: 150,
  },
  {
    accessorKey: "type",
    header: "Type",
    size: 140,
  },
  {
    accessorKey: "installedVersion",
    header: "Installed version",
    size: 170,
  },
  {
    accessorKey: "versionStatus",
    header: "Version status",
    size: 140,
    cell: ({ row }) => {
      const value = row.getValue<string>("versionStatus");
      return (
        <StatusChip variant="warning" size="sm">
          {value}
        </StatusChip>
      );
    },
  },
  {
    accessorKey: "labels",
    header: "Labels",
    size: 100,
  },
  {
    accessorKey: "properties",
    header: "Properties",
    size: 120,
  },
  {
    accessorKey: "edrProtection",
    header: "EDR Protection",
    size: 130,
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

// ---------------------------------------------------------------------------
// Filter bar config
// ---------------------------------------------------------------------------

const filterColumns: FilterBarColumn[] = [
  { key: "name", label: "Name", visible: true },
  { key: "description", label: "Description", visible: true },
  { key: "type", label: "Type", visible: true },
  { key: "installedVersion", label: "Installed version", visible: true },
  { key: "versionStatus", label: "Version status", visible: true },
  { key: "labels", label: "Labels", visible: true },
  { key: "properties", label: "Properties", visible: true },
  { key: "edrProtection", label: "EDR Protection", visible: true },
];

const typeOptions = [
  { value: "template", label: "Template" },
  { value: "standard", label: "Standard" },
  { value: "cloud-robot", label: "Cloud Robot - VM" },
];

const labelOptions = [
  { value: "production", label: "Production" },
  { value: "staging", label: "Staging" },
  { value: "dev", label: "Dev" },
];

const propertyOptions = [
  { value: "no-policy", label: "No policy" },
  { value: "custom", label: "Custom" },
];

// ---------------------------------------------------------------------------
// Tabs config
// ---------------------------------------------------------------------------

const tabs = [
  { value: "machines", label: "Machines" },
  { value: "templates", label: "Templates" },
  { value: "catalogs", label: "Catalogs" },
  { value: "settings", label: "Settings" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ListingContent() {
  const [search, setSearch] = useState("");
  const [cols, setCols] = useState(filterColumns);
  const [type, setType] = useState("");
  const [labels, setLabels] = useState<string[]>([]);
  const [properties, setProperties] = useState("");

  const filters: FilterBarFilter[] = [
    {
      key: "type",
      label: "Type",
      options: typeOptions,
      value: type,
      onChange: (v) => setType(v as string),
    },
    {
      key: "labels",
      label: "Labels",
      options: labelOptions,
      value: labels,
      multiple: true,
      onChange: (v) => setLabels(v as string[]),
    },
    {
      key: "properties",
      label: "Properties",
      options: propertyOptions,
      value: properties,
      onChange: (v) => setProperties(v as string),
    },
  ];

  return (
    <TabsNav variant="primary" tabs={tabs} defaultValue="machines">
      <TabsContent value="machines" className="mt-0 pt-4">
        <DataGrid
          columns={columns}
          data={sampleData}
          selectable
          pageSize={25}
          filterBar={{
            search: {
              value: search,
              onChange: setSearch,
              placeholder: "Search...",
            },
            columns: { items: cols, onChange: setCols },
            filters,
            actions: [
              { label: "Unattended setup", variant: "outline", icon: Plus },
              { label: "Add machine", variant: "default", icon: Plus },
            ],
          }}
        />
      </TabsContent>
      <TabsContent value="templates" className="mt-0 pt-4">
        <p className="text-muted-foreground">Templates content goes here.</p>
      </TabsContent>
      <TabsContent value="catalogs" className="mt-0 pt-4">
        <p className="text-muted-foreground">Catalogs content goes here.</p>
      </TabsContent>
      <TabsContent value="settings" className="mt-0 pt-4">
        <p className="text-muted-foreground">Settings content goes here.</p>
      </TabsContent>
    </TabsNav>
  );
}
