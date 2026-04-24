"use client";

import { cn } from "@uipath/apollo-wind";
import { Input } from "@uipath/apollo-wind/components/ui/input";
import { Textarea } from "@uipath/apollo-wind/components/ui/textarea";
import type { TextInputWidgetProps } from "../types";
import { PropertyConfigMenu } from "../property-config-menu";
import { VariablePickerTrigger } from "../variable-picker";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface PropertyTextInputProps extends TextInputWidgetProps {
  value: string;
  onChange: (value: string) => void;
  supportsVariables?: boolean;
  supportsAdvanced?: boolean;
  supportsRefresh?: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PropertyTextInput({
  value,
  onChange,
  placeholder,
  mode = "text",
  multiline,
  units,
  min,
  max,
  supportsVariables,
  supportsAdvanced,
  supportsRefresh,
  className,
}: PropertyTextInputProps) {
  const fontClass = "!text-[length:var(--font-size-base)]";

  /* Multiline */
  if (multiline) {
    return (
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn("min-h-[60px] resize-y", fontClass, className)}
        rows={3}
      />
    );
  }

  /* Number mode */
  if (mode === "number") {
    return (
      <div className={cn("relative", className)}>
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          className={cn("h-8 pr-14 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none", fontClass)}
        />
        {units && (
          <span className="pointer-events-none absolute top-1/2 right-14 -translate-y-1/2 text-[length:calc(var(--font-size-base)-1px)] text-muted-foreground">
            {units}
          </span>
        )}
        <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center gap-0.5">
          <VariablePickerTrigger />
          <PropertyConfigMenu pattern="text" showForceRefresh={supportsRefresh} />
        </div>
      </div>
    );
  }

  /* Default text — always show config icon, optionally show variable icon */
  return (
    <div className={cn("relative", className)}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn("h-8 pr-14", fontClass)}
      />
      <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center gap-0.5">
        {supportsVariables && (
          <VariablePickerTrigger />
        )}
        <PropertyConfigMenu pattern="text" showForceRefresh={supportsRefresh} />
      </div>
    </div>
  );
}
