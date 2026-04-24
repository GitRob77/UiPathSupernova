"use client";

import { ScrollArea } from "@uipath/apollo-wind/components/ui/scroll-area";
import { Button } from "@uipath/apollo-wind/components/ui/button";
import { X } from "lucide-react";
import type { Breakpoint } from "./types";

export interface BreakpointsPanelProps {
  breakpoints: Breakpoint[];
  onRemove: (id: string) => void;
}

export function BreakpointsPanel({ breakpoints, onRemove }: BreakpointsPanelProps) {
  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col">
        {breakpoints.map((bp) => (
          <div
            key={bp.id}
            className="group flex h-8 items-center gap-2 px-3 hover:bg-(--surface-hover)"
          >
            <span className="size-2 shrink-0 rounded-full bg-red-500" />
            <span className="flex-1 truncate text-(--foreground)">
              {bp.label}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100"
              onClick={() => onRemove(bp.id)}
            >
              <X className="size-3" />
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
