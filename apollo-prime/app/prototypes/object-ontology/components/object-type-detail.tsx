"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  DataGrid,
  DataTableColumnHeader,
} from "@/components/custom/data-grid";

import { StatusChip } from "@/components/custom/status-chip";
import { TabsNav, TabsContent } from "@/components/custom/tabs-nav";
import { OntologyIcon } from "./ontology-icon";
import { ObjectTypeGraph } from "./object-type-graph";
import type {
  ObjectType,
  ObjectTypeStatus,
  Property,
  LinkType,
  ActionType,
  ActionCategory,
} from "../data/types";
import { linkTypes as allLinkTypesData, actionTypes as allActionTypesData, objectTypes as allObjectTypesData } from "../data/mock-data";
import { Plus, Key, Check, Minus, ChevronRight } from "lucide-react";
import { Badge } from "@uipath/apollo-wind/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@uipath/apollo-wind/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@uipath/apollo-wind/components/ui/breadcrumb";

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

const objectStatusVariant: Record<ObjectTypeStatus, "success" | "info" | "warning"> = {
  active: "success",
  draft: "info",
  deprecated: "warning",
};

const actionCategoryVariant: Record<ActionCategory, "success" | "info" | "error" | "default"> = {
  create: "success",
  modify: "info",
  delete: "error",
  workflow: "default",
};

// ---------------------------------------------------------------------------
// Properties columns
// ---------------------------------------------------------------------------

