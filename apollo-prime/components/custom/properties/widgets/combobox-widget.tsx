"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@uipath/apollo-wind";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@uipath/apollo-wind/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@uipath/apollo-wind/components/ui/popover";
import { Input } from "@uipath/apollo-wind/components/ui/input";
import { Check, ChevronDown } from "lucide-react";
import type { ComboboxWidgetProps, SelectOption } from "../types";
import { PropertyConfigMenu } from "../property-config-menu";
import { VariablePickerTrigger } from "../variable-picker";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface PropertyComboboxProps extends Omit<ComboboxWidgetProps, "loadOptions"> {
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

function filterOptions(options: SelectOption[], query: string): SelectOption[] {
  if (!query) return options;
  const q = query.toLowerCase();
  return options.filter((o) => o.label.toLowerCase().includes(q));
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PropertyCombobox({
  value,
  onChange,
  options = [],
  grouped,
  placeholder = "Search or select…",
  emptyText = "No results found.",
  supportsVariables,
  supportsRefresh,
  className,
}: PropertyComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label;
  const filtered = filterOptions(options, search);
  const groups = grouped ? groupOptions(filtered) : null;

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      if (!open) setOpen(true);
    },
    [open]
  );

  const handleSelect = useCallback(
    (selectedValue: string) => {
      onChange(selectedValue === value ? "" : selectedValue);
      setSearch("");
      setOpen(false);
      inputRef.current?.blur();
    },
    [onChange, value]
  );

  const handleFocus = useCallback(() => {
    setOpen(true);
    // When focusing, show the current value label so user can edit it
    if (value && selectedLabel) {
      setSearch(selectedLabel);
    }
  }, [value, selectedLabel]);

  const handleBlur = useCallback(() => {
    // Small delay to allow click on popover items
    setTimeout(() => {
      setSearch("");
      setOpen(false);
    }, 200);
  }, []);

  // Display value: when focused show search text, otherwise show selected label
  const displayValue = open ? search : (selectedLabel ?? "");

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <Input
            ref={inputRef}
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="h-8 pr-14 !text-[length:var(--font-size-base)]"
          />
        </PopoverAnchor>
        <PopoverContent
          className="p-0"
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
          style={{ width: "var(--radix-popover-trigger-width)" }}
        >
          <Command>
            <CommandList>
              <CommandEmpty className="py-3 text-center !text-[length:var(--font-size-base)]">
                {emptyText}
              </CommandEmpty>
              {groups
                ? Array.from(groups.entries()).map(([group, items]) => (
                    <CommandGroup
                      key={group}
                      heading={group !== "__ungrouped__" ? group : undefined}
                    >
                      {items.map((opt) => (
                        <CommandItem
                          key={opt.value}
                          value={opt.value}
                          keywords={[opt.label]}
                          onSelect={handleSelect}
                          className="!text-[length:var(--font-size-base)]"
                        >
                          {opt.label}
                          <Check
                            className={cn(
                              "ml-auto size-3.5",
                              value === opt.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))
                : filtered.map((opt) => (
                    <CommandItem
                      key={opt.value}
                      value={opt.value}
                      keywords={[opt.label]}
                      onSelect={handleSelect}
                      className="!text-[length:var(--font-size-base)]"
                    >
                      {opt.label}
                      <Check
                        className={cn(
                          "ml-auto size-3.5",
                          value === opt.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Inline icons — positioned inside the input, right side */}
      <div className="pointer-events-none absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center gap-0.5 [&>*]:pointer-events-auto">
        {supportsVariables && <VariablePickerTrigger />}
        <ChevronDown className="size-3.5 shrink-0 text-muted-foreground pointer-events-none" />
        <PropertyConfigMenu pattern="basic" showForceRefresh={supportsRefresh} />
      </div>
    </div>
  );
}
