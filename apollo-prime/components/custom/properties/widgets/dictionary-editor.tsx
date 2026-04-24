"use client";

import { cn } from "@uipath/apollo-wind";
import type { DictionaryEditorWidgetProps } from "../types";
import { PropertyConfigMenu } from "../property-config-menu";

export interface DictionaryEntry {
  key: string;
  value: string;
}

export interface PropertyDictionaryEditorProps
  extends DictionaryEditorWidgetProps {
  value: DictionaryEntry[];
  onChange: (value: DictionaryEntry[]) => void;
  supportsRefresh?: boolean;
  className?: string;
}

export function PropertyDictionaryEditor({
  supportsRefresh,
  className,
}: PropertyDictionaryEditorProps) {
  return (
    <div className={cn("flex items-start gap-2", className)}>
      <div className="flex flex-1 items-center justify-center rounded-md border border-dashed border-(--border-subtle) px-3 py-4 text-[length:var(--font-size-base)] text-muted-foreground">
        Dictionary Editor — work in progress
      </div>
      <PropertyConfigMenu
        pattern="basic"
        triggerSize="md"
        showForceRefresh={supportsRefresh}
      />
    </div>
  );
}
