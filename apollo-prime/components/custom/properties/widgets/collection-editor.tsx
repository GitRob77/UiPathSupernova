"use client";

import { cn } from "@uipath/apollo-wind";
import type { CollectionEditorWidgetProps } from "../types";
import { PropertyConfigMenu } from "../property-config-menu";

export interface PropertyCollectionEditorProps
  extends CollectionEditorWidgetProps {
  value: string[];
  onChange: (value: string[]) => void;
  supportsRefresh?: boolean;
  className?: string;
}

export function PropertyCollectionEditor({
  supportsRefresh,
  className,
}: PropertyCollectionEditorProps) {
  return (
    <div className={cn("flex items-start gap-2", className)}>
      <div className="flex flex-1 items-center justify-center rounded-md border border-dashed border-(--border-subtle) px-3 py-4 text-[length:var(--font-size-base)] text-muted-foreground">
        Collection Editor — work in progress
      </div>
      <PropertyConfigMenu
        pattern="basic"
        triggerSize="md"
        showForceRefresh={supportsRefresh}
      />
    </div>
  );
}
