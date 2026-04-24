"use client";

import { Button } from "@uipath/apollo-wind/components/ui/button";
import {
  Avatar,
  AvatarFallback,
} from "@uipath/apollo-wind/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@uipath/apollo-wind/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@uipath/apollo-wind/components/ui/tooltip";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@uipath/apollo-wind/components/ui/tabs";
import {
  Search,
  Bell,
  CircleHelp,
  Sparkles,
  Grip,
  ChevronDown,
  ChevronRight,
  Zap,
  LayoutGrid,
  Database,
  ClipboardCheck,
  GraduationCap,
  ShoppingBag,
  BookOpen,
  Shield,
  Home,
  Play,
  Save,
  Layers,
  Circle,
  SquareX,
  Stethoscope,
  Monitor,
} from "lucide-react";

export interface ViewSwitchItem {
  /** Unique value for the toggle item */
  value: string;
  /** Display label */
  label: string;
  /** Whether this item is visually separated from the rest */
  separated?: boolean;
}

function ActionButton({
  icon: Icon,
  label,
  hasDropdown = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hasDropdown?: boolean;
}) {
  if (hasDropdown) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-7 gap-0.5 px-2 text-muted-foreground"
          >
            <Icon className="h-4 w-4" />
            <ChevronDown className="h-3 w-3 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem>{label}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export interface AppHeaderProps {
  /** Product name displayed after the UiPath logo */
  productName?: string;
  /** Show the waffle/grid menu button (default true) */
  showWaffle?: boolean;
  /** Show the product name label (default true) */
  showProductName?: boolean;
  /** Show the canvas app menu (studio icon + chevron) with Studio-style dropdown */
  canvasMenu?: boolean;
  /** Show the tenant selector (multi-tenant mode) */
  multiTenant?: boolean;
  /** Current tenant name (used when multiTenant is true) */
  tenantName?: string;
  /** Show the notification indicator dot on the bell icon */
  notificationDot?: boolean;
  /** Show the Autopilot (sparkles) icon */
  autopilot?: boolean;
  /** User initials for the avatar */
  userInitials?: string;
  /** Center view switch toggle items */
  viewSwitch?: ViewSwitchItem[];
  /** Currently active view switch value */
  viewSwitchValue?: string;
  /** Callback when view switch changes */
  onViewSwitchChange?: (value: string) => void;
  /** Callback when search is clicked */
  onSearchClick?: () => void;
  /** Callback when autopilot is clicked */
  onAutopilotClick?: () => void;
  /** Callback when notifications is clicked */
  onNotificationsClick?: () => void;
  /** Callback when help is clicked */
  onHelpClick?: () => void;
  /** Callback when profile is clicked */
  onProfileClick?: () => void;
  /** Callback when waffle menu is clicked */
  onWaffleClick?: () => void;
  /** Show Studio-style action buttons in the title bar (Run, Save, etc.). Default false. */
  titleBarActions?: boolean;
}

