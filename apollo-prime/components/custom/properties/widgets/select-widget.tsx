"use client";

import { useState } from "react";
import { cn } from "@uipath/apollo-wind";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@uipath/apollo-wind/components/ui/select";
import { Input } from "@uipath/apollo-wind/components/ui/input";
import { Search, ChevronDown } from "lucide-react";
import type { SelectWidgetProps, SelectOption } from "../types";
import { PropertyConfigMenu } from "../property-config-menu";
import { VariablePickerTrigger } from "../variable-picker";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface PropertySelectProps extends Omit<SelectWidgetProps, "loadOptions"> {
  value: string;
  onChange: (value: string) => void;
  supportsVariables?: boolean;
  supportsRefresh?: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function groupOptions(options: SelectOption[]): Map<string, SelectOption[]> {
  const groups = new Map<string, SelectOption[]>();
  for (const opt of options) {
    const key = opt.group ?? "__ungrouped__";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(opt);
  }
  return groups;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PropertySelect({
  value,
  onChange,
  options = [],
  searchable,
  grouped,
  placeholder = "Select…",
  supportsVariables,
  supportsRefresh,
  className,
}: PropertySelectProps) {
  const [search, setSearch] = useState("");

  const filtered = searchable && search
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  const groups = grouped ? groupOptions(filtered) : null;

  return (
    <div className={cn("relative", className)}>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger className="h-8 flex-1 pr-14 !text-[length:var(--font-size-base)] [&>svg]:hidden">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {/* Search input inside dropdown */}
          {searchable && (
            <div className="flex items-center gap-1.5 border-b border-(--border-subtle) px-2 pb-1.5">
              <Search className="size-3.5 shrink-0 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="h-7 border-0 bg-transparent px-0 text-[length:var(--font-size-base)] shadow-none focus-visible:ring-0"
              />
            </div>
          )}

          {/* Grouped rendering */}
          {groups
            ? Array.from(groups.entries()).map(([group, items]) => (
                <SelectGroup key={group}>
                  {group !== "__ungrouped__" && (
                    <SelectLabel className="text-[length:calc(var(--font-size-base) - 1px)]">{group}</SelectLabel>
                  )}
                  {items.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-[length:var(--font-size-base)]">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))
            : filtered.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-[length:var(--font-size-base)]">
                  {opt.label}
                </SelectItem>
              ))}
        </SelectContent>
      </Select>

      {/* Inline icons — positioned inside the trigger, right side */}
      <div className="pointer-events-none absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center gap-0.5 [&>*]:pointer-events-auto">
        {supportsVariables && <VariablePickerTrigger />}
        <ChevronDown className="size-3.5 shrink-0 text-muted-foreground pointer-events-none" />
        <PropertyConfigMenu pattern="basic" showForceRefresh={supportsRefresh} />
      </div>
    </div>
  );
}
