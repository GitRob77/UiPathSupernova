"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { cn } from "@uipath/apollo-wind";
import { Input } from "@uipath/apollo-wind/components/ui/input";
import { Badge } from "@uipath/apollo-wind/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@uipath/apollo-wind/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandItem,
  CommandList,
} from "@uipath/apollo-wind/components/ui/command";
import { X, Globe, MapPin } from "lucide-react";
import type { TagInputWidgetProps, TagSuggestion } from "../types";
import { PropertyConfigMenu } from "../property-config-menu";
import { VariablePickerTrigger } from "../variable-picker";

/* ------------------------------------------------------------------ */
/*  Icon map for chip icons                                            */
/* ------------------------------------------------------------------ */

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe,
  MapPin,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function normalizeSuggestions(
  suggestions: (string | TagSuggestion)[]
): TagSuggestion[] {
  return suggestions.map((s) =>
    typeof s === "string" ? { value: s, label: s } : s
  );
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface PropertyTagInputProps extends TagInputWidgetProps {
  value: string[];
  onChange: (value: string[]) => void;
  supportsVariables?: boolean;
  supportsRefresh?: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PropertyTagInput({
  value,
  onChange,
  placeholder = "Type and press Enter…",
  suggestions = [],
  allowCustom = true,
  max,
  supportsVariables,
  supportsRefresh,
  className,
}: PropertyTagInputProps) {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const normalized = useMemo(
    () => normalizeSuggestions(suggestions),
    [suggestions]
  );

  const addTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim();
      if (!trimmed) return;
      if (value.includes(trimmed)) return;
      if (max && value.length >= max) return;
      onChange([...value, trimmed]);
      setInput("");
      setOpen(false);
    },
    [value, onChange, max]
  );

  const removeTag = useCallback(
    (tag: string) => {
      onChange(value.filter((v) => v !== tag));
    },
    [value, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "," || e.key === ";") {
        e.preventDefault();
        if (allowCustom && input.trim()) addTag(input);
      } else if (e.key === "Backspace" && !input && value.length > 0) {
        removeTag(value[value.length - 1]);
      }
    },
    [input, value, addTag, removeTag, allowCustom]
  );

  const filtered = normalized.filter(
    (s) =>
      !value.includes(s.value) &&
      s.label.toLowerCase().includes(input.toLowerCase())
  );

  const atMax = max !== undefined && value.length >= max;

  const handleFocus = useCallback(() => {
    setOpen(true);
  }, []);

  const handleBlur = useCallback(() => {
    setTimeout(() => setOpen(false), 200);
  }, []);

  return (
    <div className={cn("relative", className)}>
      <Popover open={open && filtered.length > 0} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          {/* Tags + input container */}
          <div
            className="flex min-h-[32px] flex-wrap items-start gap-1 rounded-md border border-input bg-background px-2 py-1 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500"
            onClick={() => inputRef.current?.focus()}
          >
            {/* Chips + input area */}
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
              {value.map((tag) => {
                const suggestion = normalized.find((s) => s.value === tag);
                const IconComp = suggestion?.icon
                  ? iconMap[suggestion.icon]
                  : undefined;
                return (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="gap-1 border-blue-200 bg-blue-50 py-0 text-[length:var(--font-size-base)] font-normal text-blue-700"
                  >
                    {IconComp && <IconComp className="size-3" />}
                    {suggestion?.label ?? tag}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTag(tag);
                      }}
                      className="ml-0.5 cursor-pointer rounded-sm hover:bg-blue-100"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                );
              })}
              {!atMax && (
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    if (!open) setOpen(true);
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder={value.length === 0 ? placeholder : ""}
                  className="h-6 min-w-[80px] flex-1 border-0 bg-transparent p-0 !text-[length:var(--font-size-base)] shadow-none focus-visible:ring-0"
                />
              )}
            </div>

            {/* Inline icons — pinned top-right, chips wrap before reaching them */}
            <div className="flex h-6 shrink-0 items-center gap-0.5">
              {supportsVariables && <VariablePickerTrigger />}
              <PropertyConfigMenu pattern="text" showForceRefresh={supportsRefresh} />
            </div>
          </div>
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
                No suggestions found.
              </CommandEmpty>
              {filtered.map((s) => {
                const IconComp = s.icon ? iconMap[s.icon] : undefined;
                return (
                  <CommandItem
                    key={s.value}
                    value={s.value}
                    keywords={[s.label]}
                    onSelect={() => addTag(s.value)}
                    className="!text-[length:var(--font-size-base)]"
                  >
                    {IconComp && <IconComp className="mr-2 size-3.5 text-muted-foreground" />}
                    {s.label}
                  </CommandItem>
                );
              })}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

    </div>
  );
}
