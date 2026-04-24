"use client";

import { useId, useSyncExternalStore } from "react";
import { cn } from "@uipath/apollo-wind";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@uipath/apollo-wind/components/ui/dropdown-menu";
import {
  Braces,
  Eraser,
  RefreshCw,
  SlidersHorizontal,
  Trash2,
  Type,
} from "lucide-react";
import {
  CreateArgumentIcon,
  CreateVariableIcon,
  VariablesIcon,
} from "@/components/custom/icons";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ConfigMenuPattern = "basic" | "text" | "output" | "minimal";

export type ConfigMenuAction =
  | "remove-property"
  | "force-refresh"
  | "text-builder"
  | "variables"
  | "change-variable"
  | "expression-editor"
  | "create-variable"
  | "create-argument"
  | "clear-value";

export interface PropertyConfigMenuProps {
  pattern: ConfigMenuPattern;
  /** Show `Remove property` at the top of the menu. Off by default — opt in per widget/field. */
  showRemoveProperty?: boolean;
  /** Show `Clear value` at the bottom of the menu. On by default; pass `false` to hide. */
  showClearValue?: boolean;
  showForceRefresh?: boolean;
  onAction?: (action: ConfigMenuAction) => void;
  /** Trigger button style. `"sm"` matches inline input icons (5x5 no border); `"md"` matches radio/toggle rows (7x7 bordered). */
  triggerSize?: "sm" | "md";
  triggerClassName?: string;
}

/* ------------------------------------------------------------------ */
/*  Menu items                                                         */
/* ------------------------------------------------------------------ */

type MenuItemDef = {
  action: ConfigMenuAction;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const USE_ITEMS_BY_PATTERN: Record<ConfigMenuPattern, MenuItemDef[]> = {
  basic: [
    { action: "variables", label: "Variables", icon: VariablesIcon },
    { action: "expression-editor", label: "Expression editor", icon: Braces },
  ],
  text: [
    { action: "text-builder", label: "Text builder", icon: Type },
    { action: "variables", label: "Variables", icon: VariablesIcon },
    { action: "expression-editor", label: "Expression editor", icon: Braces },
  ],
  output: [
    { action: "change-variable", label: "Change variable", icon: VariablesIcon },
  ],
  minimal: [{ action: "variables", label: "Variables", icon: VariablesIcon }],
};

const CREATE_ITEMS: MenuItemDef[] = [
  { action: "create-variable", label: "Create variable", icon: CreateVariableIcon },
  { action: "create-argument", label: "Create argument", icon: CreateArgumentIcon },
];

/* ------------------------------------------------------------------ */
/*  Exclusive-open store — only one config menu open at a time         */
/* ------------------------------------------------------------------ */

let openMenuId: string | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return openMenuId;
}

function setOpenMenuId(id: string | null) {
  if (openMenuId === id) return;
  openMenuId = id;
  listeners.forEach((l) => l());
}

/* ------------------------------------------------------------------ */
/*  Trigger                                                            */
/* ------------------------------------------------------------------ */

function triggerClasses(size: "sm" | "md") {
  if (size === "md") {
    return "flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md border border-(--border-subtle) text-muted-foreground hover:bg-accent hover:text-foreground";
  }
  return "flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-[3px] text-muted-foreground hover:bg-accent hover:text-foreground";
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PropertyConfigMenu({
  pattern,
  showRemoveProperty,
  showClearValue = true,
  showForceRefresh,
  onAction,
  triggerSize = "sm",
  triggerClassName,
}: PropertyConfigMenuProps) {
  const useItems = USE_ITEMS_BY_PATTERN[pattern];
  const hasTopSection = showForceRefresh || showRemoveProperty;

  const handle = (action: ConfigMenuAction) => () => onAction?.(action);

  const menuId = useId();
  const activeId = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const isOpen = activeId === menuId;
  const handleOpenChange = (open: boolean) => {
    setOpenMenuId(open ? menuId : activeId === menuId ? null : activeId);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className={cn(triggerClasses(triggerSize), triggerClassName)}
          aria-label="Open configuration"
        >
          <SlidersHorizontal className="size-3.5" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="min-w-[220px]"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {/* Top section — Force refresh + Remove property */}
        {showForceRefresh && (
          <DropdownMenuItem onSelect={handle("force-refresh")}>
            <RefreshCw className="size-3.5" />
            Force refresh
          </DropdownMenuItem>
        )}
        {showForceRefresh && showRemoveProperty && <DropdownMenuSeparator className="bg-(--border-subtle)" />}
        {showRemoveProperty && (
          <DropdownMenuItem onSelect={handle("remove-property")}>
            <Trash2 className="size-3.5" />
            Remove property
          </DropdownMenuItem>
        )}

        {/* Use section — leading divider only when something is above */}
        {useItems.length > 0 && (
          <>
            {hasTopSection && (
              <DropdownMenuSeparator className="bg-(--border-subtle)" />
            )}
            <DropdownMenuLabel className="text-muted-foreground">
              Use
            </DropdownMenuLabel>
            {useItems.map((item) => {
              const Icon = item.icon;
              return (
                <DropdownMenuItem
                  key={item.action}
                  onSelect={handle(item.action)}
                >
                  <Icon className="size-3.5" />
                  {item.label}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator className="bg-(--border-subtle)" />
          </>
        )}

        {/* Create section */}
        {useItems.length === 0 && hasTopSection && <DropdownMenuSeparator className="bg-(--border-subtle)" />}
        {CREATE_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <DropdownMenuItem
              key={item.action}
              onSelect={handle(item.action)}
            >
              <Icon className="size-3.5" />
              {item.label}
            </DropdownMenuItem>
          );
        })}

        {/* Bottom section — Clear value */}
        {showClearValue && (
          <>
            <DropdownMenuSeparator className="bg-(--border-subtle)" />
            <DropdownMenuItem onSelect={handle("clear-value")}>
              <Eraser className="size-3.5" />
              Clear value
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
