"use client";

import { memo } from "react";
import { cn } from "@uipath/apollo-wind";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@uipath/apollo-wind/components/ui/tooltip";
import { AtSign, Grid3X3, AlertCircle } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface PropertyFieldProps {
  label: string;
  required?: boolean;
  error?: string | null;
  helpText?: string;
  defaultHint?: string;
  direction?: "input" | "output";
  isOutput?: boolean;
  supportsVariables?: boolean;
  supportsAdvanced?: boolean;
  children: React.ReactNode;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Icon button                                                        */
/* ------------------------------------------------------------------ */

function FieldAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onClick}
            className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-[3px] text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Icon className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-[length:var(--font-size-base)]">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* ------------------------------------------------------------------ */
/*  PropertyField                                                      */
/* ------------------------------------------------------------------ */

export const PropertyField = memo(function PropertyField({
  label,
  required,
  error,
  helpText,
  defaultHint,
  direction,
  isOutput,
  supportsVariables,
  supportsAdvanced,
  children,
  className,
}: PropertyFieldProps) {
  const isReadOnly = direction === "output";

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {/* Label row */}
      <div className="flex items-center gap-1">
        <label className="flex-1 truncate text-[length:var(--font-size-base)] font-medium text-foreground">
          {label}
          {required && <span> *</span>}
          {isOutput && (
            <span className="ml-1.5 text-[length:calc(var(--font-size-base) - 2px)] font-normal text-muted-foreground">
              Output
            </span>
          )}
        </label>

        {/* Action icons */}
        <div className="flex shrink-0 items-center gap-0.5">
          {supportsVariables && (
            <FieldAction icon={AtSign} label="Use variable" />
          )}
          {supportsAdvanced && (
            <FieldAction icon={Grid3X3} label="Advanced editor" />
          )}
        </div>
      </div>

      {/* Widget slot */}
      <div
        className={cn(
          "relative",
          error && "[&>*:first-child]:border-destructive"
        )}
      >
        {children}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-1 text-[length:calc(var(--font-size-base) - 1px)] text-destructive">
          <AlertCircle className="size-3 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Help text */}
      {helpText && !error && (
        <p className="text-[length:var(--font-size-s)] leading-tight text-muted-foreground">
          {helpText}
        </p>
      )}

      {/* Default hint */}
      {defaultHint && !error && !helpText && (
        <p className="text-[length:calc(var(--font-size-base) - 1px)] italic text-muted-foreground">
          {defaultHint}
        </p>
      )}
    </div>
  );
});
