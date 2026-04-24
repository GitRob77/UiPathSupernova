"use client";

import { cn } from "@uipath/apollo-wind";
import { Checkbox } from "@uipath/apollo-wind/components/ui/checkbox";
import { Label } from "@uipath/apollo-wind/components/ui/label";
import type { CheckboxGroupWidgetProps } from "../types";
import { PropertyConfigMenu } from "../property-config-menu";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface PropertyCheckboxGroupProps extends CheckboxGroupWidgetProps {
  value: string[];
  onChange: (value: string[]) => void;
  supportsRefresh?: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PropertyCheckboxGroup({
  value,
  onChange,
  options,
  layout = "grid",
  columns = 2,
  supportsRefresh,
  className,
}: PropertyCheckboxGroupProps) {
  const toggle = (optValue: string) => {
    onChange(
      value.includes(optValue)
        ? value.filter((v) => v !== optValue)
        : [...value, optValue]
    );
  };

  return (
    <div className={cn("flex items-start gap-2", className)}>
      <div
        className={cn(
          "flex-1",
          layout === "vertical"
            ? "flex flex-col gap-y-1.5"
            : "grid gap-x-4 gap-y-1.5"
        )}
        style={
          layout === "grid"
            ? { gridTemplateColumns: `repeat(${columns}, 1fr)` }
            : undefined
        }
      >
        {options.map((opt) => (
          <div key={opt.value} className="flex items-center gap-1.5">
            <Checkbox
              id={`cb-${opt.value}`}
              checked={value.includes(opt.value)}
              onCheckedChange={() => toggle(opt.value)}
              className="size-3.5"
            />
            <Label
              htmlFor={`cb-${opt.value}`}
              className="cursor-pointer text-[length:var(--font-size-base)] font-normal text-foreground"
            >
              {opt.label}
            </Label>
          </div>
        ))}
      </div>

      <PropertyConfigMenu
        pattern="basic"
        triggerSize="md"
        showForceRefresh={supportsRefresh}
      />
    </div>
  );
}