export function AppHeader({
  productName = "Product",
  showWaffle = true,
  showProductName = true,
  canvasMenu = false,
  multiTenant = true,
  tenantName = "Production",
  notificationDot = false,
  autopilot = true,
  userInitials = "LM",
  viewSwitch,
  viewSwitchValue,
  onViewSwitchChange,
  onSearchClick,
  onAutopilotClick,
  onNotificationsClick,
  onHelpClick,
  onProfileClick,
  onWaffleClick,
  titleBarActions = false,
}: AppHeaderProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <header className="grid h-12 grid-cols-[1fr_auto_1fr] items-center border-b border-border-subtle bg-background px-3">
        {/* Left section: Waffle + Logo + Product */}
        <div className="flex items-center gap-2">
          {/* Waffle menu */}
          {showWaffle && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="-ml-1 h-8 w-8 text-muted-foreground"
                  onClick={onWaffleClick}
                >
                  <Grip className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Menu</TooltipContent>
            </Tooltip>
          )}

          {/* Canvas app menu */}
          {canvasMenu && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 gap-1.5 px-2 text-muted-foreground"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/studio.svg" alt="Studio" className="-ml-1.5 h-5 w-5" />
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuItem className="flex items-center justify-between">
                  File <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center justify-between">
                  Edit <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center justify-between">
                  Design <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center justify-between">
                  Debug <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center justify-between">
                  Setup <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-(--border-subtle)" />
                <DropdownMenuItem className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" /> Automation Hub
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 text-muted-foreground" /> Orchestrator
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" /> DevOps
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" /> Data Service
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-muted-foreground" /> Test Manager
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-(--border-subtle)" />
                <DropdownMenuItem className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" /> Academy
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" /> Marketplace
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" /> Documentation
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-(--border-subtle)" />
                <DropdownMenuItem className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" /> Admin
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Title bar action buttons */}
          {titleBarActions && (
            <>
              <div className="h-5 w-px bg-(--border-subtle)" />
              <div className="flex items-center gap-1">
                <ActionButton icon={Home} label="Home" />
                <div className="h-5 w-px bg-(--border-subtle)" />
                <ActionButton icon={Play} label="Run" hasDropdown />
                <ActionButton icon={Save} label="Save" hasDropdown />
                <ActionButton icon={Layers} label="Publish" />
                <ActionButton icon={Circle} label="Record" />
                <div className="mx-1 h-5 w-px bg-(--border-subtle)" />
                <ActionButton icon={SquareX} label="Stop" hasDropdown />
                <ActionButton icon={Stethoscope} label="Analyze" hasDropdown />
                <ActionButton icon={Monitor} label="Evaluate" hasDropdown />
              </div>
            </>
          )}

          {/* Product name */}
          {showProductName && (
            <span className="text-base font-logo font-bold">{productName}</span>
          )}
        </div>

        {/* Center section: View Switch */}
        <div className="flex flex-1 items-center justify-center">
          {viewSwitch && viewSwitch.length > 0 && (
            <Tabs
              value={viewSwitchValue}
              onValueChange={(val) => onViewSwitchChange?.(val)}
            >
              <TabsList className="h-8 gap-2 bg-(--color-background-secondary)">
                {viewSwitch.flatMap((item) =>
                  item.separated
                    ? [
                        <div key={`sep-${item.value}`} className="h-4 w-px self-center bg-(--border-subtle)" />,
                        <TabsTrigger key={item.value} value={item.value} className="px-3 py-1 text-xs">
                          {item.label}
                        </TabsTrigger>,
                      ]
                    : [
                        <TabsTrigger key={item.value} value={item.value} className="px-3 py-1 text-xs">
                          {item.label}
                        </TabsTrigger>,
                      ]
                )}
              </TabsList>
            </Tabs>
          )}
        </div>

        {/* Right section: Actions */}
        <div className="flex items-center justify-end gap-0.5">
          {/* Search */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                onClick={onSearchClick}
              >
                <Search className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Search</TooltipContent>
          </Tooltip>

          {/* Autopilot */}
          {autopilot && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground"
                  onClick={onAutopilotClick}
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Autopilot</TooltipContent>
            </Tooltip>
          )}

          {/* Notifications */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 text-muted-foreground"
                onClick={onNotificationsClick}
              >
                <Bell className="h-4 w-4" />
                {notificationDot && (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>

          {/* Help */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                onClick={onHelpClick}
              >
                <CircleHelp className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Help</TooltipContent>
          </Tooltip>

          {/* Tenant selector (multi-tenant only) */}
          {multiTenant && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="ml-3 h-8 gap-1.5 px-2 text-xs font-normal text-muted-foreground"
                  >
                    <span className="font-medium text-foreground">{tenantName}</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Production</DropdownMenuItem>
                  <DropdownMenuItem>Staging</DropdownMenuItem>
                  <DropdownMenuItem>Development</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          )}

          {/* Profile avatar */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="ml-3 cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={onProfileClick}
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-(--color-background-gray) text-[10px] font-medium text-(--color-foreground-de-emp)">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </TooltipTrigger>
            <TooltipContent>Profile</TooltipContent>
          </Tooltip>
        </div>
      </header>
    </TooltipProvider>
  );
}
