"use client";

import { useState } from "react";
import { Button } from "@uipath/apollo-wind/components/ui/button";
import { Search } from "@uipath/apollo-wind/components/ui/search";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@uipath/apollo-wind/components/ui/dropdown-menu";
import { Separator } from "@uipath/apollo-wind/components/ui/separator";
import { ButtonGroup } from "@uipath/apollo-wind/components/ui/button-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@uipath/apollo-wind/components/ui/tooltip";
import { cn } from "@uipath/apollo-wind";
import { ChevronDown, Columns3, type LucideIcon } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FilterBarColumn {
  key: string;
  label: string;
  visible: boolean;
}

export interface FilterBarFilter {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  value?: string | string[];
  multiple?: boolean;
  onChange?: (value: string | string[]) => void;
}

export interface FilterBarViewMode {
  value: string;
  icon: LucideIcon;
  label: string;
}

export interface FilterBarAction {
  label: string;
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive" | "link";
  icon?: LucideIcon;
  onClick?: () => void;
  disabled?: boolean;
}

export interface FilterBarProps {
  /** Search box. `true` = uncontrolled, object = controlled. */
  search?: boolean | { value: string; onChange: (value: string) => void; placeholder?: string };
  /** Column visibility dropdown. */
  columns?: { items: FilterBarColumn[]; onChange: (items: FilterBarColumn[]) => void };
  /** Filter dropdown definitions. */
  filters?: FilterBarFilter[];
  /** View switcher toggle group. */
  viewSwitcher?: { modes: FilterBarViewMode[]; value: string; onChange: (value: string) => void };
  /** Right-aligned action buttons. */
  actions?: FilterBarAction[];
  /** Additional className on root. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Trigger button style (shared across dropdowns)
// ---------------------------------------------------------------------------

const triggerClassName =
  "h-8 gap-1.5 px-2.5 text-sm font-normal text-(--foreground-muted)";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FilterBarSearch({
  config,
}: {
  config: NonNullable<Exclude<FilterBarProps["search"], boolean>>;
}) {
  return (
    <Search
      value={config.value}
      onChange={config.onChange}
      placeholder={config.placeholder ?? "Search..."}
      className="h-8 w-56"
    />
  );
}

function UncontrolledFilterBarSearch() {
  const [value, setValue] = useState("");
  return (
    <Search
      value={value}
      onChange={setValue}
      placeholder="Search..."
      className="h-8 w-56"
    />
  );
}

function FilterBarColumnsDropdown({
  items,
  onChange,
}: {
  items: FilterBarColumn[];
  onChange: (items: FilterBarColumn[]) => void;
}) {
  const allVisible = items.every((c) => c.visible);
  const label = allVisible ? "All" : `${items.filter((c) => c.visible).length}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={triggerClassName}>
          <Columns3 className="h-3.5 w-3.5" />
          <span>
            Columns: <span className="font-medium text-(--foreground)">{label}</span>
          </span>
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {items.map((col) => (
          <DropdownMenuCheckboxItem
            key={col.key}
            checked={col.visible}
            onCheckedChange={(checked) => {
              onChange(
                items.map((c) =>
                  c.key === col.key ? { ...c, visible: !!checked } : c
                )
              );
            }}
            onSelect={(e) => e.preventDefault()}
          >
            {col.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FilterBarFilterDropdown({ filter }: { filter: FilterBarFilter }) {
  const isMulti = filter.multiple;
  const selected = isMulti ? ((filter.value as string[] | undefined) ?? []) : null;
  const hasValue = isMulti
    ? selected!.length > 0
    : !!filter.value;

  const displayValue = hasValue
    ? isMulti
      ? selected!.map((v) => filter.options.find((o) => o.value === v)?.label ?? v).join(", ")
      : filter.options.find((o) => o.value === filter.value)?.label
    : "Any";

  if (isMulti) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={triggerClassName}>
            <span>
              {filter.label}:{" "}
              <span className="font-medium text-(--foreground)">{displayValue}</span>
            </span>
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {filter.options.map((opt) => (
            <DropdownMenuCheckboxItem
              key={opt.value}
              checked={selected!.includes(opt.value)}
              onCheckedChange={(checked) => {
                const next = checked
                  ? [...selected!, opt.value]
                  : selected!.filter((v) => v !== opt.value);
                filter.onChange?.(next);
              }}
              onSelect={(e) => e.preventDefault()}
            >
              {opt.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={triggerClassName}>
          <span>
            {filter.label}:{" "}
            <span className="font-medium text-(--foreground)">{displayValue}</span>
          </span>
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuRadioGroup
          value={(filter.value as string) ?? ""}
          onValueChange={(v) => filter.onChange?.(v)}
        >
          {filter.options.map((opt) => (
            <DropdownMenuRadioItem key={opt.value} value={opt.value}>
              {opt.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FilterBarViewSwitcher({
  modes,
  value,
  onChange,
}: NonNullable<FilterBarProps["viewSwitcher"]>) {
  return (
    <TooltipProvider delayDuration={300}>
      <ButtonGroup>
        {modes.map((mode) => (
          <Tooltip key={mode.value}>
            <TooltipTrigger asChild>
              <Button
                variant={mode.value === value ? "default" : "outline"}
                size="sm"
                className="h-8 w-8 px-0"
                aria-label={mode.label}
                onClick={() => onChange(mode.value)}
              >
                <mode.icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{mode.label}</TooltipContent>
          </Tooltip>
        ))}
      </ButtonGroup>
    </TooltipProvider>
  );
}

function FilterBarActions({ actions }: { actions: FilterBarAction[] }) {
  return (
    <>
      {actions.map((action) => (
        <Button
          key={action.label}
          variant={action.variant ?? "outline"}
          size="sm"
          className="h-8"
          onClick={action.onClick}
          disabled={action.disabled}
        >
          {action.icon && <action.icon className="mr-1.5 h-3.5 w-3.5" />}
          {action.label}
        </Button>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Separator helper
// ---------------------------------------------------------------------------

function VerticalDivider() {
  return <Separator orientation="vertical" className="mx-1 h-5" />;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function FilterBar({
  search,
  columns,
  filters,
  viewSwitcher,
  actions,
  className,
}: FilterBarProps) {
  // Build left-side sections so we can interleave separators
  const sections: React.ReactNode[] = [];

  // Search + Columns dropdown (no separator between them)
  if (search || columns) {
    const items: React.ReactNode[] = [];
    if (search) {
      items.push(
        search === true
          ? <UncontrolledFilterBarSearch key="search" />
          : <FilterBarSearch key="search" config={search} />
      );
    }
    if (columns) {
      items.push(
        <FilterBarColumnsDropdown
          key="columns"
          items={columns.items}
          onChange={columns.onChange}
        />
      );
    }
    sections.push(
      <div key="search-columns" className="flex items-center gap-2">
        {items}
      </div>
    );
  }

  // Filter dropdowns
  if (filters && filters.length > 0) {
    sections.push(
      <div key="filters" className="flex items-center gap-1">
        {filters.map((f) => (
          <FilterBarFilterDropdown key={f.key} filter={f} />
        ))}
      </div>
    );
  }

  // View switcher
  if (viewSwitcher) {
    sections.push(
      <FilterBarViewSwitcher key="view" {...viewSwitcher} />
    );
  }

  // Interleave separators between sections
  const leftContent: React.ReactNode[] = [];
  sections.forEach((section, i) => {
    if (i > 0) {
      leftContent.push(<VerticalDivider key={`sep-${i}`} />);
    }
    leftContent.push(section);
  });

  return (
    <div className={cn("flex h-10 items-center gap-2", className)}>
      {leftContent}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right-aligned actions */}
      {actions && actions.length > 0 && (
        <FilterBarActions actions={actions} />
      )}
    </div>
  );
}
