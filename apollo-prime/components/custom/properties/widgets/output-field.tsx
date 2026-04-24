"use client";

import { cn } from "@uipath/apollo-wind";
import { Badge } from "@uipath/apollo-wind/components/ui/badge";
import { SquareSlash } from "lucide-react";
import type { OutputFieldWidgetProps } from "../types";
import { PropertyConfigMenu } from "../property-config-menu";

export interface PropertyOutputFieldProps extends OutputFieldWidgetProps {
  supportsRefresh?: boolean;
  className?: string;
}

export function PropertyOutputField({
  name,
  supportsRefresh,
  className,
}: PropertyOutputFieldProps) {
  return (
    <div
      className={cn(
        "flex min-h-[32px] items-center gap-1 rounded-md border border-input bg-background px-2 py-1",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <Badge
          variant="outline"
          className="gap-1 border-blue-200 bg-blue-50 py-0 text-[length:var(--font-size-base)] font-normal text-blue-700"
        >
          <SquareSlash className="size-3" />
          {name}
        </Badge>
      </div>
      <PropertyConfigMenu pattern="output" showForceRefresh={supportsRefresh} />
    </div>
  );
}
