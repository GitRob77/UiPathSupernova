"use client";

import { cn } from "@uipath/apollo-wind";
import { Input } from "@uipath/apollo-wind/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@uipath/apollo-wind/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@uipath/apollo-wind/components/ui/tooltip";
import { FolderOpen, Cloud, HardDrive } from "lucide-react";
import { useState } from "react";
import type { FilePickerWidgetProps } from "../types";
import { PropertyConfigMenu } from "../property-config-menu";
import { VariablePickerTrigger } from "../variable-picker";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface PropertyFilePickerProps extends FilePickerWidgetProps {
  value: string;
  onChange: (value: string) => void;
  supportsVariables?: boolean;
  supportsAdvanced?: boolean;
  supportsRefresh?: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Inline icon button                                                 */
/* ------------------------------------------------------------------ */

function InlineAction({
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
        <TooltipContent side="top" className="!text-[length:var(--font-size-base)]">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PropertyFilePicker({
  value,
  onChange,
  mode = "file",
  source = "local",
  filters,
  supportsVariables,
  supportsRefresh,
  className,
}: PropertyFilePickerProps) {
  const [activeSource, setActiveSource] = useState<string>(
    source === "both" ? "local" : source
  );

  const placeholder =
    mode === "folder" ? "Select folder…" : "Select file…";

  const hasVar = !!supportsVariables;
  // Browse + (optional) variables + always-on config menu
  const iconCount = 2 + (hasVar ? 1 : 0);
  const prClass = iconCount >= 3 ? "pr-[4.5rem]" : "pr-12";

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {/* Source selector (when both) */}
      {source === "both" && (
        <Select value={activeSource} onValueChange={setActiveSource}>
          <SelectTrigger className="h-7 !text-[length:calc(var(--font-size-base)-1px)]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="local" className="!text-[length:var(--font-size-base)]">
              <span className="flex items-center gap-1.5">
                <HardDrive className="size-3" /> Local
              </span>
            </SelectItem>
            <SelectItem value="cloud" className="!text-[length:var(--font-size-base)]">
              <span className="flex items-center gap-1.5">
                <Cloud className="size-3" /> Cloud
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      )}

      {/* Path input with inline action icons on the right */}
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn("h-8 !text-[length:var(--font-size-base)]", prClass)}
        />
        <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center gap-0.5">
          <InlineAction icon={FolderOpen} label="Browse" />
          {hasVar && <VariablePickerTrigger />}
          <PropertyConfigMenu pattern="minimal" showForceRefresh={supportsRefresh} />
        </div>
      </div>

      {/* Filter hint */}
      {filters && filters.length > 0 && (
        <p className="!text-[length:calc(var(--font-size-base)-2px)] text-muted-foreground">
          Allowed: {filters.join(", ")}
        </p>
      )}
    </div>
  );
}