const propertyCols: ColumnDef<Property, unknown>[] = [
  {
    accessorKey: "displayName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    size: 180,
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        {row.original.primaryKey && (
          <Key className="h-3.5 w-3.5 text-amber-500" />
        )}
        <span className="font-medium">{row.original.displayName}</span>
      </div>
    ),
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
    accessorKey: "description",
    header: "Description",
    size: 250,
    cell: ({ row }) => (
      <span className="line-clamp-1 text-muted-foreground">
        {row.original.description}
      </span>
    ),
  },
  {
    id: "required",
    header: "Required",
    size: 80,
    cell: ({ row }) =>
      row.original.required ? (
        <Check className="h-4 w-4 text-muted-foreground" />
      ) : (
        <Minus className="h-4 w-4 text-muted-foreground/40" />
      ),
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ObjectTypeDetailProps {
  objectType: ObjectType;
  allObjectTypes: ObjectType[];
  allLinkTypes: LinkType[];
  allActionTypes: ActionType[];
  onBack: () => void;
}

export function ObjectTypeDetail({
  objectType,
  onBack,
}: ObjectTypeDetailProps) {
  const [propSearch, setPropSearch] = useState("");

  // Resolve link types for this object type
  const objectLinkTypes = allLinkTypesData.filter(
    (lt) =>
      lt.sourceObjectTypeId === objectType.id ||
      lt.targetObjectTypeId === objectType.id,
  );

  // Resolve action types for this object type
  const objectActionTypes = allActionTypesData.filter((at) =>
    at.objectTypeIds.includes(objectType.id),
  );

  // Filtered properties
  const filteredProps = propSearch
    ? objectType.properties.filter(
        (p) =>
          p.displayName.toLowerCase().includes(propSearch.toLowerCase()) ||
          p.apiName.toLowerCase().includes(propSearch.toLowerCase()),
      )
    : objectType.properties;

  // Link type columns
  const linkCols: ColumnDef<(typeof objectLinkTypes)[number], unknown>[] = [
    {
      accessorKey: "displayName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Link Type" />,
      size: 180,
    },
    {
      id: "target",
      header: "Connected To",
      size: 200,
      cell: ({ row }) => {
        const otherId =
          row.original.sourceObjectTypeId === objectType.id
            ? row.original.targetObjectTypeId
            : row.original.sourceObjectTypeId;
        const other = allObjectTypesData.find((ot) => ot.id === otherId);
        if (!other) return null;
        return (
          <div className="flex items-center gap-2">
            <OntologyIcon icon={other.icon} colorClass={other.iconColor} />
            <span>{other.displayName}</span>
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
      size: 250,
      cell: ({ row }) => (
        <span className="line-clamp-1 text-muted-foreground">
          {row.original.description}
        </span>
      ),
    },
  ];

  // Action type columns
  const actionCols: ColumnDef<(typeof objectActionTypes)[number], unknown>[] = [
    {
      accessorKey: "displayName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      size: 180,
    },
    {
      accessorKey: "category",
      header: "Category",
      size: 120,
      cell: ({ row }) => (
        <StatusChip
          variant={actionCategoryVariant[row.original.category]}
          size="sm"
        >
          {row.original.category}
        </StatusChip>
      ),
    },
    {
      id: "parameters",
      header: "Parameters",
      size: 100,
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.parameters.length}
        </span>
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

  const tabs = [
    { value: "overview", label: "Overview" },
    { value: "properties", label: `Properties (${objectType.properties.length})` },
    { value: "links", label: `Link Types (${objectLinkTypes.length})` },
    { value: "actions", label: `Actions (${objectActionTypes.length})` },
  ];

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              className="cursor-pointer"
              onClick={onBack}
            >
              Object Types
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-3.5 w-3.5" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>{objectType.displayName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-start gap-3">
        <OntologyIcon
          icon={objectType.icon}
          colorClass={objectType.iconColor}
          size="md"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{objectType.displayName}</h1>
            <StatusChip
              variant={objectStatusVariant[objectType.status]}
              size="sm"
            >
              {objectType.status}
            </StatusChip>
          </div>
          <p className="font-code text-xs text-muted-foreground">
            {objectType.apiName}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {objectType.description}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <TabsNav variant="primary" tabs={tabs} defaultValue="overview">
        {/* Overview tab */}
        <TabsContent value="overview" className="mt-0 pt-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">About</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {objectType.description}
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Datasource</span>
                      <p className="font-code text-xs font-medium mt-0.5">
                        {objectType.datasource}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last synced</span>
                      <p className="font-medium mt-0.5">
                        {new Date(objectType.lastSynced).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Row count</span>
                      <p className="font-medium mt-0.5">
                        {objectType.rowCount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Relationships</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ObjectTypeGraph objectType={objectType} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Metadata</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-muted-foreground">API Name</dt>
                      <dd className="font-code text-xs font-medium mt-0.5">
                        {objectType.apiName}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Status</dt>
                      <dd className="mt-0.5">
                        <StatusChip
                          variant={objectStatusVariant[objectType.status]}
                          size="sm"
                        >
                          {objectType.status}
                        </StatusChip>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Properties</dt>
                      <dd className="font-medium mt-0.5">
                        {objectType.properties.length}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Link Types</dt>
                      <dd className="font-medium mt-0.5">
                        {objectLinkTypes.length}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Action Types</dt>
                      <dd className="font-medium mt-0.5">
                        {objectActionTypes.length}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Properties tab */}
        <TabsContent value="properties" className="mt-0 pt-4">
          <DataGrid
            columns={propertyCols}
            data={filteredProps}
            pageSize={25}
            compact
            filterBar={{
              search: {
                value: propSearch,
                onChange: setPropSearch,
                placeholder: "Search properties...",
              },
              actions: [
                { label: "Add Property", variant: "default", icon: Plus },
              ],
            }}
          />
        </TabsContent>

        {/* Link Types tab */}
        <TabsContent value="links" className="mt-0 pt-4">
          <DataGrid
            columns={linkCols}
            data={objectLinkTypes}
            pageSize={25}
            compact
          />
        </TabsContent>

        {/* Actions tab */}
        <TabsContent value="actions" className="mt-0 pt-4">
          <DataGrid
            columns={actionCols}
            data={objectActionTypes}
            pageSize={25}
            compact
          />
        </TabsContent>
      </TabsNav>
    </div>
  );
}
