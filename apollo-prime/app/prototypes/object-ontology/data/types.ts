import type { LucideIcon } from "lucide-react";

// --- Enums ---

export type ObjectTypeStatus = "active" | "draft" | "deprecated";

export type PropertyType =
  | "string"
  | "integer"
  | "double"
  | "boolean"
  | "date"
  | "datetime"
  | "timestamp"
  | "geopoint"
  | "array<string>"
  | "attachment";

export type LinkCardinality = "one-to-one" | "one-to-many" | "many-to-many";

export type ActionCategory = "create" | "modify" | "delete" | "workflow";

// --- Core types ---

export interface Property {
  id: string;
  apiName: string;
  displayName: string;
  type: PropertyType;
  description: string;
  required: boolean;
  primaryKey?: boolean;
  sharedPropertyId?: string;
}

export interface LinkType {
  id: string;
  apiName: string;
  displayName: string;
  description: string;
  sourceObjectTypeId: string;
  targetObjectTypeId: string;
  cardinality: LinkCardinality;
  reverseDisplayName: string;
}

export interface ActionParameter {
  name: string;
  type: PropertyType;
  required: boolean;
  description: string;
}

export interface ActionType {
  id: string;
  apiName: string;
  displayName: string;
  description: string;
  category: ActionCategory;
  objectTypeIds: string[];
  parameters: ActionParameter[];
}

export interface ObjectType {
  id: string;
  apiName: string;
  displayName: string;
  pluralDisplayName: string;
  description: string;
  status: ObjectTypeStatus;
  icon: LucideIcon;
  iconColor: string;
  properties: Property[];
  linkTypeIds: string[];
  actionTypeIds: string[];
  datasource: string;
  lastSynced: string;
  rowCount: number;
}

export interface SharedProperty {
  id: string;
  apiName: string;
  displayName: string;
  type: PropertyType;
  description: string;
  usedByObjectTypeIds: string[];
}

// --- Navigation ---

export type OntologyView =
  | "discover"
  | "object-types"
  | "graph"
  | "link-types"
  | "action-types"
  | "shared-properties";
