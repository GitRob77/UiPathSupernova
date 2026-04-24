"use client";

import { useState } from "react";
import { Button } from "@uipath/apollo-wind/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@uipath/apollo-wind/components/ui/dropdown-menu";
import { cn } from "@uipath/apollo-wind";
import {
  ChevronDown,
  Play,
  StepForward,
  Rocket,
  Settings,
  Cloud,
  Monitor,
  Upload,
  type LucideIcon,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ToolbarItem {
  /** Unique key */
  key: string;
  /** Button label */
  label: string;
  /** Optional icon */
  icon?: LucideIcon;
  /** Click handler (for simple buttons) */
  onClick?: () => void;
  /** Dropdown menu items (makes this a dropdown button) */
  menu?: ToolbarMenuItem[];
  /** If true, renders as a split button (main action + dropdown chevron) */
  split?: boolean;
  /** Button variant */
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive";
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Additional className applied to button(s) */
  className?: string;
}

export interface ToolbarMenuItem {
  /** Unique key */
  key: string;
  /** Display label */
  label: string;
  /** Optional icon */
  icon?: LucideIcon;
  /** Click handler */
  onClick?: () => void;
  /** If true, renders a group label instead of clickable item */
  isLabel?: boolean;
  /** If true, renders a separator after this item */
  separatorAfter?: boolean;
}

export interface ToolbarProps {
  /** Toolbar items (buttons and dropdowns) */
  items: ToolbarItem[];
  /** Element rendered before the items (e.g. a home icon aligned with the left rail) */
  leadingElement?: React.ReactNode;
  /** Additional className */
  className?: string;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ToolbarDropdownButton({ item }: { item: ToolbarItem }) {
  const Icon = item.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={item.variant ?? "ghost"}
          size="sm"
          className="h-7 gap-1 pl-4 pr-2 text-xs font-normal"
          disabled={item.disabled}
        >
          {Icon && <Icon className="h-4 w-4" />}
          {item.label}
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {item.menu!.map((menuItem) => {
          if (menuItem.isLabel) {
            return (
              <div key={menuItem.key}>
                <DropdownMenuLabel>{menuItem.label}</DropdownMenuLabel>
                {menuItem.separatorAfter && <DropdownMenuSeparator />}
              </div>
            );
          }

          const MenuIcon = menuItem.icon;
          return (
            <div key={menuItem.key}>
              <DropdownMenuItem onClick={menuItem.onClick}>
                {MenuIcon && <MenuIcon className="mr-2 h-4 w-4" />}
                {menuItem.label}
              </DropdownMenuItem>
              {menuItem.separatorAfter && <DropdownMenuSeparator />}
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ToolbarSplitButton({ item }: { item: ToolbarItem }) {
  const Icon = item.icon;
  const variant = item.variant ?? "ghost";

  return (
    <div className="flex items-center">
      <Button
        variant={variant}
        size="sm"
        className={cn("h-7 gap-1 !rounded-r-none pl-4 pr-2 text-xs font-normal", item.className)}
        onClick={item.onClick}
        disabled={item.disabled}
      >
        {Icon && <Icon className="h-4 w-4" />}
        {item.label}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size="sm"
            className={cn("h-7 !rounded-l-none px-1", item.className)}
            disabled={item.disabled}
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {item.menu!.map((menuItem) => {
            if (menuItem.isLabel) {
              return (
                <div key={menuItem.key}>
                  <DropdownMenuLabel>{menuItem.label}</DropdownMenuLabel>
                  {menuItem.separatorAfter && <DropdownMenuSeparator />}
                </div>
              );
            }

            const MenuIcon = menuItem.icon;
            return (
              <div key={menuItem.key}>
                <DropdownMenuItem onClick={menuItem.onClick}>
                  {MenuIcon && <MenuIcon className="mr-2 h-4 w-4" />}
                  {menuItem.label}
                </DropdownMenuItem>
                {menuItem.separatorAfter && <DropdownMenuSeparator />}
              </div>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ToolbarButton({ item }: { item: ToolbarItem }) {
  const Icon = item.icon;

  return (
    <Button
      variant={item.variant ?? "ghost"}
      size="sm"
      className="h-7 gap-1 pl-4 pr-2 text-xs font-normal"
      onClick={item.onClick}
      disabled={item.disabled}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {item.label}
    </Button>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function Toolbar({ items, leadingElement, className }: ToolbarProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center border-b border-(--border-subtle) bg-(--background-default)",
        leadingElement ? "gap-3 py-2.5 pr-2" : "gap-3 px-2 py-2.5",
        className
      )}
    >
      {leadingElement}
      {items.map((item) =>
        item.menu && item.menu.length > 0 ? (
          item.split ? (
            <ToolbarSplitButton key={item.key} item={item} />
          ) : (
            <ToolbarDropdownButton key={item.key} item={item} />
          )
        ) : (
          <ToolbarButton key={item.key} item={item} />
        )
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Default toolbar preset (Debug / Debug step-by-step / Deploy+Publish)
// ---------------------------------------------------------------------------

export function useDefaultToolbarItems(): ToolbarItem[] {
  const [debugEnv, setDebugEnv] = useState<"local" | "cloud">("cloud");

  return [
    {
      key: "debug",
      label: debugEnv === "cloud" ? "Debug on cloud" : "Debug on local machine",
      icon: Play,
      split: true,
      menu: [
        {
          key: "debug-env-label",
          label: "Debug environment",
          isLabel: true,
        },
        {
          key: "debug-local",
          label: "On local machine",
          icon: Monitor,
          onClick: () => setDebugEnv("local"),
        },
        {
          key: "debug-cloud",
          label: "On cloud",
          icon: Cloud,
          onClick: () => setDebugEnv("cloud"),
          separatorAfter: true,
        },
        {
          key: "debug-config",
          label: "Debug configuration",
          icon: Settings,
        },
        {
          key: "deploy-debug",
          label: "Deploy solution for debugging",
          icon: Upload,
        },
      ],
    },
    {
      key: "debug-step",
      label: "Debug step-by-step",
      icon: StepForward,
    },
    {
      key: "deploy",
      label: "Deploy",
      icon: Rocket,
      variant: "default",
      split: true,
      menu: [
        {
          key: "publish",
          label: "Publish",
          icon: Upload,
        },
      ],
    },
  ];
}
