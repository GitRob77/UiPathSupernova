"use client";

import { cn } from "@uipath/apollo-wind";
import {
  RadioGroup,
  RadioGroupItem,
} from "@uipath/apollo-wind/components/ui/radio-group";
import { Label } from "@uipath/apollo-wind/components/ui/label";
import type { RadioGroupWidgetProps } from "../types";
import { PropertyConfigMenu } from "../property-config-menu";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface PropertyRadioGroupProps extends RadioGroupWidgetProps {
  value: string | null;
  onChange: (value: string | null) => void;
  supportsRefresh?: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PropertyRadioGroup({
  value,
  onChange,
  options,
  nullable,
  direction = "horizontal",
  supportsRefresh,
  className,
}: PropertyRadioGroupProps) {
  return (
    <div className={cn("flex items-start gap-2", className)}>
      <RadioGroup
        value={value ?? undefined}
        onValueChange={(v) => {
          if (nullable && v === value) {
            onChange(null);
          } else {
            onChange(v);
          }
        }}
        className={cn(
          "flex flex-1",
          direction === "vertical"
            ? "flex-col gap-y-1.5"
            : "flex-wrap gap-x-4 gap-y-1.5"
        )}
      >
        {options.map((opt) => (
          <div key={opt.value} className="flex items-center gap-1.5">
            <RadioGroupItem value={opt.value} id={`radio-${opt.value}`} className="size-3.5" />
            <Label
              htmlFor={`radio-${opt.value}`}
              className="cursor-pointer text-[length:var(--font-size-base)] font-normal text-foreground"
            >
              {opt.label}
            </Label>
          </div>
        ))}
      </RadioGroup>

      <PropertyConfigMenu
        pattern="basic"
        triggerSize="md"
        showForceRefresh={supportsRefresh}
      />
    </div>
  );
}
