"use client";

import { cn } from "@uipath/apollo-wind";
import { Switch } from "@uipath/apollo-wind/components/ui/switch";
import type { ToggleWidgetProps } from "../types";
import { PropertyConfigMenu } from "../property-config-menu";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface PropertyToggleProps extends ToggleWidgetProps {
  value: boolean;
  onChange: (value: boolean) => void;
  supportsRefresh?: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PropertyToggle({
  value,
  onChange,
  onLabel = "On",
  offLabel = "Off",
  supportsRefresh,
  className,
}: PropertyToggleProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Switch
        checked={value}
        onCheckedChange={onChange}
        className="h-4 w-7 [&>span]:h-3 [&>span]:w-3 [&>span]:data-[state=checked]:translate-x-3"
      />
      <span className="flex-1 text-[length:var(--font-size-base)] text-foreground">
        {value ? onLabel : offLabel}
      </span>

      <PropertyConfigMenu
        pattern="basic"
        triggerSize="md"
        showForceRefresh={supportsRefresh}
      />
    </div>
  );
}
