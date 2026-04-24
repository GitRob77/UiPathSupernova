"use client";

import { cn } from "@uipath/apollo-wind";
import { Badge } from "@uipath/apollo-wind/components/ui/badge";
import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ActivityFlowItem {
  id: string;
  label: string;
  type: string;
  icon: LucideIcon;
  iconColor?: string;
}

export interface ActivityFlowListProps {
  items: ActivityFlowItem[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ActivityFlowList({
  items,
  selectedId,
  onSelect,
  className,
}: ActivityFlowListProps) {
  return (
    <div className={cn("flex h-full items-start justify-center overflow-auto", className)}>
      <div className="flex flex-col items-center py-10">
        {items.map((item, i) => {
          const isSelected = item.id === selectedId;
          const Icon = item.icon;
          const isLast = i === items.length - 1;

          return (
            <div key={item.id} className="flex flex-col items-center">
              {/* Step number + card row */}
              <div className="flex items-center gap-3">
                {/* Step number */}
                <span className="w-5 text-right text-xs tabular-nums text-muted-foreground">
                  {i + 1}
                </span>

                {/* Activity card */}
                <button
                  type="button"
                  onClick={() => onSelect?.(item.id)}
                  className={cn(
                    "group flex h-10 min-w-[320px] cursor-pointer items-center gap-2.5 rounded-lg border bg-background px-3 transition-all",
                    isSelected
                      ? "border-primary shadow-sm ring-1 ring-primary/20"
                      : "border-(--border-subtle) hover:border-foreground/20 hover:shadow-sm"
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-md",
                      isSelected ? "bg-primary/10" : "bg-muted"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-3.5",
                        item.iconColor ?? (isSelected ? "text-primary" : "text-muted-foreground")
                      )}
                    />
                  </div>

                  {/* Label */}
                  <span
                    className={cn(
                      "flex-1 truncate text-left text-sm",
                      isSelected ? "font-medium text-foreground" : "text-foreground"
                    )}
                  >
                    {item.label}
                  </span>

                  {/* Type badge */}
                  <Badge
                    variant="secondary"
                    className="shrink-0 text-[10px] font-normal"
                  >
                    {item.type}
                  </Badge>
                </button>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="ml-8 flex h-8 items-center">
                  <div className="h-full w-px bg-(--border-subtle)" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
