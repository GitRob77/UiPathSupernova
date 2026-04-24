"use client";

import { Button } from "@uipath/apollo-wind/components/ui/button";
import { ScrollArea } from "@uipath/apollo-wind/components/ui/scroll-area";
import { cn } from "@uipath/apollo-wind";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@uipath/apollo-wind/components/ui/tooltip";
import type { SidebarNavItem } from "./sidebar-nav";

export interface SidebarNavItemsProps {
  items: SidebarNavItem[];
  tooltipSide?: "left" | "right";
}

export function SidebarNavItems({
  items,
  tooltipSide = "right",
}: SidebarNavItemsProps) {
  return (
    <ScrollArea className="flex-1">
      <TooltipProvider>
        <div className="flex flex-col gap-0.5 p-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "h-9 w-full justify-start gap-2.5 px-3 text-sm font-normal text-muted-foreground",
                      item.active &&
                        "bg-accent font-medium text-foreground"
                    )}
                    onClick={item.onClick}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side={tooltipSide}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </ScrollArea>
  );
}
